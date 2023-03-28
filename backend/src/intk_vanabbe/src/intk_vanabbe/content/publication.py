from intk_vanabbe.utils import decade
from plone.app.dexterity.textindexer.directives import searchable
from plone.app.multilingual.dx import directives
from plone.supermodel import model
from zope import schema


# fields extracted from archive dump

# {'eventTitle', 'bookLanguage', 'bookBBCode', 'bookCity', 'objectCreationDateTo',
# 'authorName', 'objectCreationDate', 'eventArtist', 'bookDatePublished', 'authorURL',
# 'ccObjectID', 'bookMedia', 'objectMedium', 'objectTitle', 'bookISBN',
# 'bookIllustrations', 'BookTitle_ALT', 'bookDescription', 'BookSubTitle',
# 'authorBirthDate', 'objectCreationDateFrom', 'bookauthorName', 'VubisID',
# 'objectIsVisible', 'objectImage', 'bookVubisid', 'objectID', 'eventTimeFrom',
# 'bookPublisher', 'ccIndexName', 'eventMedia', 'bookArtist', 'bookBbnummer',
# 'Dimensions', 'recordnumber', 'objectCredit', 'bookCountry', 'BookTitle', 'authorID',
# 'eventDescription', 'ccIdentifier', 'bookStream', 'bookBinding', 'bookShelfmark',
# 'objectYearPurchase', 'bookAnnotation', 'bookBarcode', 'eventImages', 'eventSub',
# 'objectDescription', 'ObjectVideo'}


class IPublication(model.Schema):
    """Schema for 'publication' content type."""

    # model.load('schema/publication.xml')

    ccObjectID = schema.TextLine(title="ccObjectID", required=False)
    bookAnnotation = schema.TextLine(title="bookAnnotation", required=False)

    # TODO: is this a line or text?
    bookauthorName = schema.TextLine(title="bookauthorName", required=False)

    # TODO: is this a line or text?
    bookBarcode = schema.TextLine(title="bookBarcode", required=False)

    bookBBCode = schema.TextLine(title="bookBBCode", required=False)
    bookBbnummer = schema.TextLine(title="bookBbnummer", required=False)
    bookBinding = schema.TextLine(title="bookBinding", required=False)
    bookCity = schema.TextLine(title="bookCity", required=False)
    bookCountry = schema.TextLine(title="bookCountry", required=False)
    bookDatePublished = schema.Int(title="bookDatePublished", required=False)
    bookDescription = schema.Text(title="bookDescription", required=False)
    bookIllustrations = schema.Text(title="bookIllustrations", required=False)
    bookPublisher = schema.TextLine(title="bookPublisher", required=False)
    bookShelfmark = schema.TextLine(title="bookShelfmark", required=False)
    bookSubTitle = schema.TextLine(title="bookSubTitle", required=False)
    BookTitle = schema.TextLine(title="BookTitle", required=False)
    bookVubisid = schema.TextLine(title="bookVubisid", required=False)
    ccIdentifier = schema.TextLine(title="ccIdentifier", required=False)
    ccindexnameccIndexName = schema.TextLine(
        title="ccindexnameccIndexName", required=False
    )
    recordnumber = schema.Int(title="recordnumber", required=False)
    vubisID = schema.TextLine(title="vubisID", required=False)

    # TODO: is this a line or text?
    bookLanguage = schema.TextLine(title="bookLanguage", required=False)

    bookStream = schema.TextLine(title="bookStream", required=False)

    # fields that need to be re-imported
    bookMedia = schema.Text(title="bookMedia", required=False)

    # TODO: is this a line or text?
    bookArtist = schema.List(
        title="bookArtist", required=False, value_type=schema.TextLine(title="Artist")
    )

    bookTitle_ALT = schema.TextLine(title="bookTitle_ALT", required=False)

    directives.languageindependent(
        "ccObjectID",
        "bookAnnotation",
        "bookauthorName",
        "bookBarcode",
        "bookBBCode",
        "bookBbnummer",
        "bookBinding",
        "bookCity",
        "bookCountry",
        "bookDatePublished",
        "bookDescription",
        "bookIllustrations",
        "bookPublisher",
        "bookShelfmark",
        "bookSubTitle",
        "bookMedia",
        "BookTitle",
        "bookVubisid",
        "ccIdentifier",
        "ccindexnameccIndexName",
        "recordnumber",
        "vubisID",
        "bookLanguage",
        "bookStream",
        "bookArtist",  # TODO: confirm this
        "bookTitle_ALT",
    )

    searchable("ccObjectID")
    searchable("bookAnnotation")
    searchable("bookauthorName")
    searchable("bookBarcode")
    searchable("bookBBCode")
    searchable("bookBbnummer")
    searchable("bookBinding")
    searchable("bookCity")
    searchable("bookCountry")
    searchable("bookDescription")
    searchable("bookIllustrations")
    searchable("bookPublisher")
    searchable("bookSubTitle")
    searchable("BookTitle")
    searchable("bookVubisid")
    searchable("ccIdentifier")
    searchable("vubisID")
    searchable("bookArtist")
    searchable("bookTitle_ALT")


def get_publication_decades(obj):
    published = getattr(obj, 'bookDatePublished', None)
    if not published:
        return None
    try:
        published = int(published)
    except Exception:
        return None

    return [decade(published)]
