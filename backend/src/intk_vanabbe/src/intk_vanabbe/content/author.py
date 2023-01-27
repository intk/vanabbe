from plone.app.dexterity.textindexer.directives import searchable
from plone.app.multilingual.dx import directives
from plone.supermodel import model
from zope import schema


class IAuthor(model.Schema):
    """Schema for Author content type."""

    authorID= schema.TextLine(title="authorID", required=False)
    AuthorBio = schema.TextLine(title="AuthorBio", required=False)

    # TODO: make it a
    authorBirthDate = schema.TextLine(title="authorBirthDate", required=False)
    authorDeathDate = schema.TextLine(title="DeathDate", required=False)

    # this is also title
    authorName = schema.TextLine(title="authorName", required=False)

    # this is i18n field
    authorURL = schema.TextLine(title="authorURL", required=False)

    directives.languageindependent(
            "authorID", "AuthorBio", "authorBirthDate", "authorDeathDate", "authorName"
    )

    searchable('AuthorBio', 'authorName')
