# from intk_vanabbe.importer import get_filename
from .importer import import_images
from intk_vanabbe.config import DATA_REPO
from intk_vanabbe.config import IMAGE_BASE_URL
from plone.api import portal
from plone.protect.interfaces import IDisableCSRFProtection
from Products.Five.browser import BrowserView
from zope.interface import alsoProvides

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

    def reindex_publications(self):
        site = portal.get()
        catalog = site.portal_catalog
        brains = catalog.searchResults(portal_type='publication')
        print(f"Will reindex {len(brains)} records")

        for count, brain in enumerate(brains):
            brain.getObject().reindexObject(
                idxs=['publication_type', 'decades'], update_metadata=True)
#           if count % 100 == 0:
#               transaction.savepoint(optimistic=True)
#               logger.info(f"Processed {count}")
            if count % 1000 == 0:
                transaction.commit()
                logger.info(f"Processed {count}")

        return "Done"

    def import_objectvisible(self):
        to_import = find_files("<objectIsVisible>1</objectIsVisible>")

        recordnumbers = []
        for fpath in to_import:
            fname = fpath.rsplit('/', 1)[-1].split('.')[0]
            recordnumbers.append(fname)

        site = portal.get()
        catalog = site.portal_catalog
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
            # if "1744.xml" not in fpath:
            #     continue
            #
            # import pdb
            # pdb.set_trace()
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

                # obj.objectIsVisible = True
                # obj.reindexObject(idxs=['objectIsVisible'])
                # logger.info("Fixed %s", obj.absolute_url(relative=1))

        return f"Processed: {processed_brains}\n{error_urls}"

    def __call__(self):
        alsoProvides(self.request, IDisableCSRFProtection)
        op = self.request.form.get('op')

        return getattr(self, op)()
