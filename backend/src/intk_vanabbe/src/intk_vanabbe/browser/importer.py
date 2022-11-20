""" Debugging importer views
"""

from intk_vanabbe.importer import scroll
from plone.api import content
from plone.protect.interfaces import IDisableCSRFProtection
from Products.Five.browser import BrowserView
from zope.interface import alsoProvides


class ImportVubis(BrowserView):
    """ Vubis import on demand, for debugging
    """

    def __call__(self):
        alsoProvides(self.request, IDisableCSRFProtection)

        scroll(self.import_artwork, self.import_publication)
        return "done"

    def import_artwork(self, rec):
        container = self.context
        obj = content.create(type='artwork',
                id=rec['ccObjectID'], container=container, **rec)
        print("Imported", obj)

    def import_publication(self, rec):
        container = self.context
        obj = content.create(type='publication',
                id=rec['ccObjectID'],
                container=container, **rec)
        print("Imported", obj)
