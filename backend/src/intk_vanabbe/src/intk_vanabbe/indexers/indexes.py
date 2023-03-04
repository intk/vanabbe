from intk_vanabbe.content.publication import IPublication
from plone.indexer.decorator import indexer


@indexer(IPublication)
def fallback_image_indexer(obj):
    """Indexer for knowing in a catalog search if a content has any image."""

    return "fallback_image"  # handled by PreviewImage in frontend

    # enable if we want always a fallback image
    # if obj.contentIds():
    #     return "fallback_image"  # handled by PreviewImage in frontend


@indexer(IPublication)
def author_name(obj):
    return obj.bookauthorName
