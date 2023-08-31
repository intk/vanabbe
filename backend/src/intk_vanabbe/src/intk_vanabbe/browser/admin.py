# from intk_vanabbe.importer import get_filename
from .importer import import_images
from collections import defaultdict
from intk_vanabbe.config import DATA_REPO
from intk_vanabbe.config import IMAGE_BASE_URL
from intk_vanabbe.config import IMPORT_LOCATIONS
from plone.api import portal
from plone.app.multilingual.api import get_translation_manager
from plone.protect.interfaces import IDisableCSRFProtection
from Products.Five.browser import BrowserView
from zope.interface import alsoProvides

import json
import logging
import lxml.etree
import os
import transaction


logger = logging.getLogger('vubis')


def _get_filenames():
    repo = DATA_REPO
    filenames = [
        os.path.join(repo, f)
        for f in next(os.walk(repo), (None, None, []))[2]
        if f.endswith(".xml")
    ]
    return filenames


def find_files(search):
    found = []
    for fname in _get_filenames():
        with open(fname) as f:
            content = f.read()
            if search in content:
                found.append(fname)

    return found


class AdminFixes(BrowserView):
    """Vubis import on demand, for debugging"""

    def reindex_decades(self):
        site = portal.get()
        catalog = site.portal_catalog
        brains = catalog.searchResults(portal_type=['artwork'])
        print(f"Will reindex {len(brains)} records")

        for count, brain in enumerate(brains):
            brain.getObject().reindexObject(
                idxs=['decades'], update_metadata=True)
            if count % 1000 == 0:
                transaction.commit()
                logger.info(f"Processed {count}")

        brains = catalog.searchResults(portal_type=['publication'])
        print(f"Will reindex {len(brains)} records")

        # 'publication_type', 'publication_decades',
        for count, brain in enumerate(brains):
            brain.getObject().reindexObject(
                idxs=['bookDatePublished'], update_metadata=True)
            if count % 1000 == 0:
                transaction.commit()
                logger.info(f"Processed {count}")

        return "Done"

    def reindex_publications(self):
        site = portal.get()
        catalog = site.portal_catalog
        brains = catalog.searchResults(portal_type='publication')
        print(f"Will reindex {len(brains)} records")

        for count, brain in enumerate(brains):
            brain.getObject().reindexObject(
                idxs=['publication_type', 'decades', 'publication_decades',
                      'bookDatePublished'], update_metadata=True)
            if count % 1000 == 0:
                transaction.commit()
                logger.info(f"Processed {count}")

        return "Done"

    def import_objectvisible(self):
        site = portal.get()
        catalog = site.portal_catalog

        for brain in catalog.searchResults(portal_type="artwork"):
            brain.getObject().objectIsVisible = False

        to_import = find_files("<objectIsVisible>1</objectIsVisible>")

        recordnumbers = []
        for fpath in to_import:
            fname = fpath.rsplit('/', 1)[-1].split('.')[0]
            recordnumbers.append(fname)

        for nr in recordnumbers:
            brains = catalog.searchResults(recordnumber=int(nr))
            for brain in brains:
                obj = brain.getObject()
                obj.objectIsVisible = True
                obj.reindexObject(idxs=['objectIsVisible'])
                logger.info("Fixed %s", obj.absolute_url(relative=1))

        return "ok"

    def import_dimensions(self):
        to_import = find_files("</Dimensions>")

        recordnumbers = []
        for fpath in to_import:
            fname = fpath.rsplit('/', 1)[-1].split('.')[0]
            recordnumbers.append(fname)

        site = portal.get()
        catalog = site.portal_catalog

        for fpath in to_import:
            with open(fpath) as f:
                xml = f.read()
            element = lxml.etree.fromstring(xml)
            dimensions = element.xpath("//dc_record/Dimensions/text()")[0]

            recordnumber = fpath.rsplit('/', 1)[-1].split('.')[0]
            brains = catalog.searchResults(recordnumber=int(recordnumber))

            for brain in brains:
                obj = brain.getObject()
                obj.dimensions = str(dimensions or "")
                logger.info("Fixed %s", obj.absolute_url(relative=1))

        return "ok"

    def import_images(self):
        to_import = find_files("</objectImage>")
        print(f"To import: {len(to_import)}")

        site = portal.get()
        catalog = site.portal_catalog

        processed_brains = 0
        error_urls = []
        for fpath in to_import:
            with open(fpath) as f:
                xml = f.read()
            element = lxml.etree.fromstring(xml)
            img_urls = element.xpath("//dc_record/objectImage/text()")
            img_count = len(img_urls)

            recordnumber = fpath.rsplit('/', 1)[-1].split('.')[0]
            brains = catalog.searchResults(recordnumber=int(recordnumber))

            for brain in brains:
                obj = brain.getObject()

                if obj.portal_type == 'artwork':
                    urls = []
                    for fname in img_urls:
                        if 'http' not in fname:
                            fname = IMAGE_BASE_URL % fname
                        urls.append(fname)
                    img_urls = urls

                childrenIds = obj.contentIds()

                if len(childrenIds) != img_count:
                    processed_brains += 1
                    errors = import_images(obj, img_urls, use_archive=True)
                    error_urls.extend(errors)

        return f"Processed: {processed_brains}\n{error_urls}"

    def import_artworks(self):
        to_import = find_files("</AuthorBio>")

        site = portal.get()
        catalog = site.portal_catalog

        for fpath in to_import:
            recordnumber = fpath.rsplit('/', 1)[-1].split('.')[0]

            brains = catalog.searchResults(recordnumber=int(recordnumber))

            with open(fpath) as f:
                xml = f.read()

            element = lxml.etree.fromstring(xml)


            fields = [
                "objectPosition",
                "objectFormatWidth",
                "objectFormatDepth",
                "objectFormatLength",
                "objectKeys",
            ]
            intl_fields = ["ObjectAudio", "ObjectVideo"]

            info = {'nl': {}, 'en': {}}
            intl = {'nl': {}, 'en': {}}
            dirty = False

            rawdata = element.xpath("//dc_record")[0]
            info['nl']['rawdata'] = lxml.etree.tostring(rawdata)
            info['en']['rawdata'] = lxml.etree.tostring(rawdata)


            titles = element.xpath("//dc_record/objectTitle")
            if len(titles) > 1:
                titles.sort(key=lambda x: x.get("Rangorde") or "")
                title = titles[0].text
                info['nl']['objectTitle'] = title
                info['en']['objectTitle'] = title
                dirty = True

            for attr in fields:
                value = element.xpath(f"//dc_record/{attr}/text()")
                if value:
                    dirty = True
                    info['en'][attr] = str(value[0])
                    info['nl'][attr] = str(value[0])

                    # If the current attribute is 'objectPosition' and the value is not empty
                    if attr == "objectPosition" and str(value[0]).strip():
                        info['en']['objectOnDisplay'] = True
                        info['nl']['objectOnDisplay'] = True

            for field in intl_fields:
                for lang in intl.keys():
                    els = element.xpath(
                        f"//dc_record/{field}[@Language='{lang.upper()}']")
                    if not els:
                        continue
                    dirty = True
                    intl[lang][field] = [
                        {"title": (el.get("Title") or "").strip(),
                            "filename": (el.text or "").strip()}
                        for el in els
                    ]

            for lang in intl.keys():
                fields = element.xpath(
                    f"//dc_record/objectDescription[@Language='{lang.upper()}']")
                if len(fields) > 1:
                    dirty = True
                    for el in fields:
                        title = el.get('Title')
                        scope = el.get('Scope')
                        if title or scope:
                            info[lang]['objectDescription_extra'] = str(
                                el.text)
                            info[lang]['objectDescription_extra_title'] = title
                            info[lang]['objectDescription_extra_scope'] = scope
                        else:
                            info[lang]['objectDescription'] = str(el.text)

            if not dirty:
                continue
            for brain in brains:
                obj = brain.getObject()
                lang = obj.language
                for k, v in info[lang].items():
                    if v:
                        setattr(obj, k, v)

                for k, v in intl[lang].items():
                    if v:
                        setattr(obj, k, json.dumps(v))

                logger.info("Fixed %s", obj.absolute_url(relative=1))
                obj.reindexObject(
                    idxs=['objectTitle', 'Title', 'sortable_title'])

        return "done"

    def clean_duplicates(self):
        site = portal.get()
        catalog = site.portal_catalog

        duplicates = set()

        index = catalog._catalog.indexes['recordnumber']
        for recn, uids in index.items():
            if len(uids) > 2:
                for uid in uids:
                    duplicates.add(index._unindex[uid])

        results = defaultdict(list)
        for recn in duplicates:
            brains = catalog.searchResults(recordnumber=recn)
            results[recn] = [b.getURL() for b in brains]

        return results or "no duplicates"

    def fix_translations(self):
        site = portal.get()
        catalog = site.portal_catalog

        cts = ['artwork', 'exhibition', 'publication']
        brains = catalog.searchResults(portal_type=cts, Language='nl')
        untranslated = []

        for i, brain in enumerate(brains):
            if not catalog.searchResults(
                    Language='en', TranslationGroup=brain.TranslationGroup):
                untranslated.append(brain)

            if i % 1000 == 0:
                print(f"Count: {i}")

        print(f"Untranslated: {len(untranslated)}")

        return [b.getURL() for b in untranslated]

    def find_unindexed(self):
        # site = portal.get()
        # catalog = site.portal_catalog

        for ptype in IMPORT_LOCATIONS.keys():
            container = get_base_folder(self.context, ptype)
            logger.info(f"Indexing {container.absolute_url(relative=1)}")

            ids = container.contentIds()
            print(f"original: {len(ids)}")
            intl_mgr = get_translation_manager(container)
            trans_container = intl_mgr.get_translation("en")
            ids = trans_container.contentIds()

            for i, id in enumerate(ids):
                obj = trans_container[id]
                obj.reindexObject()
                if i % 500 == 0:
                    transaction.commit()
                    print(f"Commit {i}")

            print(f"translations: {len(ids)}")

    def fix_untitled(self):
        site = portal.get()
        catalog = site.portal_catalog

        # nls = catalog(portal_type="publication", Language="nl")
        ens = catalog(portal_type=["publication",
                      "artwork", "exhibition"], Language="en")

        for b in ens:
            if not b.Title:
                logger.info(f"Fixing {b.getURL()}")
                obj = b.getObject()
                trans = catalog(
                    TranslationGroup=b.TranslationGroup, Language="nl")
                if not trans:
                    logger.info("No translations")
                    continue
                trans = trans[0].getObject()
                obj.title = trans.title

                if obj.portal_type == 'publication':
                    obj.bookTitle = trans.bookTitle

                obj.reindexObject()

        return "ok"

    # def fix_booktitle(self):
    #     site = portal.get()
    #     catalog = site.portal_catalog
    #
    #     # nls = catalog(portal_type="publication", Language="nl")
    #     ens = catalog(portal_type=["publication"], Language="en")
    #
    #     for b in ens:
    #         if not b.Title:
    #             logger.info(f"Fixing {b.getURL()}")
    #             obj = b.getObject()
    #             trans = catalog(
    #                 TranslationGroup=b.TranslationGroup, Language="nl")
    #             if not trans:
    #                 logger.info("No translations")
    #                 continue
    #             trans = trans[0].getObject()
    #             obj.Title = trans.Title
    #
    #             if obj.portal_type == 'publication':
    #                 obj.bookTitle = trans.bookTitle
    #
    #             obj.reindexObject()
    #
    #     return "ok"

    def __call__(self):
        alsoProvides(self.request, IDisableCSRFProtection)
        op = self.request.form.get('op')

        return getattr(self, op)()


def get_base_folder(context, portal_type):
    base = portal.get()
    return base.restrictedTraverse(IMPORT_LOCATIONS[portal_type])
