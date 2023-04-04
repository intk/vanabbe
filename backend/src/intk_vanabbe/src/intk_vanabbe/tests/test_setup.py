"""Setup tests for this package."""
from intk_vanabbe.testing import INTK_VANABBE_INTEGRATION_TESTING  # noqa: E501
from plone import api
from plone.app.testing import setRoles
from plone.app.testing import TEST_USER_ID
from Products.CMFPlone.utils import get_installer

import unittest


class TestSetup(unittest.TestCase):
    """Test that intk_vanabbe is properly installed."""

    layer = INTK_VANABBE_INTEGRATION_TESTING

    def setUp(self):
        """Custom shared utility setup for tests."""
        self.portal = self.layer["portal"]
        self.setup = self.portal.portal_setup
        self.installer = get_installer(self.portal, self.layer["request"])

    def test_product_installed(self):
        """Test if intk_vanabbe is installed."""
        self.assertTrue(self.installer.is_product_installed("intk_vanabbe"))

    def test_browserlayer(self):
        """Test that IINTK_VANABBELayer is registered."""
        from intk_vanabbe.interfaces import IINTK_VANABBELayer
        from plone.browserlayer import utils

        self.assertIn(IINTK_VANABBELayer, utils.registered_layers())

    def test_latest_version(self):
        """Test latest version of default profile."""
        self.assertEqual(
            self.setup.getLastVersionForProfile("intk_vanabbe:default")[0],
            "20221120001",
        )


class TestUninstall(unittest.TestCase):

    layer = INTK_VANABBE_INTEGRATION_TESTING

    def setUp(self):
        self.portal = self.layer["portal"]
        self.installer = get_installer(self.portal, self.layer["request"])
        roles_before = api.user.get_roles(TEST_USER_ID)
        setRoles(self.portal, TEST_USER_ID, ["Manager"])
        self.installer.uninstall_product("intk_vanabbe")
        setRoles(self.portal, TEST_USER_ID, roles_before)

    def test_product_uninstalled(self):
        """Test if intk_vanabbe is cleanly uninstalled."""
        self.assertFalse(self.installer.is_product_installed("intk_vanabbe"))

    def test_browserlayer_removed(self):
        """Test that IINTK_VANABBELayer is removed."""
        from intk_vanabbe.interfaces import IINTK_VANABBELayer
        from plone.browserlayer import utils

        self.assertNotIn(IINTK_VANABBELayer, utils.registered_layers())
