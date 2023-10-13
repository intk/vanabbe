# from intk_vanabbe.importer import get_filename
from .importer import import_images
from collections import defaultdict
from intk_vanabbe.config import DATA_REPO
from intk_vanabbe.config import IMAGE_BASE_URL
from intk_vanabbe.config import IMPORT_LOCATIONS
from plone.protect.interfaces import IDisableCSRFProtection
from Products.Five.browser import BrowserView
from zope.interface import alsoProvides
from plone.folder.interfaces import IExplicitOrdering
from plone.api import content
from plone.api import portal
from plone.api import relation
from plone.app.multilingual.api import get_translation_manager
from plone.app.multilingual.api import translate
from plone import api
from plone.app.multilingual.interfaces import ITranslationManager
from .request import HEADERS
from plone.namedfile.file import NamedBlobImage
from plone.folder.interfaces import IExplicitOrdering
from zope.component import getUtility
from zope.intid.interfaces import IIntIds
from zope import component
from zc.relation.interfaces import ICatalog
from datetime import datetime

import time
import json
import logging
import lxml.etree
import os
import transaction
import requests
import xml.etree.ElementTree as ET


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

    def fetch_xml_data(self):
        """
        Fetches XML data from the predefined API endpoint.
        
        Returns:
        - str: The fetched XML data.
        """
        api_url = "http://62.221.199.184:17718/action=get&command=search&query=ccIndexName=VanAbbeCollectie&fields=*&range=1-10000"
        response = requests.get(api_url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        return response.text

    def create_xml_records(self, output_dir="/var/local/vanabbe/data-import-new"):
        """
        Fetches XML data from the API, splits it into separate XML files for each <dc_record> section.
        
        Parameters:
        - output_dir (str): The directory where to save the XML files.

        Returns:
        - list: Names of the generated XML files.
        """
        xml_string = self.fetch_xml_data()

        # Ensure the output directory exists, if not create it
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        # Parse the XML
        root = ET.fromstring(xml_string)
        
        # Extract <record> elements
        records = root.findall('.//record')
        
        generated_files = []
        
        for record in records:
            # Extract <dc_record> element
            dc_record = record.find('.//dc_record')
            
            # Extract <recordnumber> value
            recordnumber = record.find('.//dc_record//recordnumber').text
            
            # Convert <dc_record> element to XML string
            dc_record_xml = ET.tostring(dc_record, encoding='unicode')
            
            # Save XML to a file
            file_name = os.path.join(output_dir, f"{recordnumber}.xml")
            with open(file_name, 'w', encoding='utf-8') as f:
                f.write(dc_record_xml)
            
            generated_files.append(file_name)
        
        return generated_files

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
    
    def import_objectondisplay(self):
        site = portal.get()
        catalog = site.portal_catalog

        for brain in catalog.searchResults(portal_type="artwork"):   
            obj = brain.getObject()         
            if obj.objectPosition != None:
                obj.objectOnDisplay = True
                obj.reindexObject(idxs=['objectOnDisplay'])
            else:
                obj.objectOnDisplay = False
                obj.reindexObject(idxs=['objectOnDisplay'])

        return "ok"
    
    def import_hasimage(self):
        site = portal.get()
        catalog = site.portal_catalog

        for brain in catalog.searchResults(portal_type='artwork'):
            obj = brain.getObject()
            has_image_child = any(child_brain.portal_type == 'Image' for child_brain in catalog(path={'query': '/'.join(obj.getPhysicalPath()), 'depth': 1}))
            if has_image_child:
                obj.hasImage = True
                obj.reindexObject(idxs=['hasImage'])
            else:
                obj.hasImage = False
                obj.reindexObject(idxs=['hasImage'])
        
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

    # def import_images(self):
    #     to_import = find_files("</objectImage>")
    #     print(f"To import: {len(to_import)}")

    #     site = portal.get()
    #     catalog = site.portal_catalog

    #     processed_brains = 0
    #     error_urls = []
    #     for fpath in to_import:
    #         with open(fpath) as f:
    #             xml = f.read()
    #         element = lxml.etree.fromstring(xml)
    #         img_urls = element.xpath("//dc_record/objectImage/text()")
    #         img_count = len(img_urls)

    #         recordnumber = fpath.rsplit('/', 1)[-1].split('.')[0]
    #         brains = catalog.searchResults(recordnumber=int(recordnumber))

    #         for brain in brains:
    #             obj = brain.getObject()

    #             if obj.portal_type == 'artwork':
    #                 urls = []
    #                 for fname in img_urls:
    #                     if 'http' not in fname:
    #                         fname = IMAGE_BASE_URL % fname
    #                     urls.append(fname)
    #                 img_urls = urls

    #             childrenIds = obj.contentIds()

    #             if len(childrenIds) != img_count:
    #                 processed_brains += 1
    #                 errors = import_images(obj, img_urls, use_archive=True)
    #                 error_urls.extend(errors)

    #     return f"Processed: {processed_brains}\n{error_urls}"

    def import_artworks(self):
        to_import = find_files("</AuthorBio>")

        site = portal.get()
        catalog = site.portal_catalog

        for fpath in to_import:
            recordnumber = fpath.rsplit('/', 1)[-1].split('.')[0]
            
            brains = catalog.searchResults(recordnumber=recordnumber)

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

    def get_base_folder(context, portal_type):
        base = portal.get()
        return base.restrictedTraverse(IMPORT_LOCATIONS[portal_type])
    
    def translate(self, obj, fields):
        language = "en"
        
        manager = ITranslationManager(obj)
        
        # Check if translation in the target language already exists
        if manager.has_translation(language):
            trans = manager.get_translation(language)
        else:
            trans = translate(obj, language)

        # Ensure the title is set
        if 'objectTitle' in fields:
            trans.title = fields['objectTitle']
        
        if 'eventTitle' in fields:
            trans.title = fields['eventTitle']

        for k, v in fields.items():
            setattr(trans, k, v)

        for id, child in obj.contentItems():
            # TODO: use translator instead of copy
            content.copy(child, trans)

        if api.content.get_state(trans) == "private":
            content.transition(obj=trans, transition="publish")
        trans._p_changed = True

        if obj.ccIndexName == "VanAbbeCollectie":
            if obj.hasImage:
                trans.hasImage=True

        trans.reindexObject()

        return trans

    # Import function for Artworks
    # TODO change the name to import_artworks
    def import_record(self):
        start_range = self.request.form.get('start_range', 0)
        end_range = self.request.form.get('end_range', 3500)

        counter = 0

        
        start_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Record the start time
        today_date = datetime.now().strftime('%d-%m-%y') 
        date_from = self.request.form.get('date_from')

        log_to_file(f"========================")
        log_to_file(f"========================")
        log_to_file(f"The sync function started at {start_time} for the range of objects between {start_range} and {end_range} ")

        if date_from == None:
            api_url = f"http://62.221.199.184:17718/action=get&command=search&query=ccIndexName=VanAbbeCollectie&fields=*&range={start_range}-{end_range}"
        elif date_from == "today":
            # api_url = f"http://62.221.199.184:17718/action=get&command=search&query=timestamp>{today_date}&fields=*&range={start_range}-{end_range}"
            api_url = f"http://62.221.199.184:17718/action=get&command=search&query=timestamp={today_date}&ccIndexName=VanAbbeCollectie&fields=*&range={start_range}-{end_range}"
        else:
            # api_url = f"http://62.221.199.184:17718/action=get&command=search&query=timestamp>{date_from}&fields=*&range={start_range}-{end_range}"
            api_url = f"http://62.221.199.184:17718/action=get&command=search&query=timestamp>{date_from}&ccIndexName=VanAbbeCollectie&fields=*&range={start_range}-{end_range}"

        log_to_file(f"API URL = {api_url}")

        response = requests.get(api_url)
        response.raise_for_status()
        api_answer = response.text
        container = get_base_folder(self.context, "artwork")
        container_en = get_base_folder(self.context, 'artwork_en')
        site = api.portal.get()
        catalog = site.portal_catalog
        
        root = ET.fromstring(api_answer)
        
        # Extract <record> elements
        records = root.findall('.//record')

        for record in records:
            # Extract <dc_record> element
            dc_record = record.find('.//dc_record')

            if not dc_record:
                log_to_file(f"this is not artwork") 
                continue 

            index_name = dc_record.find('.//ccIndexName')
            if index_name is not None and index_name.text == "VanAbbeCollectie":
            
                # Convert <dc_record> element to XML string
                dc_record_xml = ET.tostring(dc_record, encoding='unicode')

                # print(dc_record_xml)
                element = lxml.etree.fromstring(dc_record_xml)
                authors, authors_en = import_authors(self, element)

                info = {'nl': {}, 'en': {}}
                intl = {'nl': {}, 'en': {}}
                
                ccObjectID = element.xpath("//dc_record/ccObjectID")[0].text
                info['nl']['ccObjectID'] = ccObjectID
                info['en']['ccObjectID'] = ccObjectID

                fields_to_extract = {
                    "ccIdentifier": "ccIdentifier",
                    "ccIndexName": "ccIndexName",
                    "objectCreationDate": "objectCreationDate",
                    "objectCreationFrom": "objectCreationDateFrom", 
                    "objectCreationDateTo": "objectCreationDateTo",
                    "objectID": "objectID",
                    "objectYearPurchase": "objectYearPurchase",
                    "recordnumber": "recordnumber",
                    "Dimensions": "dimensions",
                    "objectCredit": "objectCredit"
                }

                language_dependent_fields = {
                    "objectClassification" : "objectClassification",
                    "objectMedium": "objectMedium",
                }

                for lang in info.keys():
                    for xml_field, info_field in language_dependent_fields.items():
                        value = element.xpath(f"//dc_record/{xml_field}[@Language='{lang.upper()}']")
                        if value:
                            info[lang][info_field] = value[0].text
                        else:
                            info[lang][info_field] = ''

                for xml_field, info_field in fields_to_extract.items():
                    elements = element.xpath(f"//dc_record/{xml_field}")
                    info['nl'][info_field] = elements[0].text if elements else ''
                    info['en'][info_field] = elements[0].text if elements else ''

                rawdata = element.xpath("//dc_record")[0]
                info['nl']['rawdata'] = lxml.etree.tostring(rawdata)
                info['en']['rawdata'] = lxml.etree.tostring(rawdata)

                titles = element.xpath("//dc_record/objectTitle")
                title = titles[0].text
                if len(titles) > 1:
                    titles.sort(key=lambda x: x.get("Rangorde") or "")
                    title = titles[0].text
                info['nl']['objectTitle'] = title
                info['en']['objectTitle'] = title

                attrs = [
                    "objectPosition",
                    "objectFormatWidth",
                    "objectFormatDepth",
                    "objectFormatLength",
                    "objectKeys",
                    "authorID"
                ]

                for attr in attrs:
                    value = element.xpath(f"//dc_record/{attr}")
                    if value:
                        info['en'][attr] = str(value[0].text)
                        info['nl'][attr] = str(value[0].text)

                        # If the current attribute is 'objectPosition' and the value is not empty
                        if attr == "objectPosition" and str(value[0]).strip():
                            info['en']['objectOnDisplay'] = True
                            info['nl']['objectOnDisplay'] = True

                for field in ["ObjectAudio", "ObjectVideo"]:
                    for lang in info.keys():
                        els = element.xpath(
                            f"//dc_record/{field}[@Language='{lang.upper()}']")
                        if not els:
                            continue
                        info[lang][field] = [
                            {"title": (el.get("Title") or "").strip(),
                                "filename": (el.text or "").strip()}
                            for el in els
                        ]

                for lang in info.keys():
                    objectDescription = element.xpath(f"//dc_record/objectDescription[@Language='{lang.upper()}']")
                    if len(objectDescription)>1:
                        for e in objectDescription:
                            descTitle=e.get('Title')
                            descScope=e.get('Scope')
                            if descTitle or descScope:
                                info[lang]['objectDescription_extra'] = str(e.text)
                                info[lang]['objectDescription_extra_title'] = descTitle
                                info[lang]['objectDescription_extra_scope'] = descScope
                            else:
                                info[lang]['objectDescription'] = e.text
                    elif objectDescription:
                        info[lang]['objectDescription'] = objectDescription[0].text
                    else:
                        info[lang]['objectDescription'] = ''

                # Find the existing object
                # brains = catalog.searchResults(ccObjectID=ccObjectID, portal_type="artwork")

                # Check if only one language version of the object with ccObjectID exists 
                brains = catalog.searchResults(ccObjectID=ccObjectID)
                if len(brains)==1:
                    lang = brains[0].getObject().language
                    missing_lang = 'en' if lang == 'nl' else 'nl'
                    if missing_lang == 'nl':
                        obj = create_and_setup_object(title, container, info, intl, "artwork") #Dutch version
                        log_to_file(f"{ccObjectID} Dutch version of object is created")
                        for author in authors:
                            relation.create(source=obj, target=author, relationship="authors")
                        
                        manager = ITranslationManager(obj)
                        if not manager.has_translation('en'):
                            manager.register_translation('en', brains[0].getObject())
                        
                        #adding images
                        images=element.xpath(f"//dc_record/objectImage")
                        if images:
                            import_images(
                                container= obj, 
                                images=images
                                )
                            obj.hasImage=True; 

                    else:
                        obj_en = create_and_setup_object(title, container_en, info, intl, "artwork") #English version
                        log_to_file(f"{ccObjectID} English version of object is created")
                        for author_en in authors_en:
                            relation.create(source=obj_en, target=author_en, relationship="authors")

                        manager = ITranslationManager(obj_en)
                        if not manager.has_translation('nl'):
                            manager.register_translation('nl', brains[0].getObject())
                        
                        #adding images
                        images=element.xpath(f"//dc_record/objectImage")
                        if images:
                            import_images(
                                container= obj_en, 
                                images=images
                                )
                            obj_en.hasImage=True;
                        
                # Check if object with ccObjectID already exists in the container
                # brains = catalog.searchResults(ccObjectID=ccObjectID)
                elif brains:
                    for brain in brains:
                        # Object exists, so we fetch it and update it
                        obj = brain.getObject()

                        # Update the object's fields with new data
                        lang = obj.language
                        for k, v in info[lang].items():
                            if v:
                                setattr(obj, k, v)

                        for k, v in intl[lang].items():
                            if v:
                                setattr(obj, k, json.dumps(v))

                        # print(f"Updated Object ID: {obj.getId()}, Path: {obj.absolute_url()}, Workflow State: {api.content.get_state(obj)}")
                        
                        if lang == "nl":
                            for author in authors:
                                relation.delete(source=obj, target=author, relationship="authors")
                                relation.create(source=obj, target=author, relationship="authors")

                        else:
                            for author_en in authors_en:
                                relation.delete(source=obj, target=author_en, relationship="authors")
                                relation.create(source=obj, target=author_en, relationship="authors")
                        
                        log_to_file(f"{ccObjectID} object is updated")

                        #adding images
                        images=element.xpath(f"//dc_record/objectImage")
                        if images:
                            import_images(
                                container= obj, 
                                images=images
                                )
                        obj.hasImage=True;

                        # Reindex the updated object
                        obj.reindexObject()
                        obj.reindexObject(idxs=['objectTitle', 'Title', 'sortable_title', 'authorID'])

                # Object doesn't exist, so we create a new one
                else:
                    if not title:
                        title = "Untitled Object"  # default value for untitled objects

                    obj = create_and_setup_object(title, container, info, intl, "artwork") #Dutch version
                    # obj_en = create_and_setup_object(title, container_en, info, intl) #English version
                    obj_en = self.translate(obj, info['en'])

                    log_to_file(f"{ccObjectID} object is created")

                    for author in authors:
                        relation.create(source=obj, target=author, relationship="authors")
                    for author_en in authors_en:
                        relation.create(source=obj_en, target=author_en, relationship="authors")

                    logger.info("Created %s", obj.absolute_url(relative=1))        

                    #adding images
                    images=element.xpath(f"//dc_record/objectImage")
                    if images:
                        import_images(
                            container= obj, 
                            images=images
                            )
                        obj.hasImage=True;
                    
                    obj_en = self.translate(obj, info['en'])
                
                counter += 1

                # Check if counter has reached 500 and commit transaction
                if counter % 500 == 0:
                    transaction.commit()
                    log_to_file(f"Transaction is committed")

        finish_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Record the finish time

        log_to_file(f"Processed range: {start_range}-{end_range} (Start: {start_time}, Finish: {finish_time})") 
        # Return the current processed range along with the response from the next batches
        return f"Processed range: {start_range}-{end_range} (Start: {start_time}, Finish: {finish_time})<br>"


    # Import function for exhibitions
    def import_exhibitions(self):
        start_range = self.request.form.get('start_range', 0)
        end_range = self.request.form.get('end_range', 3500)

        counter = 0

        
        start_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Record the start time
        today_date = datetime.now().strftime('%d-%m-%y') 
        date_from = self.request.form.get('date_from')

        log_to_file(f"========================")
        log_to_file(f"========================")
        log_to_file(f"The sync function started at {start_time} for the range of objects between {start_range} and {end_range} ")

        if date_from == None:
            api_url = f"http://62.221.199.184:17718/action=get&command=search&query=ccIndexName=VanabbeTentoonstellingen&fields=*&range={start_range}-{end_range}"
        elif date_from == "today":
            api_url = f"http://62.221.199.184:17718/action=get&command=search&query=timestamp={today_date}&ccIndexName=VanabbeTentoonstellingen&fields=*&range={start_range}-{end_range}"
        else:
            api_url = f"http://62.221.199.184:17718/action=get&command=search&query=timestamp={date_from}&ccIndexName=VanabbeTentoonstellingen&fields=*&range={start_range}-{end_range}"
        
        log_to_file(f"API URL = {api_url}")

        response = requests.get(api_url)
        response.raise_for_status()
        api_answer = response.text
        container = get_base_folder(self.context, "exhibition")
        container_en = get_base_folder(self.context, 'exhibition_en')
        site = api.portal.get()
        catalog = site.portal_catalog
        
        root = ET.fromstring(api_answer)
        
        # Extract <record> elements
        records = root.findall('.//record')

        for record in records:
            # Extract <dc_record> element
            dc_record = record.find('.//dc_record')

            if not dc_record:
                log_to_file(f"this is not artwork") 
                continue 

            index_name = dc_record.find('.//ccIndexName')
            if index_name is not None and index_name.text == "VanabbeTentoonstellingen":
                # Convert <dc_record> element to XML string
                dc_record_xml = ET.tostring(dc_record, encoding='unicode')

                # print(dc_record_xml)
                element = lxml.etree.fromstring(dc_record_xml)

                info = {'nl': {}, 'en': {}}
                intl = {'nl': {}, 'en': {}}
                

                ccObjectID = element.xpath("//dc_record/ccObjectID")[0].text
                info['nl']['ccObjectID'] = ccObjectID
                info['en']['ccObjectID'] = ccObjectID

                fields_to_extract = {
                    "ccIdentifier": "ccIdentifier",
                    "ccIndexName" : "ccIndexName",
                    "eventCoorporation" : "eventCoorporation",
                    "eventDescription" : "eventDescription",
                    "recordnumber" : "recordnumber",
                    "eventTimeFrom" : "eventTimeFrom",
                    "eventTimeStart" : "eventTimeStart",
                    "eventTimeEnd" : "eventTimeEnd",
                    "eventSub" : "eventSub",
                }

                language_dependent_fields = {
                    "eventTitle": "eventTitle",
                }

                for lang in info.keys():
                    for xml_field, info_field in language_dependent_fields.items():
                        value = element.xpath(f"//dc_record/{xml_field}[@Language='{lang.upper()}']")
                        if value:
                            info[lang][info_field] = value[0].text
                        else:
                            info[lang][info_field] = ''

                for xml_field, info_field in fields_to_extract.items():
                    elements = element.xpath(f"//dc_record/{xml_field}")
                    if elements:
                        if xml_field in ["eventTimeStart", "eventTimeEnd"]:
                            date_value = convert_to_date(elements[0].text.split('^')[0])
                            info['nl'][info_field] = date_value
                            info['en'][info_field] = date_value
                        else:
                            info['nl'][info_field] = elements[0].text
                            info['en'][info_field] = elements[0].text
                    else:
                        info['nl'][info_field] = ''
                        info['en'][info_field] = ''

                rawdata = element.xpath("//dc_record")[0]
                info['nl']['rawdata'] = lxml.etree.tostring(rawdata)
                info['en']['rawdata'] = lxml.etree.tostring(rawdata)

                title = element.xpath("//dc_record/eventTitle")
                title_en = element.xpath("//dc_record/eventTitle_EN")
                if len(title) > 0:
                    title = element.xpath("//dc_record/eventTitle")
                    title_en = element.xpath("//dc_record/eventTitle_EN")
                    info['nl']['eventTitle'] = title[0].text
                    if title_en == None or len(title_en)<1:
                        info['en']['eventTitle'] = title[0].text
                    else:
                        info['en']['eventTitle'] = title_en[0].text
                else:
                    title = "Naamloze Tentoonstelling";
                    title_en = "Untitled Exhibition" 
                    info['nl']['eventTitle'] = title
                    info['en']['eventTitle'] = title_en

                eventArtists = element.xpath("//dc_record/eventArtist")
                if eventArtists:
                    artists = [artist.text for artist in eventArtists if artist.text]
                    info['nl']['eventArtist'] = artists
                    info['en']['eventArtist'] = artists 

                for field in ["eventImages", "eventMedia"]:
                    els = element.xpath(f"//dc_record/{field}")
                    # info[field] = "\n".join(v)
                    full_text = ""
                    for el in els:
                        full_text += el.text + "\n"
                    info['nl'][field] = full_text
                    info['en'][field] = full_text
                    
                # Check if only one language version of the object with ccObjectID exists 
                brains = catalog.searchResults(ccObjectID=ccObjectID)
                if len(brains)==1:
                    lang = brains[0].getObject().language
                    missing_lang = 'en' if lang == 'nl' else 'nl'
                    if missing_lang == 'nl':
                        obj = create_and_setup_object(info['nl']['eventTitle'], container, info, intl, "exhibition") #Dutch version
                        log_to_file(f"{ccObjectID} Dutch version of object is created")
                        
                        manager = ITranslationManager(obj)
                        if not manager.has_translation('en'):
                            manager.register_translation('en', brains[0].getObject())
                        
                        #adding images
                        images=element.xpath(f"//dc_record/eventImages")
                        if images:
                            import_exhibiton_images(
                                container= obj, 
                                images=images
                                )
                        
                    else:
                        obj_en = create_and_setup_object(info['en']['eventTitle'], container_en, info, intl, "exhibition") #English version
                        log_to_file(f"{ccObjectID} English version of object is created")

                        manager = ITranslationManager(obj_en)
                        if not manager.has_translation('nl'):
                            manager.register_translation('nl', brains[0].getObject())
                        
                        #adding images
                        images=element.xpath(f"//dc_record/eventImages")
                        if images:
                            import_exhibiton_images(
                                container= obj_en, 
                                images=images
                                )
                        
                # Check if object with ccObjectID already exists in the container
                elif brains:
                    for brain in brains:
                        # Object exists, so we fetch it and update it
                        obj = brain.getObject()

                        # Update the object's fields with new data
                        lang = obj.language
                        for k, v in info[lang].items():
                            if v:
                                setattr(obj, k, v)

                        for k, v in intl[lang].items():
                            if v:
                                setattr(obj, k, json.dumps(v))
                        
                        log_to_file(f"{ccObjectID} object is updated")

                        #adding images
                        images=element.xpath(f"//dc_record/eventImages")
                        if images:
                            import_exhibiton_images(
                                container= obj, 
                                images=images
                                )
                        # obj.hasImage=True;

                        # Reindex the updated object
                        obj.reindexObject()
                        # obj.reindexObject(idxs=['objectTitle', 'Title', 'sortable_title', 'authorID'])

                # Object doesn't exist, so we create a new one
                else:
                    if not title:
                        title = "Untitled Object"  # default value for untitled objects

                    obj = create_and_setup_object(info['nl']['eventTitle'], container, info, intl, "exhibition") #Dutch version

                    log_to_file(f"{ccObjectID} object is created")

                    logger.info("Created %s", obj.absolute_url(relative=1))        

                    #adding images
                    images=element.xpath(f"//dc_record/eventImages")
                    if images:
                        import_exhibiton_images(
                            container= obj, 
                            images=images
                            )
                        # obj.hasImage=True;
                    
                    obj_en = self.translate(obj, info['en'])
                
                counter += 1

                # Check if counter has reached 500 and commit transaction
                if counter % 500 == 0:
                    transaction.commit()
                    log_to_file(f"Transaction is committed")

        finish_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')  # Record the finish time

        log_to_file(f"Processed range: {start_range}-{end_range} (Start: {start_time}, Finish: {finish_time})") 
        # Return the current processed range along with the response from the next batches
        return f"Processed range: {start_range}-{end_range} (Start: {start_time}, Finish: {finish_time})<br>"


    def __call__(self):
        alsoProvides(self.request, IDisableCSRFProtection)
        op = self.request.form.get('op')

        return getattr(self, op)()


def get_base_folder(context, portal_type):
    base = portal.get()
    return base.restrictedTraverse(IMPORT_LOCATIONS[portal_type])

def create_and_setup_object(title, container, info, intl, object_type):
    """
    Create an object with the given title and container, then set its attributes
    using the provided info and intl dictionaries.
    """
    try:
        obj = api.content.create(
            type=object_type,
            title=title,
            container=container,
        )
    except TypeError as e:
        print(f"Error with data")
        log_to_file(f"Error while creating the Object {title}, -> info {info} -> error {e}")
        raise e

    lang = obj.language
    for k, v in info[lang].items():
        if v:
            setattr(obj, k, v)

    for k, v in intl[lang].items():
        if v:
            setattr(obj, k, json.dumps(v))
    
    # Publish the object if it's private
    if api.content.get_state(obj) == "private":
        content.transition(obj=obj, transition="publish")
    
    # Reindex the object
    # obj.reindexObject(idxs=['objectTitle', 'Title', 'sortable_title', 'ccObjectID'])
    obj.reindexObject()

    return obj

def import_images(container, images):
    MAX_RETRIES = 2
    DELAY_SECONDS = 1

    # Delete the existing images inside the container
    for obj in api.content.find(context=container, portal_type='Image'):
        api.content.delete(obj=obj.getObject())

    for image in images:
        primaryDisplay = image.get('PrimaryDisplay')
        retries = 0
        success = False

        # Tries MAX_RETRIES times and then raise exception
        while retries < MAX_RETRIES:
            try:
                with requests.get(
                    url=f"{IMAGE_BASE_URL}/{image.text}", stream=True, verify=False, headers=HEADERS
                ) as req:  # noqa
                    req.raise_for_status()
                    data = req.raw.read()

                    if "DOCTYP" in str(data[:10]):
                        continue

                    log_to_file(f"{image.text} image is created") 
                
                    imagefield = NamedBlobImage(
                        # TODO: are all images jpegs?
                        data=data,
                        contentType="image/jpeg",
                        filename=image.text,
                    )
                    image = api.content.create(
                        type="Image",
                        title=image.text,
                        image=imagefield,
                        container=container,
                    )

                    if primaryDisplay == '1':
                        ordering = IExplicitOrdering(container)
                        ordering.moveObjectsToTop([image.getId()])
                    
                    success = True
                    break

            except requests.RequestException as e:
                retries += 1
                if retries < MAX_RETRIES:
                    time.sleep(DELAY_SECONDS)
                else:
                    print(f"Failed to fetch image {image.text} after {MAX_RETRIES} attempts: {e}")
                    log_to_file(f"failed to create {image.text} image") 

        if not success:
            print(f"Skipped image {image.text} due to repeated fetch failures.")

    return f"Images {images} created successfully"

def import_exhibiton_images(container, images):
    MAX_RETRIES = 2
    DELAY_SECONDS = 1

    # Delete the existing images inside the container
    for obj in api.content.find(context=container, portal_type='Image'):
        api.content.delete(obj=obj.getObject())

    for image in images:
        primaryDisplay = image.get('PrimaryDisplay')
        retries = 0
        success = False

        # Tries MAX_RETRIES times and then raise exception
        while retries < MAX_RETRIES:
            try:
                with requests.get(
                    url=image.text, stream=True, verify=False, headers=HEADERS
                ) as req:  # noqa
                    req.raise_for_status()
                    data = req.raw.read()

                    if "DOCTYP" in str(data[:10]):
                        continue

                    log_to_file(f"{image.text} image is created") 
                
                    imagefield = NamedBlobImage(
                        # TODO: are all images jpegs?
                        data=data,
                        contentType="image/jpeg",
                        filename=image.text,
                    )
                    image = api.content.create(
                        type="Image",
                        title=image.text,
                        image=imagefield,
                        container=container,
                    )

                    if primaryDisplay == '1':
                        ordering = IExplicitOrdering(container)
                        ordering.moveObjectsToTop([image.getId()])
                    
                    success = True
                    break

            except requests.RequestException as e:
                retries += 1
                if retries < MAX_RETRIES:
                    time.sleep(DELAY_SECONDS)
                else:
                    print(f"Failed to fetch image {image.text} after {MAX_RETRIES} attempts: {e}")
                    log_to_file(f"failed to create {image.text} image") 

        if not success:
            print(f"Skipped image {image.text} due to repeated fetch failures.")

    return f"Images {images} created successfully"

def import_authors(self, element, use_archive=True):
    container = get_base_folder(self.context, "author")
    container_en = get_base_folder(self.context, 'author_en')
    authors = []
    authors_en = []

    urls = {}
    url_titles = {}

    def get(lang, d):
        if lang in d:
            return d[lang]
        else:
            if d:
                return d[list(d.keys())[0]]

    for authorID in element.xpath("authorID/text()"):
        found = content.find(
            portal_type="author",
            authorID=authorID,
            Language="nl",
        )
        found_en = content.find(
            portal_type="author",
            authorID=authorID,
            Language='en',
        )
        if found:
            authors += [b.getObject() for b in found]
            authors_en += [b.getObject() for b in found_en]
            continue

        x = element.xpath

        el = x(f"authorName[@authorID={authorID}]")[0]
        authorSortName = el.get("authorSortName")
        authorName = el.text

        authorBirthDate = x(f"authorBirthDate[@authorID={authorID}]/text()")  # noqa
        if authorBirthDate:
            authorBirthDate = authorBirthDate[0]

        authorDeathDate = x(f"authorDeathDate[@authorID={authorID}]/text()")  # noqa
        if authorDeathDate:
            authorDeathDate = authorDeathDate[0]

        AuthorBio = x(f"AuthorBio[@authorID={authorID}]/text()")
        if AuthorBio:
            AuthorBio = AuthorBio[0]

        for el in x(f"authorURL[@authorID={authorID}]"):
            lang = (el.get("Language") or "nl").lower()
            urls[lang] = el.text
            url_titles[lang] = el.get("Title")

        # TODO: setup special folder location for authors
        fields = dict(
            title=authorName or authorID,
            authorID=authorID,
            AuthorBio=AuthorBio,
            authorName=authorName,
            authorSortName=authorSortName,
            authorBirthDate=authorBirthDate,
            authorDeathDate=authorDeathDate,
            authorURL=get("nl", urls),
            authorURLTitle=get("nl", url_titles),
        )
        fields_en = dict(
            title=authorName or authorID,
            authorID=authorID,
            AuthorBio=AuthorBio,
            authorName=authorName,
            authorSortName=authorSortName,
            authorBirthDate=authorBirthDate,
            authorDeathDate=authorDeathDate,
            authorURL=get("nl", urls),
            authorURLTitle=get("nl", url_titles),
        )

        for k, v in fields.items():
            fields[k] = str(v)
        for k, v in fields_en.items():
            fields_en[k]=str(v)

        if urls.get("en"):
            fields_en["authorURL"] = urls["en"]
            fields_en["authorURLTitle"] = url_titles["en"]

        author = content.create(
            type="author",
            # id=f'author-{rec["authorID"]}',
            container=container,
            **fields,
        )
        author_en = content.create(
            type="author",
            container=container_en,
            **fields_en,
        ) #English version

        log_to_file(f"{authorName} author is created") 

        manager = ITranslationManager(author)
        if not manager.has_translation('en'):
            manager.register_translation('en', author_en)



        authors.append(author)
        authors_en.append(author_en)
        content.transition(obj=author, transition="publish")
        content.transition(obj=author_en, transition="publish")

        logger.info(f"Created author {author.getId()}")

    return [authors, authors_en]

def log_to_file(message):
    log_file_path = "/app/logs/collectionLogs.txt"
    # log_file_path = "/Users/cihanandac/Documents/vanabbe/collectionLogs.txt"
    
    # Attempt to create the file if it doesn't exist
    try:
        if not os.path.exists(log_file_path):
            with open(log_file_path, 'w') as f:
                pass
    except Exception as e:
        print(f"Error creating log file: {e}")

    # Append the log message to the file
    try:
        with open(log_file_path, 'a') as f:
            f.write(message + "\n")
    except Exception as e:
        print(f"Error writing to log file: {e}")

def convert_to_date(raw_date):
    # Remove known prefixes and suffixes
    known_prefixes = ["van ", "tot ", "van", "tot"]
    known_suffixes = ["tot", " tot", "van", " van"]
    for prefix in known_prefixes:
        if raw_date.startswith(prefix):
            log_to_file(f"there is an error in the date value {raw_date}")
            raw_date = raw_date[len(prefix):]
            log_to_file(f"there is an error in the date value {raw_date}")
            break

    for suffix in known_suffixes:
        if raw_date.endswith(suffix):
            log_to_file(f"there is an error in the date value {raw_date}")
            raw_date = raw_date[:-len(suffix)].strip()  # The strip() ensures any spaces are removed
            break

    try:
        # Make sure the raw_date doesn't contain non-numeric characters other than hyphen
        if not all(char.isdigit() or char == '-' for char in raw_date):
            log_to_file(f"there is an error in the date value {raw_date}")
            return None

        day, month, year = raw_date.split('-')
        if not is_valid_day(day):
            log_to_file(f"Invalid day in the date value {raw_date}")
            return None
        if len(year) == 2:  # Handle 2-digit year values, assuming it's 20th century
            year = '19' + year
        formatted_date = f"{year}/{month}/{day}"
        return DateTime(formatted_date)
    except (ValueError, AttributeError):
        log_to_file(f"there is an error in the date value {raw_date}")
        return None

def is_valid_day(day_str):
    # Check if day is '00' or above 31
    return 1 <= int(day_str) <= 31