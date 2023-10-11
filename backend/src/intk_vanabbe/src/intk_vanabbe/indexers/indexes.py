from intk_vanabbe.content.artwork import get_decades

from intk_vanabbe.content.artwork import IArtwork
from intk_vanabbe.content.exhibition import IExhibition
from intk_vanabbe.content.publication import get_publication_decades
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


@indexer(IPublication)
def publication_type(obj):
    binding = getattr(obj, 'bookBinding', None)
    if not binding:
        return None
    return [binding.split(';', 1)[0].strip()]


@indexer(IPublication)
def publication_decades(obj):
    return get_publication_decades(obj)


@indexer(IArtwork)
def artwork_decades(obj):
    return get_decades(obj)

@indexer(IArtwork)
def artwork_classification(obj):
    classification = getattr(obj, "objectClassification", "")
    if classification:
        sep = ";" if ";" in classification else ","
        return [s.strip() for s in classification.split(sep)]


@indexer(IArtwork)
def artwork_classification_en(obj):
    if obj.language != "en":
        return

    classification = getattr(obj, "objectClassification", "")
    if classification:
        return [s.strip() for s in classification.split(",")]


@indexer(IArtwork)
def artwork_classification_nl(obj):
    if obj.language != "nl":
        return
    classification = getattr(obj, "objectClassification", "")
    if classification:
        return [s.strip() for s in classification.split(",")]


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
