from plone.autoform.interfaces import IFormFieldProvider
from plone.supermodel import model
from zope.interface import provider
from zope.schema import Bool


@provider(IFormFieldProvider)
class IHeaderImage(model.Schema):

    hide_header_image = Bool(
        title="Hide header image?",
        description="If set, the header image will be used only as a thumbnail in listings ",  # noqa
        default=False,
        required=False,
    )
