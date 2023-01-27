"""Init and utils."""
from zope.i18nmessageid import MessageFactory

import logging


_ = MessageFactory("intk_vanabbe")

logger = logging.getLogger("intk_vanabbe")

# side-effect imports

from .content.artwork import IArtwork
from .content.publication import IPublication
