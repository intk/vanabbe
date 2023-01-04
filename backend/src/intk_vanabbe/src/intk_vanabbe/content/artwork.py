from plone.supermodel import model
from zope import schema


class IArtwork(model.Schema):
    """Schema for Artwork content type."""

    model.load('schema/artwork.xml')
