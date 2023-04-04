from plone.app.dexterity.textindexer.directives import searchable
from plone.app.multilingual.dx import directives
from plone.supermodel import model
from zope import schema


# fields extracted from archive dump

# ccIdentifier
# ccIndexName
# ccObjectID
# eventArtist
# eventCoorporation
# eventDescription
# eventImages
# eventMedia
# eventSub
# eventTimeFrom
# eventTitle
# eventTitle_EN
# recordnumber

# TODO: add this field: eventSub

class IExhibition(model.Schema):
    """Schema for 'exhibition' content type."""

    ccObjectID = schema.TextLine(title="ccObjectID", required=False)
    ccIdentifier = schema.TextLine(title="ccIdentifier", required=False)
    ccIndexName = schema.TextLine(title="ccIndexName", required=False)

    # can be a list
    eventArtist = schema.List(
        title="eventArtist", required=False,
        value_type=schema.TextLine(title="Artist")
    )

    eventCoorporation = schema.TextLine(
        title="eventCoorporation", required=False)
    eventDescription = schema.Text(title="eventDescription", required=False)

    # should import as children
    eventImages = schema.Text(title="eventImages", required=False)

    # link directly to mediabank
    eventMedia = schema.Text(title="eventMedia", required=False)

    eventTimeFrom = schema.TextLine(title="TimeFrom", required=False)

    # this field is translatable
    eventTitle = schema.TextLine(title="eventTitle", required=False)

    recordnumber = schema.TextLine(title="recordnumber", required=False)

    directives.languageindependent(
        "ccObjectID",
        "ccIdentifier",
        "ccIndexName",
        "eventArtist",
        "eventCoorporation",
        "eventDescription",
        "eventImages",
        "eventMedia",
        "eventTimeFrom",
        "recordnumber",
    )

    searchable("ccObjectID")
    searchable("ccIdentifier")
    searchable("eventArtist")
    searchable("eventCoorporation")
    searchable("eventDescription")
    searchable("eventMedia")
    searchable("eventTimeFrom")
    searchable("recordnumber")
    searchable("eventTitle")
