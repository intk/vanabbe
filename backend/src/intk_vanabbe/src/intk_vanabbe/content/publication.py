from plone.supermodel import model
from zope import schema


class IPublication(model.Schema):
    """Schema for Artwork content type."""

    model.load('schema/publication.xml')
