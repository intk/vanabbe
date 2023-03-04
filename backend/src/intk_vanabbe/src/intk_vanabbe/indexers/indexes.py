from intk_vanabbe.content.exhibition import IExhibition
from intk_vanabbe.content.publication import IPublication
from plone.indexer.decorator import indexer


@indexer(IPublication)
def publication_image_indexer(obj):
    return "fallback_image"  # handled by PreviewImage in frontend

    # enable if we want always a fallback image
    # if obj.contentIds():
    #     return "fallback_image"  # handled by PreviewImage in frontend


@indexer(IExhibition)
def exhibition_image_indexer(obj):
    return "fallback_image"  # handled by PreviewImage in frontend


@indexer(IExhibition)
def exhibition_description(obj):
    return obj.eventDescription


@indexer(IPublication)
def author_name(obj):
    return obj.bookauthorName
