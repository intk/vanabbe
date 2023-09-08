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
        trans = translate(obj, language)

        for k, v in fields.items():
            setattr(trans, k, v)

        for id, child in obj.contentItems():
            # TODO: use translator instead of copy
            content.copy(child, trans)

        content.transition(obj=trans, transition="publish")
        trans._p_changed = True
        trans.reindexObject()

        return trans


    def import_record(self):
        api_url = "http://62.221.199.184:17718/action=get&command=search&query=ccIndexName=VanAbbeCollectie&fields=*&range=0-100"
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

            for lang in intl.keys():
                for xml_field, info_field in language_dependent_fields.items():
                    value = element.xpath(f"//dc_record/{xml_field}[@Language='{lang.upper()}']")
                    info[lang][info_field] = value[0].text

            for xml_field, info_field in fields_to_extract.items():
                elements = element.xpath(f"//dc_record/{xml_field}")
                info['nl'][info_field] = elements[0].text if elements else None
                info['en'][info_field] = elements[0].text if elements else None

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
                for lang in intl.keys():
                    els = element.xpath(
                        f"//dc_record/{field}[@Language='{lang.upper()}']")
                    if not els:
                        continue
                    intl[lang][field] = [
                        {"title": (el.get("Title") or "").strip(),
                            "filename": (el.text or "").strip()}
                        for el in els
                    ]

            for lang in intl.keys():
                objectDescription = element.xpath(f"//dc_record/objectDescription[@Language='{lang.upper()}']")
                if len(objectDescription)>1:
                    for e in objectDescription:
                        descTitle=e.get('Title')
                        descScope=e.get('Scope')
                        if descTitle or descScope:
                            info[lang]['objectDescription_extra'] = str(e.text)
                            info[lang]['objectDescription_extra_title'] = descTitle
                            info[lang]['objectDescription_extra_scope'] = descScope
                            print("Now in the desc Title and desc Scope")
                        else:
                            info[lang]['objectDescription'] = e.text
                elif objectDescription:
                    info[lang]['objectDescription'] = objectDescription[0].text
                else:
                    info[lang]['objectDescription'] = None

            # Check if only one language version of the object with ccObjectID exists 
            brains = catalog.searchResults(ccObjectID=ccObjectID)
            if len(brains)==1:
                lang = brains[0].getObject().language
                missing_lang = 'en' if lang == 'nl' else 'nl'
                if missing_lang == 'nl':
                    obj = create_and_setup_object(title, container, info, intl) #Dutch version 
                else:
                    obj_en = create_and_setup_object(title, container_en, info, intl) #English version

            # Check if object with ccObjectID already exists in the container
            brains = catalog.searchResults(ccObjectID=ccObjectID)
            if brains:
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

                    print(f"Updated Object ID: {obj.getId()}, Path: {obj.absolute_url()}, Workflow State: {api.content.get_state(obj)}")
                    
                    #publish the object
                    if api.content.get_state(obj)== "private":
                        content.transition(obj=obj, transition="publish")

                    # Reindex the updated object
                    obj.reindexObject(idxs=['objectTitle', 'Title', 'sortable_title'])
                
            else:
                # Object doesn't exist, so we create a new one
                if not title:
                    title = "Untitled Object"  # default value for untitled objects

                obj = create_and_setup_object(title, container, info, intl) #Dutch version
                obj_en = create_and_setup_object(title, container_en, info, intl) #English version

                logger.info("Created %s", obj.absolute_url(relative=1))
            
            # Linking two objects as translations of each other
            brains = catalog.searchResults(ccObjectID=ccObjectID, portal_type="artwork")
            if len(brains)>1:
                obj = brains[0].getObject()
                obj_en = brains[1].getObject()
                manager = ITranslationManager(obj)
                if not manager.has_translation('en'):
                    manager.register_translation('en', obj_en)

            #adding images
            images=element.xpath(f"//dc_record/objectImage")
            if images:
                import_images(
                    container= obj, 
                    images=images
                    )
            return("all right")


        return 'all done'


    def __call__(self):
        alsoProvides(self.request, IDisableCSRFProtection)
        op = self.request.form.get('op')

        return getattr(self, op)()


def get_base_folder(context, portal_type):
    base = portal.get()
    return base.restrictedTraverse(IMPORT_LOCATIONS[portal_type])

def create_and_setup_object(title, container, info, intl):
    """
    Create an object with the given title and container, then set its attributes
    using the provided info and intl dictionaries.
    """
    try:
        obj = api.content.create(
            type="artwork",
            title=title,
            container=container,
        )
    except TypeError as e:
        print(f"Error with data")
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
    obj.reindexObject(
        idxs=['objectTitle', 'Title', 'sortable_title', 'ccObjectID'])

    return obj

def import_images(container, images):
    for image in images:
        primaryDisplay=image.get('PrimaryDisplay')
        with requests.get(
            url=f"{IMAGE_BASE_URL}/{image.text}", stream=True, verify=False, headers=HEADERS
        ) as req:  # noqa
            data = req.raw.read()
            if "DOCTYP" in str(data[:10]):  # avoids missing images
                continue
        
        imagefield = NamedBlobImage(
            # TODO: are all images jpegs?
            data=data,
            contentType="image/jpeg",
            filename=image.text,
        )
        image = content.create(
            type="Image",
            id=image.text,
            title=image.text,
            image=imagefield,
            container=container,
        )
      
        if primaryDisplay == '1':
            ordering = IExplicitOrdering(container)
            ordering.moveObjectsToTop([image])
    
    return "alright"