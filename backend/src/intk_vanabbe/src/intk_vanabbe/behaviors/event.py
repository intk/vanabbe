from plone.autoform.interfaces import IFormFieldProvider
from plone.supermodel import model
from zope.interface import provider
from zope.schema import TextLine


@provider(IFormFieldProvider)
class IRecurenceDescription(model.Schema):

    recurence_description = TextLine(
        title="Recurence description",
        description="Optional, describe the recurence rules to the visitors",  # noqa
        required=False,
    )
