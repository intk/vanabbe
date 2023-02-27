""" Debugging importer views
"""

from .request import HEADERS
from intk_vanabbe.importer import scroll
from plone.api import content
from plone.api import portal
from plone.api import relation
from plone.app.multilingual.api import get_translation_manager
from plone.app.multilingual.api import translate
from plone.namedfile.file import NamedBlobImage
from plone.protect.interfaces import IDisableCSRFProtection
from Products.Five.browser import BrowserView

# from z3c.relationfield import RelationValue
from zope.interface import alsoProvides

import hashlib
import logging
import os
import requests


IMAGE_BASE_URL = "https://vanabbemuseum.nl/fileadmin/files/collectie/%s"
IMPORT_LOCATIONS = {
    "artwork": "nl/collectie-onderzoek/vaste-collectie/kunstwerken",
    "publication": "nl/collectie-onderzoek/bibliotheek/publicaties",
    "exhibition": "nl/tentoonstellingen",
    "author": "nl/collectie-onderzoek/kunstenaars",
}

logger = logging.getLogger("vubis")


def get_filename(url):
    m = hashlib.sha1()
    m.update(url.encode("ascii"))

    ext = url.rsplit(".", 1)[-1]

    return f"{m.hexdigest()}.{ext}"


def toid(s):
    return s.replace(":", "-")


def path(obj):
    return obj.absolute_url(relative=1)


# TODO: do we still need this?
def convert_lists_to_text(rec, blacklist=None):
    blacklist = blacklist or []
    for k, v in rec.items():
        if k in blacklist:
            continue
        if isinstance(v, list):
            rec[k] = "\n".join(v)

    return rec


def extract_lang(rec, lang="nl"):
    res = {}

    for k, v in rec.items():
        if isinstance(v, dict):
            v = v.get(lang, v.get("nl"))
            if not v:
                lang = list(rec[k].keys())[0]
                v = rec[k][lang]
                print("Falling back to value", lang, k)
                # sometimes only the english version exists

        res[k] = v

    return res


def get_base_folder(context, portal_type):
    base = portal.get()
    return base.restrictedTraverse(IMPORT_LOCATIONS[portal_type])


def debug(func):
    def wrapper(*args):
        try:
            res = func(*args)
        except Exception as e:
            logger.error(f"Exception {e}")
            return
            # import pdb
            #
            # pdb.set_trace()

        return res

    return wrapper


def import_images(container, urls):
    for url in urls:
        url = url.strip()

        fname = get_filename(url)

        if os.path.isfile(fname):
            print("File already exists", fname)

        with requests.get(url, stream=True, verify=False, headers=HEADERS) as req:
            data = req.raw.read()

            if "DOCTYP" in str(data[:10]):  # avoids missing images
                continue

            # TODO: should use streaming
            imagefield = NamedBlobImage(
                # TODO: are all images jpegs?
                data=data,
                contentType="image/jpeg",
                filename=fname,
            )
            image = content.create(
                type="Image",
                id=fname,
                title=fname,
                image=imagefield,
                container=container,
            )

            print("Created image", path(image))


class ImportVubis(BrowserView):
    """Vubis import on demand, for debugging"""

    def __call__(self):
        alsoProvides(self.request, IDisableCSRFProtection)
        form = self.request.form

        import_artwork = lambda *args: None
        import_publication = lambda *args: None
        import_exhibition = lambda *args: None

        if form.get("clean"):
            for ptype in IMPORT_LOCATIONS.keys():
                container = get_base_folder(self.context, ptype)
                intl_mgr = get_translation_manager(container)
                trans_container = intl_mgr.get_translation("en")

                for obj in [container, trans_container]:
                    ids = obj.contentIds()
                    if ids:
                        obj.manage_delObjects(ids)

        if form.get("import") == "artwork":
            import_artwork = self.import_artwork
        elif form.get("import") == "publication":
            import_publication = self.import_publication
        elif form.get("import") == "exhibition":
            import_exhibition = self.import_exhibition
        else:
            import_artwork = self.import_artwork
            import_publication = self.import_publication
            import_exhibition = self.import_exhibition

        query = None
        if "query" in form:
            query = f'&query={form["query"]}'
        else:
            query = "&query=*=*"

        scroll(
            import_artwork,
            import_publication,
            import_exhibition,
            max_records=int(form.get("max", 100)),
            query=query,
        )

        return "done"

    def import_authors(self, rec, element):

        container = get_base_folder(self.context, "author")
        authors = []

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
            if found:
                authors += [b.getObject() for b in found]
                continue

            x = element.xpath

            el = x(f"authorName[@authorID={authorID}]")[0]
            authorSortName = el.get("authorSortName")
            authorName = el.text

            authorBirthDate = x(f"authorBirthDate[@authorID={authorID}]/text()")
            if authorBirthDate:
                authorBirthDate = authorBirthDate[0]

            authorDeathDate = x(f"authorDeathDate[@authorID={authorID}]/text()")
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
            for k, v in fields.items():
                fields[k] = str(v)

            author = content.create(
                type="author",
                # id=f'author-{rec["authorID"]}',
                container=container,
                **fields,
            )
            authors.append(author)

            if urls.get("en"):
                fields["authorURL"] = urls["en"]
                fields["authorURLTitle"] = url_titles["en"]
            for k, v in fields.items():
                fields[k] = str(v)

            self.translate(author, fields)

            print("Created author", author.getId())

        return authors

    @debug
    def import_artwork(self, rec, element):
        logger.info(f"Importing artwork ccObjectID: {rec['ccObjectID']}")
        container = get_base_folder(self.context, "artwork")

        filenames = rec.get("objectImage", [])
        if isinstance(filenames, str):
            filenames = [filenames]
        filenames = [IMAGE_BASE_URL % fname for fname in filenames]
        rec["objectImage"] = "\n".join(filenames)

        converted = convert_lists_to_text(rec)
        converted["title"] = converted["objectTitle"].split("\n")[0]

        original = extract_lang(converted, "nl")

        authors = self.import_authors(converted, element)

        obj = content.create(
            type="artwork",
            # id=f'art-{original["ccObjectID"]}',
            container=container,
            **original,
        )
        for author in authors:
            relation.create(source=obj, target=author, relationship="authors")

        import_images(obj, filenames)

        trans_rec = extract_lang(converted, "en")
        translated_authors = self.get_translations(authors, language="en")
        translated = self.translate(obj, trans_rec)
        for trans_auth in translated_authors:
            relation.create(
                source=translated, target=trans_auth, relationship="authors"
            )

        print("Imported artwork: ", path(obj))

        return True

    @debug
    def import_publication(self, rec, element):
        logger.info(f"Importing publication ccObjectID: {rec['ccObjectID']}")

        rec = convert_lists_to_text(rec, ["bookIllustrations", "bookArtist"])
        bookArtist = rec.get("bookArtist")
        if bookArtist and not isinstance(bookArtist, list):
            rec["bookArtist"] = [bookArtist]

        container = get_base_folder(self.context, "publication")
        if "BookTitle" not in rec:
            return
        rec["title"] = rec["BookTitle"]
        obj = content.create(
            type="publication",
            # id=f'pub-{toid(rec["ccObjectID"])}',
            container=container,
            **rec,
        )

        filenames = rec.get("bookIllustrations", [])
        if isinstance(filenames, str):
            filenames = [filenames]

        import_images(obj, filenames)

        self.translate(obj, rec)
        print("Imported publication", path(obj))

        return True

    @debug
    def import_exhibition(self, rec, element):
        logger.info(f"Importing exhibition recordnumber: {rec['recordnumber']}")
        container = get_base_folder(self.context, "exhibition")

        rec = convert_lists_to_text(rec, ["eventImages", "eventArtist"])
        if rec.get("eventArtist") and not isinstance(rec["eventArtist"], list):
            rec["eventArtist"] = [rec["eventArtist"]]

        rec["title"] = rec["eventTitle"]
        en_title = None
        filenames = rec.get("eventImages", [])
        if isinstance(filenames, str):
            filenames = [filenames]
        filenames = [f.strip() for f in filenames]
        rec["eventImages"] = "\n".join(filenames)

        if rec.get("eventTitle_EN"):
            en_title = rec["eventTitle_EN"]
            del rec["eventTitle_EN"]

        obj = content.create(
            type="exhibition",
            # id=f'exh-{str(rec["recordnumber"])}',
            container=container,
            **rec,
        )
        print("Imported exhibition", path(obj))

        if en_title:
            rec["title"] = en_title
            rec["eventTitle"] = en_title

        import_images(obj, filenames)

        self.translate(obj, rec)

        return True

    def translate(self, obj, fields):
        language = "en"
        trans = translate(obj, language)

        for k, v in fields.items():
            setattr(trans, k, v)

        for id, child in obj.contentItems():
            # TODO: use translator instead of copy
            content.copy(child, trans)

        trans._p_changed = True
        trans.reindexObject()

        return trans

    def get_translations(self, objects, language="en"):
        res = []
        for obj in objects:
            mgr = get_translation_manager(obj)
            trans = mgr.get_translation(language)
            if trans:
                res.append(trans)
            else:
                logger.warning("Could not get translation", obj, language)

        return res
