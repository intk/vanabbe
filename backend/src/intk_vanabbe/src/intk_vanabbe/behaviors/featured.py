from plone.autoform.interfaces import IFormFieldProvider
from plone.supermodel import model
from zope.interface import provider
from zope.schema import Bool


@provider(IFormFieldProvider)
class IFeatured(model.Schema):

    is_featured = Bool(
        title="Is featured?",
        description="This document should be presented as a featured item",  # noqa
        default=False,
        required=False,
    )
