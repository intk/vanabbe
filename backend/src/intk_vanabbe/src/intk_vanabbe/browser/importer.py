""" Debugging importer views
"""

from intk_vanabbe.importer import scroll
from plone.api import content
from plone.namedfile.file import NamedBlobImage
from plone.protect.interfaces import IDisableCSRFProtection
from Products.Five.browser import BrowserView
from zope.interface import alsoProvides

import logging


logger = logging.getLogger("vubis")


def path(obj):
    return obj.abolute_url(relative=1)


class ImportVubis(BrowserView):
    """ Vubis import on demand, for debugging
    """

    def __call__(self):
        alsoProvides(self.request, IDisableCSRFProtection)

        scroll(self.import_artwork, self.import_publication)
        return "done"

    def import_artwork(self, rec):
        container = self.context
        filenames = rec.pop('objectImage', None)

        obj = content.create(
            type='artwork',
            id=rec['ccObjectID'], title=rec['ccObjectID'],
            container=container, **rec)

        if filenames:
            for fname in filenames:
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

        print("Imported artwork: ", path(obj))

    def import_publication(self, rec):
        container = self.context
        try:
            obj = content.create(
                type='publication',
                id=rec['ccObjectID'], title=rec['ccObjectID'],
                container=container, **rec)
            print("Imported publication", path(obj))
        except Exception:
            logger.exception("Unable to import publication")
