from plone.app.dexterity.textindexer.directives import searchable
from plone.app.multilingual.dx import directives as lang_directives
from plone.app.z3cform.widget import RelatedItemsFieldWidget
from plone.autoform import directives as form_directives
from plone.supermodel import model
from z3c.relationfield.schema import RelationChoice
from z3c.relationfield.schema import RelationList
from zope import schema

import math


# 3013.xml
# https://vanabbemuseum.nl/details/collectie/index.html@lookup[41][filter][0]=id%253AC12624.html

# fields extracted from the archive dump:

# {'authorDeathDate', 'subjectandkeywords', 'objectCreationDateTo', 'authorName',
# 'objectCreationDate', 'trefwoord', 'authorURL', 'objectPosition', 'ccObjectID',
# 'objectMedium', 'objectTitle', 'objectFormatWidth', 'objectKeys', 'authorBirthDate',
# 'objectCreationDateFrom', 'ObjectAudio', 'objectIsVisible', 'objectImage',
# 'objectFormatDepth', 'objectID', 'ccIndexName', 'objectFormatLength', 'Dimensions',
# 'objectCredit', 'recordnumber', 'authorID', 'ccIdentifier', 'AuthorBio',
# 'objectYearPurchase', 'objectDescription', 'ObjectVideo'}


class IArtwork(model.Schema):
    """Schema for Artwork content type."""

    # TODO: use relatedItems to link to the authors
    ccObjectID = schema.TextLine(title="ccObjectID", required=False)
    ccIdentifier = schema.TextLine(title="ccIdentifier", required=False)
    ccIndexName = schema.TextLine(title="ccIndexName", required=False)
    dimensions = schema.TextLine(title="dimensions", required=False)
    objectCreationDate = schema.TextLine(title="objectCreationDate", required=False)
    objectCreationDateFrom = schema.TextLine(
        title="objectCreationDateFrom", required=False
    )
    objectCreationDateTo = schema.TextLine(title="objectCreationDateTo", required=False)
    objectDescription = schema.TextLine(title="objectDescription", required=False)
    objectID = schema.TextLine(title="objectID", required=False)
    objectMedium = schema.TextLine(title="objectMedium", required=False)
    objectCredit = schema.TextLine(title="objectCredit", required=False)
    objectTitle = schema.TextLine(title="objectTitle", required=False)
    objectYearPurchase = schema.TextLine(title="objectYearPurchase", required=False)
    recordnumber = schema.TextLine(title="recordnumber", required=False)

    # to migrate: trefwoord (subject)
    # objectPosition, objectFormatWidth, objectKeys, ObjectAudio, objectIsVisible,
    # objectImage, objectFormatDepth, objectFormatLength, Dimmensions, ObjectVideo

    authors = RelationList(
        title="Authors",
        default=[],
        value_type=RelationChoice(
            title="Author", vocabulary="plone.app.vocabularies.Catalog"
        ),
        required=False,
    )
    form_directives.widget(
        "authors",
        RelatedItemsFieldWidget,
        pattern_options={
            "selectableTypes": [
                "author",
            ],
        },
    )

    lang_directives.languageindependent(
        "ccObjectID",
        "ccIdentifier",
        "ccIndexName",
        "dimensions",
        "objectCreationDate",
        "objectCreationDateFrom",
        "objectCreationDateTo",
        # "objectDescription",
        "objectID",
        # "objectMedium",
        "objectCredit",
        "objectTitle",
        "objectYearPurchase",
        "recordnumber",
    )

    searchable("objectTitle", "objectDescription", "objectCredit")


def decade(year):
    if not isinstance(year, int):
        try:
            year = int(year)
        except Exception:
            return

    start = math.floor(year / 10) * 10
    end = start + 10

    return f"{start}-{end}"


def get_decades(obj):
    created = getattr(obj, "objectCreationDate", None)
    from_ = getattr(obj, "objectCreationDateFrom", None)
    to_ = getattr(obj, "objectCreationDateTo", None)

    return [d for d in set([decade(created), decade(from_), decade(to_)]) if d]


# ccObjectID
# ccIdentifier
# ccIndexName
# dimensions
# objectCreationDate
# objectCreationDateFrom
# objectCreationDateTo
# objectDescription
# objectID
# objectMedium
# objectCredit
# objectTitle
# objectYearPurchase
# recordnumber
