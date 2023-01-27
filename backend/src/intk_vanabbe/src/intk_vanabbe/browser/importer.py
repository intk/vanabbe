""" Debugging importer views
"""

from intk_vanabbe.importer import INTL_FIELDS
from intk_vanabbe.importer import scroll
from plone.api import content
from plone.app.multilingual.api import translate
from plone.namedfile.file import NamedBlobImage
from plone.protect.interfaces import IDisableCSRFProtection
from Products.Five.browser import BrowserView
from zope.interface import alsoProvides

import logging


logger = logging.getLogger("vubis")


def path(obj):
    return obj.absolute_url(relative=1)


def convert_lists_to_text(rec):
    for k, v in rec.items():
        if isinstance(v, list):
            rec[k] = "\n".join(v)

    return rec

def extract_lang(rec, lang='nl'):
    res = {}

    for k, v in rec.items():
        if isinstance(v, dict):
            v = v.get(lang, v.get('nl'))
            if not v:
                lang = list(rec[k].keys())[0]
                v = rec[k][lang]
                print("Falling back to value", lang, k)
                # sometimes only the english version exists
                # import pdb; pdb.set_trace()

        res[k] = v

    return res


class ImportVubis(BrowserView):
    """ Vubis import on demand, for debugging
    """

    def __call__(self):
        alsoProvides(self.request, IDisableCSRFProtection)
        form = self.request.form

        import_artwork = lambda info: None
        import_publication = lambda info: None
        import_exhibition = lambda info: None

        if form.get('import') == 'artwork':
            import_artwork = self.import_artwork
        elif form.get('import') == 'publication':
            import_publication = self.import_publication
        elif form.get('import') == 'exhibition':
            import_exhibition = self.import_exhibition
        else:
            import_artwork = self.import_artwork
            import_publication = self.import_publication
            import_exhibition = self.import_exhibition

        scroll(
            import_artwork, import_publication, import_exhibition,
            max_records=int(form.get('max', 100))
        )

        return "done"

    def import_artwork(self, rec):
        container = self.context
        filenames = rec.pop('objectImage', None)

        converted = convert_lists_to_text(rec)
        converted['title'] = converted['objectTitle'].split('\n')[0]

        original = extract_lang(converted, 'nl')

        obj = content.create(
            type='artwork',
            id=original['ccObjectID'],
            container=container, **original)

        if filenames:
            for fname in filenames:
                try:
                    with open(fname, 'rb') as stream:
                        fid = fname.rsplit('/', 1)[-1]
                        imagefield = NamedBlobImage(
                            data=stream,
                            contentType="image/jpeg",
                            filename=fid)
                        image = content.create(
                            type='Image', id=fid, title=fid, image=imagefield,
                            container=obj)

                        print("Created image", path(image))
                except Exception:
                    logger.exception("Could not import image %s", fname)

        trans_rec = extract_lang(converted, 'en')
        self.translate(obj, trans_rec)
        print("Imported artwork: ", path(obj))

        return True

    def import_publication(self, rec):
        container = self.context
        try:
            obj = content.create(
                type='publication',
                id=rec['ccObjectID'], title=rec['ccObjectID'],
                container=container, **rec)
            print("Imported publication", path(obj))
            self.translate(obj, rec)
        except Exception:
            logger.exception("Unable to import publication")

        return True

    def import_exhibition(self, rec):
        container = self.context

        rec = convert_lists_to_text(rec)
        rec['title'] = rec['eventTitle']
        en_title = None

        if rec.get('eventTitle_EN'):
            en_title = rec['eventTitle_EN']
            del rec['eventTitle_EN']

        try:
            obj = content.create(
                type='exhibition',
                id=str(rec['recordnumber']),
                container=container, **rec)
            print("Imported exhibition", path(obj))

            if en_title:
                rec['title'] = en_title
                rec['eventTitle'] = en_title

            self.translate(obj, rec)
        except Exception:
            logger.exception("Unable to import exhibition")

        return True

    def translate(self, obj, fields):
        language = 'en'
        trans = translate(obj, language)

        for k, v in fields.items():
            setattr(trans, k, v)

        for id, child in obj.contentItems():
            content.copy(child, trans)

        trans._p_changed = True
