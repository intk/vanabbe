# -*- coding: utf-8 -*-
from plone.app.contenttypes.testing import PLONE_APP_CONTENTTYPES_FIXTURE
from plone.app.robotframework.testing import REMOTE_LIBRARY_BUNDLE_FIXTURE
from plone.app.testing import applyProfile
from plone.app.testing import FunctionalTesting
from plone.app.testing import IntegrationTesting
from plone.app.testing import PloneSandboxLayer
from plone.testing import z2

import intk.vanabbe


class IntkVanabbeLayer(PloneSandboxLayer):

    defaultBases = (PLONE_APP_CONTENTTYPES_FIXTURE,)

    def setUpZope(self, app, configurationContext):
        # Load any other ZCML that is required for your tests.
        # The z3c.autoinclude feature is disabled in the Plone fixture base
        # layer.
        import plone.restapi
        self.loadZCML(package=plone.restapi)
        self.loadZCML(package=intk.vanabbe)

    def setUpPloneSite(self, portal):
        applyProfile(portal, 'intk.vanabbe:default')


INTK_VANABBE_FIXTURE = IntkVanabbeLayer()


INTK_VANABBE_INTEGRATION_TESTING = IntegrationTesting(
    bases=(INTK_VANABBE_FIXTURE,),
    name='IntkVanabbeLayer:IntegrationTesting',
)


INTK_VANABBE_FUNCTIONAL_TESTING = FunctionalTesting(
    bases=(INTK_VANABBE_FIXTURE,),
    name='IntkVanabbeLayer:FunctionalTesting',
)


INTK_VANABBE_ACCEPTANCE_TESTING = FunctionalTesting(
    bases=(
        INTK_VANABBE_FIXTURE,
        REMOTE_LIBRARY_BUNDLE_FIXTURE,
        z2.ZSERVER_FIXTURE,
    ),
    name='IntkVanabbeLayer:AcceptanceTesting',
)
