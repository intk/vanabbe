from intk_vanabbe.content.artwork import get_decades
from intk_vanabbe.content.artwork import IArtwork
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


@indexer(IArtwork)
def artwork_decades(obj):
    return get_decades(obj)


@indexer(IArtwork)
def artwork_technique(obj):
    medium = getattr(obj, "objectMedium", "")
    if medium:
        sep = ";" if ";" in medium else ","
        return [s.strip() for s in medium.split(sep)]


@indexer(IArtwork)
def artwork_technique_en(obj):
    if obj.language != "en":
        return

    medium = getattr(obj, "objectMedium", "")
    if medium:
        return [s.strip() for s in medium.split(",")]


@indexer(IArtwork)
def artwork_technique_nl(obj):
    if obj.language != "nl":
        return
    medium = getattr(obj, "objectMedium", "")
    if medium:
        return [s.strip() for s in medium.split(",")]
