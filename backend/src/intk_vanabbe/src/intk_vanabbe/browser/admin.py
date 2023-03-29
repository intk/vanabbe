from intk_vanabbe.config import DATA_REPO
from plone.api import portal
from plone.protect.interfaces import IDisableCSRFProtection
from Products.Five.browser import BrowserView
from zope.interface import alsoProvides

import logging
import os
import transaction


logger = logging.getLogger('vubis')


class AdminFixes(BrowserView):
    """Vubis import on demand, for debugging"""

    def _get_filenames(self):
        repo = DATA_REPO
        filenames = [
            os.path.join(repo, f)
            for f in next(os.walk(repo), (None, None, []))[2]
            if f.endswith(".xml")
        ]
        return filenames

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
        to_import = []
        for fname in self._get_filenames():
            with open(fname) as f:
                content = f.read()
                if "<objectIsVisible>1</objectIsVisible>" in content:
                    to_import.append(fname)

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

    def __call__(self):
        alsoProvides(self.request, IDisableCSRFProtection)
        op = self.request.form.get('op')
        return getattr(self, op)()
