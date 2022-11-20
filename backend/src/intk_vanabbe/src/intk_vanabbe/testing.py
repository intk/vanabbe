from plone.app.contenttypes.testing import PLONE_APP_CONTENTTYPES_FIXTURE
from plone.app.robotframework.testing import REMOTE_LIBRARY_BUNDLE_FIXTURE
from plone.app.testing import applyProfile
from plone.app.testing import FunctionalTesting
from plone.app.testing import IntegrationTesting
from plone.app.testing import PloneSandboxLayer
from plone.testing.zope import WSGI_SERVER_FIXTURE

import intk_vanabbe


class INTK_VANABBELayer(PloneSandboxLayer):

    defaultBases = (PLONE_APP_CONTENTTYPES_FIXTURE,)

    def setUpZope(self, app, configurationContext):
        # Load any other ZCML that is required for your tests.
        # The z3c.autoinclude feature is disabled in the Plone fixture base
        # layer.
        import plone.restapi

        self.loadZCML(package=plone.restapi)
        self.loadZCML(package=intk_vanabbe)

    def setUpPloneSite(self, portal):
        applyProfile(portal, "intk_vanabbe:default")
        applyProfile(portal, "intk_vanabbe:initial")


INTK_VANABBE_FIXTURE = INTK_VANABBELayer()


INTK_VANABBE_INTEGRATION_TESTING = IntegrationTesting(
    bases=(INTK_VANABBE_FIXTURE,),
    name="INTK_VANABBELayer:IntegrationTesting",
)


INTK_VANABBE_FUNCTIONAL_TESTING = FunctionalTesting(
    bases=(INTK_VANABBE_FIXTURE, WSGI_SERVER_FIXTURE),
    name="INTK_VANABBELayer:FunctionalTesting",
)


INTK_VANABBEACCEPTANCE_TESTING = FunctionalTesting(
    bases=(
        INTK_VANABBE_FIXTURE,
        REMOTE_LIBRARY_BUNDLE_FIXTURE,
        WSGI_SERVER_FIXTURE,
    ),
    name="INTK_VANABBELayer:AcceptanceTesting",
)
