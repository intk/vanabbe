""" Debugging importer views
"""

from intk_vanabbe.importer import scroll
from plone.api import content
from plone.api.content import find
from plone.app.multilingual.api import translate
from plone.namedfile.file import NamedBlobImage
from plone.protect.interfaces import IDisableCSRFProtection
from Products.Five.browser import BrowserView
from zope.interface import alsoProvides

import hashlib
import logging
import os
import requests


IMAGE_BASE_URL = "https://vanabbemuseum.nl/fileadmin/files/collectie/%s"

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


def convert_lists_to_text(rec):
    for k, v in rec.items():
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


def import_images(container, urls):
    for url in urls:
        fname = get_filename(url)

        if os.path.isfile(fname):
            print("File already exists", fname)

        import pdb

        pdb.set_trace()
        with requests.get(url, stream=True, verify=False) as req:
            stream = req.raw
            imagefield = NamedBlobImage(
                # TODO: are all images jpegs?
                data=stream,
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

        import_artwork = lambda info: None
        import_publication = lambda info: None
        import_exhibition = lambda info: None

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

        scroll(
            import_artwork,
            import_publication,
            import_exhibition,
            max_records=int(form.get("max", 100)),
            query=query,
        )

        return "done"

    def import_author(self, rec):
        container = self.context
        org = extract_lang(rec, "nl")

        brains = find(
            portal_type="author",
            authorID=rec["authorID"],
        )

        if brains:
            return

        # TODO: check cases where there are multiple authors
        # TODO: setup special folder location for authors
        fields = dict(
            title=org.get("authorName", org["authorID"]),
            AuthorBio=org.get("AuthorBio"),
            authorName=org.get("authorName"),
            authorBirthDate=org.get("authorBirthDate"),
            authorDeathDate=org.get("authorDeathDate"),
            authorID=org["authorID"],
            authorURL=org.get("authorURL"),
        )

        author = content.create(
            type="author", id=f'author-{rec["authorID"]}', container=container, **fields
        )

        print("Created author", author.getId())

        trans = extract_lang(rec, "en")
        fields["authorURL"] = trans["authorURL"]
        self.translate(author, fields)

        return True

    def import_artwork(self, rec):
        container = self.context

        filenames = rec.get("objectImage", [])
        if isinstance(filenames, str):
            filename = [filenames]
        filenames = [IMAGE_BASE_URL % fname for fname in filename]

        converted = convert_lists_to_text(rec)
        converted["title"] = converted["objectTitle"].split("\n")[0]

        original = extract_lang(converted, "nl")

        obj = content.create(
            type="artwork",
            id=f'art-{original["ccObjectID"]}',
            container=container,
            **original,
        )
        import_images(obj, filenames)

        self.import_author(converted)
        trans_rec = extract_lang(converted, "en")
        self.translate(obj, trans_rec)
        print("Imported artwork: ", path(obj))

        return True

    def import_publication(self, rec):

        bookArtist = rec.get("bookArtist")
        if bookArtist and not isinstance(bookArtist, list):
            rec["bookArtist"] = [bookArtist]

        container = self.context
        obj = content.create(
            type="publication",
            id=f'book-{toid(rec["ccObjectID"])}',
            title=rec["BookTitle"],
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

    def import_exhibition(self, rec):
        container = self.context

        rec = convert_lists_to_text(rec)
        rec["title"] = rec["eventTitle"]
        en_title = None

        if rec.get("eventTitle_EN"):
            en_title = rec["eventTitle_EN"]
            del rec["eventTitle_EN"]

        try:
            obj = content.create(
                type="exhibition",
                id=f'exh-{str(rec["recordnumber"])}',
                container=container,
                **rec,
            )
            print("Imported exhibition", path(obj))

            if en_title:
                rec["title"] = en_title
                rec["eventTitle"] = en_title

            self.translate(obj, rec)
        except Exception:
            logger.exception("Unable to import exhibition")

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
