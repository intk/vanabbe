# from intk_vanabbe.importer import get_filename
from .importer import import_images
from .request import HEADERS
from collections import defaultdict
from datetime import datetime
from DateTime import DateTime
from intk_vanabbe.config import DATA_REPO
from intk_vanabbe.config import IMAGE_BASE_URL
from intk_vanabbe.config import IMPORT_LOCATIONS
from intk_vanabbe.content.artwork import IArtwork
from intk_vanabbe.content.exhibition import IExhibition
from intk_vanabbe.content.publication import IPublication
from plone import api
from plone.api import content
from plone.api import portal
from plone.api import relation
from plone.app.multilingual.api import get_translation_manager
from plone.app.multilingual.api import translate
from plone.app.multilingual.interfaces import ITranslationManager
from plone.app.textfield.interfaces import IRichText
from plone.app.textfield.value import RichTextValue
from plone.folder.interfaces import IExplicitOrdering
from plone.namedfile.file import NamedBlobImage
from plone.protect.interfaces import IDisableCSRFProtection
from Products.Five.browser import BrowserView
from zc.relation.interfaces import ICatalog
from zope import component
from zope.component import getUtility
from zope.interface import alsoProvides
from zope.intid.interfaces import IIntIds
from zope.schema.interfaces import IList
from zope.schema.interfaces import IText
from zope.schema.interfaces import ITextLine

import gc
import json
import logging
import lxml.etree
import os
import requests
import time
import transaction
import xml.etree.ElementTree as ET
import re

logger = logging.getLogger("vubis")


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
        if "objectTitle" in fields:
            trans.title = fields["objectTitle"]

        if "eventTitle" in fields:
            trans.title = fields["eventTitle"]

        if "BookTitle" in fields and trans is not None:
            trans.title = fields["BookTitle"]

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
                trans.hasImage = True

        trans.reindexObject()

        return trans

    def delete_publications(self):
        range = self.request.form.get("range", 0)
        lang = self.request.form.get("lang", "nl")
        if lang == "nl":
            container = get_base_folder(self.context, "publication")
        else:
            container = get_base_folder(self.context, "publication_en")
        brains = api.content.find(context=container, portal_type="publication")

        count = 0
        for brain in brains:
            count += 1
            obj = brain.getObject()

            api.content.delete(obj=obj)
            log_to_file(f"deleted obj {obj.title}")

            # Commit every 1000 objects
            if count % 1000 == 0:
                transaction.commit()
            if count == int(range):
                return f"stop at range"

        # Ensure any remaining changes are committed
        transaction.commit()

        return "deleted all of the publications"
    
    def import_collection_object(self):
        object_id = self.request.form.get("object_id")
        index_name = self.request.form.get("index_name")

        if object_id is None or index_name is None:
            return "missing info"

        MAX_RETRIES = 2
        DELAY_SECONDS = 1

        log_to_file(f"Sync is running for ccIndexName: {index_name}, ccObjectID: {object_id}")

        pattern = r'DataBib=([^&]+)'
        match = re.search(pattern, object_id)
        if match:
            object_id = match.group(1)


        api_url = f"http://62.221.199.184:17718/action=get&command=search&query=and(ccObjectId={object_id};ccIndexName={index_name})&fields=*"

        log_to_file(f"API URL = {api_url}")

        response = requests.get(api_url)
        # log_to_file(f"response: {response.text}")
        response.raise_for_status()
        api_answer = response.text
        container = get_base_folder(self.context, "publication")
        container_en = get_base_folder(self.context, "publication_en")
        site = api.portal.get()
        catalog = site.portal_catalog

        root = ET.fromstring(api_answer)

        records = root.findall(".//record")
        for record in records:
            transaction.begin()
            # Extract <dc_record> element
            dc_record = record.find(".//dc_record")

            retries = 0
            success = False

            if not dc_record:
                log_to_file(f"this is not object")
                continue

            if (index_name == "VanAbbeBibliotheek"):
                container = get_base_folder(
                    self.context, "publication")
                container_en = get_base_folder(
                    self.context, "publication_en")
                import_one_publication(
                    self,
                    dc_record=dc_record,
                    container=container,
                    container_en=container_en,
                    catalog=catalog,
                )
            elif (index_name == "VanAbbeCollectie"):
                container = get_base_folder(
                    self.context, "artwork")
                container_en = get_base_folder(
                    self.context, "artwork_en")
                import_one_record(
                    self, 
                    dc_record=dc_record,
                    container=container,
                    container_en=container_en,
                    catalog=catalog)
            elif (index_name == "VanabbeTentoonstellingen"):
                container = get_base_folder(
                    self.context, "exhibition")
                container_en = get_base_folder(
                    self.context, "exhibition_en")
                log_to_file(f"container = {container}")
                import_one_exhibition(
                    self,
                    dc_record=dc_record,
                    container=container,
                    container_en=container_en,
                    catalog=catalog,
                )
            else:
                pass
            
            transaction.commit()
            return "finished"

    def delete_one_object(self):
        object_id = self.request.form.get("object_id")
        collection_type = self.request.form.get("collection_type")

        if collection_type == 'VanAbbeCollectie':
            portal_type = 'collection'
            container_nl = 'collection_nl'
            container_en = 'collection_en'
        elif collection_type == 'VanabbeTentoonstellingen':
            portal_type = 'collection'
            container_nl = 'collection_nl'
            container_en = 'collection_en'
        elif collection_type == 'VanAbbeBibliotheek':
            portal_type = 'collection'
            container_nl = 'collection_nl'
            container_en = 'collection_en'
        else:
            return False

        brain_nl = api.content.find(
            portal_type=portal_type, ccObjectID=object_id)
        brain_en = api.content.find(
            portal_type=portal_type, ccObjectID=object_id)

        if brain_nl and brain_en:
            object_nl = brain_nl[0].getObject()
            object_en = brain_en[0].getObject()

            object_nl.delete()
            object_en.delete()

            transaction.commit()
            return True
        else:
            return False

    def __call__(self):
        alsoProvides(self.request, IDisableCSRFProtection)
        op = self.request.form.get("op")

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
        log_to_file(
            f"Error while creating the Object {title}, -> info {info} -> error {e}"
        )
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
    for obj in api.content.find(context=container, portal_type="Image"):
        api.content.delete(obj=obj.getObject())

    for image in images:
        primaryDisplay = image.get("PrimaryDisplay")
        retries = 0
        success = False

        # Tries MAX_RETRIES times and then raise exception
        while retries < MAX_RETRIES:
            try:
                with requests.get(
                    url=f"{IMAGE_BASE_URL}/{image.text}",
                    stream=True,
                    verify=False,
                    headers=HEADERS,
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

                    if primaryDisplay == "1":
                        ordering = IExplicitOrdering(container)
                        ordering.moveObjectsToTop([image.getId()])

                    success = True
                    break

            except requests.RequestException as e:
                retries += 1
                if retries < MAX_RETRIES:
                    time.sleep(DELAY_SECONDS)
                else:
                    print(
                        f"Failed to fetch image {image.text} after {MAX_RETRIES} attempts: {e}"
                    )
                    log_to_file(f"failed to create {image.text} image")

        if not success:
            print(f"Skipped image {image.text} due to repeated fetch failures.")

    return f"Images {images} created successfully"


def import_exhibiton_images(container, images):
    MAX_RETRIES = 2
    DELAY_SECONDS = 1

    # Delete the existing images inside the container
    for obj in api.content.find(context=container, portal_type="Image"):
        api.content.delete(obj=obj.getObject())

    for image in images:
        primaryDisplay = image.get("PrimaryDisplay")
        retries = 0
        success = False

        # Tries MAX_RETRIES times and then raise exception
        while retries < MAX_RETRIES:
            try:
                with requests.get(
                    url=image.text, stream=True, verify=False, headers=HEADERS
                ) as req:  # noqa
                    req.raise_for_status()

                    # Ensure the response is an image
                    if "image" not in req.headers["Content-Type"]:
                        log_to_file(f"Skipped {image.text}: not an image")
                        break

                    data = req.raw.read()

                    # Attempt to open the image with PIL to check integrity
                    try:
                        Image.open(BytesIO(data)).verify()
                    except (IOError, SyntaxError) as e:
                        log_to_file(
                            f"Skipped {image.text}: invalid image data")
                        break


                    imagefield = NamedBlobImage(
                        data=data,
                        contentType=req.headers["Content-Type"],
                        filename=image.text,
                    )
                    image_obj = api.content.create(
                        type="Image",
                        title=image.text,
                        image=imagefield,
                        container=container,
                    )
                    log_to_file(f"{image.text} image is created")

                    if primaryDisplay == "1":
                        ordering = IExplicitOrdering(container)
                        ordering.moveObjectsToTop([image_obj.getId()])

                    success = True
                    break

            except requests.RequestException as e:
                retries += 1
                if retries < MAX_RETRIES:
                    time.sleep(DELAY_SECONDS)
                else:
                    log_to_file(f"Failed to fetch image {image.text} after {MAX_RETRIES} attempts: {e}")
                    print(f"Failed to fetch image {image.text} after {MAX_RETRIES} attempts: {e}")

        if not success:
            log_to_file(f"Skipped image {image.text} due to repeated fetch failures.")
            print(f"Skipped image {image.text} due to repeated fetch failures.")

    return f"Images {images} created successfully"


def import_authors(self, element, use_archive=True):
    container = get_base_folder(self.context, "author")
    container_en = get_base_folder(self.context, "author_en")
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
            Language="en",
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
            fields_en[k] = str(v)

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
        )  # English version

        log_to_file(f"{authorName} author is created")

        manager = ITranslationManager(author)
        if not manager.has_translation("en"):
            manager.register_translation("en", author_en)

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
            with open(log_file_path, "w") as f:
                pass
    except Exception as e:
        print(f"Error creating log file: {e}")

    # Append the log message to the file
    try:
        with open(log_file_path, "a") as f:
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
            break

    for suffix in known_suffixes:
        if raw_date.endswith(suffix):
            log_to_file(f"there is an error in the date value {raw_date}")
            raw_date = raw_date[
                : -len(suffix)
            ].strip()  # The strip() ensures any spaces are removed
            break

    try:
        # Make sure the raw_date doesn't contain non-numeric characters other than hyphen
        if not all(char.isdigit() or char == "-" for char in raw_date):
            log_to_file(f"there is an error in the date value {raw_date}")
            return None

        day, month, year = raw_date.split("-")
        if not is_valid_day(day):
            log_to_file(f"Invalid day in the date value {raw_date}")
            return None
        if len(year) == 2:  # Handle 2-digit year values, assuming it's 20th century
            year = "19" + year
        return datetime(int(year), int(month), int(day))
    except (ValueError, AttributeError):
        log_to_file(f"there is an error in the date value {raw_date}")
        return None


def is_valid_day(day_str):
    # Check if day is '00' or above 31
    return 1 <= int(day_str) <= 31


def import_one_record(self, dc_record, container, container_en, catalog):
    # Convert <dc_record> element to XML string
    dc_record_xml = ET.tostring(dc_record, encoding="unicode")

    element = lxml.etree.fromstring(dc_record_xml)

    ccObjectID = element.xpath("//dc_record/ccObjectID")[0].text
    timestamp = element.xpath("//dc_record/timestamp")[0].text

    brains = catalog.searchResults(
        ccObjectID=ccObjectID, portal_type="artwork")
    
    authors, authors_en = import_authors(self, element)

    info = {"nl": {}, "en": {}}
    intl = {"nl": {}, "en": {}}

    # ccObjectID = element.xpath("//dc_record/ccObjectID")[0].text
    info["nl"]["ccObjectID"] = ccObjectID
    info["en"]["ccObjectID"] = ccObjectID

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
        "objectCredit": "objectCredit",
        "authorID": "authorID",
    }

    language_dependent_fields = {
        "objectClassification": "objectClassification",
        "objectMedium": "objectMedium",
    }

    for lang in info.keys():
        for xml_field, info_field in language_dependent_fields.items():
            value = element.xpath(
                f"//dc_record/{xml_field}[@Language='{lang.upper()}']"
            )
            if value:
                info[lang][info_field] = value[0].text
            else:
                info[lang][info_field] = ""

    for xml_field, info_field in fields_to_extract.items():
        elements = element.xpath(f"//dc_record/{xml_field}")
        info["nl"][info_field] = elements[0].text if elements else ""
        info["en"][info_field] = elements[0].text if elements else ""

    rawdata = element.xpath("//dc_record")[0]
    info["nl"]["rawdata"] = lxml.etree.tostring(rawdata)
    info["en"]["rawdata"] = lxml.etree.tostring(rawdata)

    titles = element.xpath("//dc_record/objectTitle")
    title = titles[0].text
    if len(titles) > 1:
        titles.sort(key=lambda x: x.get("Rangorde") or "")
        title = titles[0].text
    info["nl"]["objectTitle"] = title
    info["en"]["objectTitle"] = title

    attrs = [
        "objectPosition",
        "objectFormatWidth",
        "objectFormatDepth",
        "objectFormatLength",
        "objectKeys",
        "authorID",
    ]

    for attr in attrs:
        value = element.xpath(f"//dc_record/{attr}")

        if value:
            info["en"][attr] = str(value[0].text) if value else ""
            info["nl"][attr] = str(value[0].text) if value else ""

            # If the current attribute is 'objectPosition' and the value is not empty
            if attr == "objectPosition":
                is_on_display = bool(value and str(value[0].text).strip())
                info["en"]["objectOnDisplay"] = is_on_display
                info["nl"]["objectOnDisplay"] = is_on_display
        else:
            # If the attribute is not found in the XML, set its value to an empty string
            info["en"][attr] = ""
            info["nl"][attr] = ""

            if attr == "objectPosition":
                info["en"]["objectOnDisplay"] = False
                info["nl"]["objectOnDisplay"] = False

    for field in ["ObjectAudio", "ObjectVideo"]:
        for lang in info.keys():
            els = element.xpath(
                f"//dc_record/{field}[@Language='{lang.upper()}']")
            if not els:
                continue
            info[lang][field] = [
                {
                    "title": (el.get("Title") or "").strip(),
                    "filename": (el.text or "").strip(),
                }
                for el in els
            ]

    for lang in info.keys():
        objectDescription = element.xpath(
            f"//dc_record/objectDescription[@Language='{lang.upper()}']"
        )
        if len(objectDescription) > 1:
            for e in objectDescription:
                descTitle = e.get("Title")
                descScope = e.get("Scope")
                if descTitle or descScope:
                    info[lang]["objectDescription_extra"] = str(e.text)
                    info[lang]["objectDescription_extra_title"] = descTitle
                    info[lang]["objectDescription_extra_scope"] = descScope
                else:
                    info[lang]["objectDescription"] = e.text
        elif objectDescription:
            info[lang]["objectDescription"] = objectDescription[0].text
        else:
            info[lang]["objectDescription"] = ""

    # Find the existing object
    # brains = catalog.searchResults(ccObjectID=ccObjectID, portal_type="artwork")

    # Check if only one language version of the object with ccObjectID exists
    brains = catalog.searchResults(ccObjectID=ccObjectID)
    if len(brains) == 1:
        lang = brains[0].getObject().language
        missing_lang = "en" if lang == "nl" else "nl"
        if missing_lang == "nl":
            obj = create_and_setup_object(
                title, container, info, intl, "artwork"
            )  # Dutch version
            log_to_file(f"{ccObjectID} Dutch version of object is created")
            for author in authors:
                relation.create(source=obj, target=author,
                                relationship="authors")

            manager = ITranslationManager(obj)
            if not manager.has_translation("en"):
                manager.register_translation("en", brains[0].getObject())

            # adding images
            images = element.xpath(f"//dc_record/objectImage")
            if images:
                import_images(container=obj, images=images)
                obj.hasImage = True
            else:
                obj.hasImage = False
            obj.reindexObject()

        else:
            obj_en = create_and_setup_object(
                title, container_en, info, intl, "artwork"
            )  # English version
            log_to_file(f"{ccObjectID} English version of object is created")
            for author_en in authors_en:
                relation.create(source=obj_en, target=author_en,
                                relationship="authors")

            manager = ITranslationManager(obj_en)
            if not manager.has_translation("nl"):
                manager.register_translation("nl", brains[0].getObject())

            # adding images
            images = element.xpath(f"//dc_record/objectImage")
            if images:
                import_images(container=obj_en, images=images)
                obj_en.hasImage = True
            else:
                obj_en.hasImage = False
            obj_en.reindexObject()

    # Check if object with ccObjectID already exists in the container
    # brains = catalog.searchResults(ccObjectID=ccObjectID)
    elif brains:
        for brain in brains:
            # Object exists, so we fetch it and update it
            obj = brain.getObject()
            reset_object_fields(obj, "artwork")
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
                    relation.delete(source=obj, target=author,
                                    relationship="authors")
                    relation.create(source=obj, target=author,
                                    relationship="authors")

            else:
                for author_en in authors_en:
                    relation.delete(
                        source=obj, target=author_en, relationship="authors"
                    )
                    relation.create(
                        source=obj, target=author_en, relationship="authors"
                    )

            log_to_file(f"{ccObjectID} object is updated")

            # adding images
            images = element.xpath(f"//dc_record/objectImage")
            if images:
                import_images(container=obj, images=images)
                obj.hasImage = True
            else:
                obj.hasImage = False

            # Reindex the updated object
            obj.reindexObject()

    # Object doesn't exist, so we create a new one
    else:
        if not title:
            title = "Untitled Object"  # default value for untitled objects

        obj = create_and_setup_object(
            title, container, info, intl, "artwork"
        )  # Dutch version
        # obj_en = create_and_setup_object(title, container_en, info, intl) #English version
        obj_en = self.translate(obj, info["en"])

        log_to_file(f"{ccObjectID} object is created")

        for author in authors:
            relation.create(source=obj, target=author, relationship="authors")
        for author_en in authors_en:
            relation.create(source=obj_en, target=author_en,
                            relationship="authors")

        logger.info("Created %s", obj.absolute_url(relative=1))

        # adding images
        images = element.xpath(f"//dc_record/objectImage")
        if images:
            import_images(container=obj, images=images)
            obj.hasImage = True
        else:
            obj.hasImage = False

        obj_en = self.translate(obj, info["en"])

    return True


def import_one_exhibition(self, dc_record, container, container_en, catalog):
    # Convert <dc_record> element to XML string
    dc_record_xml = ET.tostring(dc_record, encoding="unicode")

    element = lxml.etree.fromstring(dc_record_xml)

    ccObjectID = element.xpath("//dc_record/ccObjectID")[0].text

    log_to_file(f"ccObjectID: {ccObjectID}")
    brains = catalog.searchResults(
        ccObjectID=ccObjectID, portal_type="exhibition")



    info = {"nl": {}, "en": {}}
    intl = {"nl": {}, "en": {}}

    info["nl"]["ccObjectID"] = ccObjectID
    info["en"]["ccObjectID"] = ccObjectID

    fields_to_extract = {
        "ccIdentifier": "ccIdentifier",
        "ccIndexName": "ccIndexName",
        "eventCoorporation": "eventCoorporation",
        "eventDescription": "eventDescription",
        "recordnumber": "recordnumber",
        "eventTimeFrom": "eventTimeFrom",
        "eventTimeStart": "eventTimeStart",
        "eventTimeEnd": "eventTimeEnd",
        "eventSub": "eventSub",
    }

    language_dependent_fields = {
        "eventTitle": "eventTitle",
    }

    for lang in info.keys():
        for xml_field, info_field in language_dependent_fields.items():
            value = element.xpath(
                f"//dc_record/{xml_field}[@Language='{lang.upper()}']"
            )
            if value:
                info[lang][info_field] = value[0].text
            else:
                info[lang][info_field] = ""

    for xml_field, info_field in fields_to_extract.items():
        elements = element.xpath(f"//dc_record/{xml_field}")
        if elements:
            if xml_field in ["eventTimeStart", "eventTimeEnd"]:
                date_value = convert_to_date(elements[0].text.split("^")[0])
                info["nl"][info_field] = date_value
                info["en"][info_field] = date_value
            else:
                info["nl"][info_field] = elements[0].text
                info["en"][info_field] = elements[0].text
        else:
            # Check if the field is a date field, and if so, set the default value to None.
            if xml_field in ["eventTimeStart", "eventTimeEnd"]:
                info["nl"][info_field] = None
                info["en"][info_field] = None
            else:
                info["nl"][info_field] = ""
                info["en"][info_field] = ""

    rawdata = element.xpath("//dc_record")[0]
    info["nl"]["rawdata"] = lxml.etree.tostring(rawdata)
    info["en"]["rawdata"] = lxml.etree.tostring(rawdata)

    title = element.xpath("//dc_record/eventTitle")
    title_en = element.xpath("//dc_record/eventTitle_EN")
    if len(title) > 0:
        title = element.xpath("//dc_record/eventTitle")
        title_en = element.xpath("//dc_record/eventTitle_EN")
        info["nl"]["eventTitle"] = title[0].text
        if title_en == None or len(title_en) < 1:
            info["en"]["eventTitle"] = title[0].text
        else:
            info["en"]["eventTitle"] = title_en[0].text
    else:
        title = "Naamloze Tentoonstelling"
        title_en = "Untitled Exhibition"
        info["nl"]["eventTitle"] = title
        info["en"]["eventTitle"] = title_en

    eventArtists = element.xpath("//dc_record/eventArtist")
    if eventArtists:
        artists = [artist.text for artist in eventArtists if artist.text]
        info["nl"]["eventArtist"] = artists
        info["en"]["eventArtist"] = artists

    for field in ["eventImages", "eventMedia"]:
        els = element.xpath(f"//dc_record/{field}")
        # info[field] = "\n".join(v)
        full_text = ""
        for el in els:
            full_text += el.text + "\n"
        info["nl"][field] = full_text
        info["en"][field] = full_text

    # Check if only one language version of the object with ccObjectID exists
    if len(brains) == 1:
        lang = brains[0].getObject().language
        missing_lang = "en" if lang == "nl" else "nl"
        if missing_lang == "nl":
            obj = create_and_setup_object(
                info["nl"]["eventTitle"], container, info, intl, "exhibition"
            )  # Dutch version
            log_to_file(f"{ccObjectID} Dutch version of exhibition is created")

            manager = ITranslationManager(obj)
            if not manager.has_translation("en"):
                manager.register_translation("en", brains[0].getObject())

            # adding images
            images = element.xpath(f"//dc_record/eventImages")
            if images:
                import_exhibiton_images(container=obj, images=images)

        else:
            obj_en = create_and_setup_object(
                info["en"]["eventTitle"], container_en, info, intl, "exhibition"
            )  # English version
            log_to_file(
                f"{ccObjectID} English version of exhibition is created")

            manager = ITranslationManager(obj_en)
            if not manager.has_translation("nl"):
                manager.register_translation("nl", brains[0].getObject())

            # adding images
            images = element.xpath(f"//dc_record/eventImages")
            if images:
                import_exhibiton_images(container=obj_en, images=images)

    # Check if object with ccObjectID already exists in the container
    elif brains:
        for brain in brains:
            # Object exists, so we fetch it and update it
            obj = brain.getObject()
            reset_object_fields(obj, "exhibition")

            # Update the object's fields with new data
            lang = obj.language
            for k, v in info[lang].items():
                if v:
                    setattr(obj, k, v)

            for k, v in intl[lang].items():
                if v:
                    setattr(obj, k, json.dumps(v))

            log_to_file(f"{ccObjectID} exhibition is updated")

            # adding images
            images = element.xpath(f"//dc_record/eventImages")
            if images:
                import_exhibiton_images(container=obj, images=images)
            # obj.hasImage=True;

            # Reindex the updated object
            obj.reindexObject()
            # obj.reindexObject(idxs=['objectTitle', 'Title', 'sortable_title', 'authorID'])

    # Object doesn't exist, so we create a new one
    else:
        if not title:
            title = "Untitled Object"  # default value for untitled objects

        obj = create_and_setup_object(
            info["nl"]["eventTitle"], container, info, intl, "exhibition"
        )  # Dutch version

        log_to_file(f"{ccObjectID} exhibition is created")

        logger.info("Created %s", obj.absolute_url(relative=1))

        # adding images
        images = element.xpath(f"//dc_record/eventImages")
        if images:
            import_exhibiton_images(container=obj, images=images)
            # obj.hasImage=True;

        obj_en = self.translate(obj, info["en"])

    return True


def import_one_publication(self, dc_record, container, container_en, catalog):
    # Convert <dc_record> element to XML string
    dc_record_xml = ET.tostring(dc_record, encoding="unicode")

    # print(dc_record_xml)
    element = lxml.etree.fromstring(dc_record_xml)

    ccObjectID = element.xpath("//dc_record/ccObjectID")[0].text
    timestamp = element.xpath("//dc_record/timestamp")[0].text

    brains = catalog.searchResults(
        ccObjectID=ccObjectID, portal_type="publication")

    info = {"nl": {}, "en": {}}
    intl = {"nl": {}, "en": {}}

    info["nl"]["ccObjectID"] = ccObjectID
    info["en"]["ccObjectID"] = ccObjectID

    fields_to_extract = {
        "bookAnnotation": "bookAnnotation",
        "bookBarcode": "bookBarcode",
        "bookBBCode": "bookBBCode",
        "bookBbnummer": "bookBbnummer",
        "bookBinding": "bookBinding",
        "bookCity": "bookCity",
        "bookCountry": "bookCountry",
        "bookDatePublished": "bookDatePublished",
        "bookDescription": "bookDescription",
        "bookPublisher": "bookPublisher",
        "bookShelfmark": "bookShelfmark",
        "BookSubTitle": "bookSubTitle",
        "BookTitle": "BookTitle",
        "bookVubisid": "bookVubisid",
        "ccIdentifier": "ccIdentifier",
        "ccIndexName": "ccIndexName",
        "recordnumber": "recordnumber",
        "VubisID": "vubisID",
        "bookLanguage": "bookLanguage",
        "bookStream": "bookStream",
        "bookMaterial": "bookMaterial",
        "BookTitle_ALT": "bookTitle_ALT",
    }

    for xml_field, info_field in fields_to_extract.items():
        elements = element.xpath(f"//dc_record/{xml_field}")
        if elements:
            info["nl"][info_field] = elements[0].text
            info["en"][info_field] = elements[0].text
        else:
            info["nl"][info_field] = ""
            info["en"][info_field] = ""

    rawdata = element.xpath("//dc_record")[0]
    info["nl"]["rawdata"] = lxml.etree.tostring(rawdata)
    info["en"]["rawdata"] = lxml.etree.tostring(rawdata)

    title = element.xpath("//dc_record/BookTitle")
    if title:
        info["nl"]["BookTitle"] = title[0].text
        info["en"]["BookTitle"] = title[0].text
    else:
        info["nl"]["BookTitle"] = "Titelloze publicatie"
        info["en"]["BookTitle"] = "Untitled publication"

    bookArtist = element.xpath("//dc_record/bookArtist")
    if bookArtist:
        artists = [artist.text for artist in bookArtist if artist.text]
        info["nl"]["bookArtist"] = artists
        info["en"]["bookArtist"] = artists

    for field in ["bookIllustrations", "bookMedia", "bookauthorName"]:
        els = element.xpath(f"//dc_record/{field}")

        # Check if els is not empty
        if els:
            full_text = ""
            for el in els:
                # Safely access the text attribute of the element
                if el is not None and el.text is not None:
                    full_text += el.text + "\n"
            info["nl"][field] = full_text
            info["en"][field] = full_text
        # else:
        # Optionally log or print that the XPath returned no results
        # log_to_file(f"XPath for {field} returned no results.")

    # Check if only one language version of the object with ccObjectID exists
    brains = catalog.searchResults(ccObjectID=ccObjectID)
    if len(brains) == 1:
        lang = brains[0].getObject().language
        missing_lang = "en" if lang == "nl" else "nl"
        if missing_lang == "nl":
            obj = create_and_setup_object(
                info["nl"]["BookTitle"], container, info, intl, "publication"
            )  # Dutch version
            log_to_file(
                f"{ccObjectID} Dutch version of publication is created")

            manager = ITranslationManager(obj)
            if not manager.has_translation("en"):
                manager.register_translation("en", brains[0].getObject())

            # adding images
            images = element.xpath(f"//dc_record/bookIllustrations")
            if images:
                import_exhibiton_images(container=obj, images=images)
            obj.reindexObject()

        else:
            obj_en = create_and_setup_object(
                info["en"]["BookTitle"], container_en, info, intl, "publication"
            )  # English version
            log_to_file(
                f"{ccObjectID} English version of publication is created")

            manager = ITranslationManager(obj_en)
            if not manager.has_translation("nl"):
                manager.register_translation("nl", brains[0].getObject())

            # adding images
            images = element.xpath(f"//dc_record/bookIllustrations")
            if images:
                import_exhibiton_images(container=obj_en, images=images)
            obj_en.reindexObject()

    # Check if object with ccObjectID already exists in the container
    elif brains:
        for brain in brains:
            # Object exists, so we fetch it and update it
            obj = brain.getObject()
            reset_object_fields(obj, "publication")

            # Update the object's fields with new data
            lang = obj.language
            for k, v in info[lang].items():
                if v:
                    setattr(obj, k, v)

            for k, v in intl[lang].items():
                if v:
                    setattr(obj, k, json.dumps(v))

            log_to_file(f"{ccObjectID} publication is updated")

            # adding images
            images = element.xpath(f"//dc_record/bookIllustrations")
            if images:
                import_exhibiton_images(container=obj, images=images)

            # Reindex the updated object
            obj.reindexObject()

    # Object doesn't exist, so we create a new one
    else:
        if not title:
            title = "Untitled Publication"  # default value for untitled objects

        obj = create_and_setup_object(
            info["nl"]["BookTitle"], container, info, intl, "publication"
        )  # Dutch version

        log_to_file(f"{ccObjectID} publication is created")

        logger.info("Created %s", obj.absolute_url(relative=1))

        # adding images
        images = element.xpath(f"//dc_record/bookIllustrations")
        if images:
            import_exhibiton_images(container=obj, images=images)

        try:
            obj_en = self.translate(obj, info["en"])
        except:
            log_to_file(f"the eng translation object was not able to create")

    return True


def reset_object_fields(obj, type):
    # Define the fields you want to preserve and not reset
    preserved_fields = ["ccObjectID"]

    if type == "artwork":
        interface = IArtwork
    elif type == "exhibition":
        interface = IExhibition
    elif type == "publication":
        interface = IPublication
    else:
        raise ValueError(
            "Invalid type specified. Must be 'artwork', 'exhibition', or 'publication'."
        )

    # Iterate over all fields defined in the IArtwork schema
    for fieldname in interface:
        # Skip over preserved fields
        if fieldname in preserved_fields:
            continue

        # Access the field from the schema
        field = interface[fieldname]

        # Determine the default 'empty' value for the field based on its type
        if IRichText.providedBy(field):
            default_value = RichTextValue(
                raw="", mimeType="text/plain", outputMimeType="text/x-html-safe"
            )
        elif IList.providedBy(field):
            default_value = []
        elif IText.providedBy(field) or ITextLine.providedBy(field):
            default_value = ""
        else:
            default_value = field.missing_value

        # Reset the field value using the mutator if available or directly
        mutator = getattr(obj, "set%s" % fieldname.capitalize(), None)
        if mutator:
            mutator(default_value)
        else:
            setattr(obj, fieldname, default_value)
