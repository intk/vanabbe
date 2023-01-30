from plone.api.content import find
from plone.restapi.interfaces import IExpandableElement
from plone.restapi.interfaces import ISerializeToJsonSummary
from plone.restapi.services import Service
from random import choice
from zope.component import adapter
from zope.component import getMultiAdapter
from zope.interface import implementer
from zope.interface import Interface


def tojson(brain, request):
    serializer = getMultiAdapter((brain, request), ISerializeToJsonSummary)
    return serializer()


class AuthorContextLinks(object):
    def __init__(self, context, request):
        self.context = context
        self.request = request

    def get_publications(self):
        # ctx = self.context
        authorSortName = self.context.authorSortName

        # TODO: needs KeywordIndex for "bookArtist" field
        brains = find(
            portal_type="publication",
            Language=self.context.language,
            bookArtist=[authorSortName],
        )
        arts = [b for b in brains if b.id != self.context.id]

        return arts and choice(arts) or None

    def get_artworks(self):
        brains = find(
            portal_type="artwork",
            authorID=self.context.authorID,
            Language=self.context.language,
        )
        return brains

    def get_exhibition_art(self):
        authorSortName = self.context.authorSortName
        exhibitions = find(
            portal_type="exhibition",
            Language=self.context.language,
            eventArtist=[
                authorSortName
            ],  # TODO: here we may want to use eventArtist field
        )
        if exhibitions:
            return choice(exhibitions)
        return None

    def __call__(self, result):
        req = self.request
        items = []

        artworks = self.get_artworks()
        if artworks:
            items.append(
                {"id": "artworks", "items": [tojson(b, req) for b in artworks]}
            )

        # TODO: this makes no sense for authors
        # period_art = self.get_period_art()
        # if period_art:
        #     items.append({"id": "period", "url": period_art.getURL()})

        publication_art = self.get_publications()
        if publication_art:
            items.append({"id": "publication", "url": publication_art.getURL()})

        exhibition_art = self.get_exhibition_art()
        if exhibition_art:
            items.append({"id": "exhibition", "url": exhibition_art.getURL()})

        result["contextLinks"]["items"] = items
        return result


class ArtworkContextLinks(object):
    def __init__(self, context, request):
        self.context = context
        self.request = request

    def get_other_art(self):

        result = []
        for rel in self.context.authors:
            author = rel.to_object

            brains = find(
                portal_type="artwork",
                authorID=author.authorID,
                Language=self.context.language,
            )
            arts = [b for b in brains if b.id != self.context.id]
            if arts:
                result.append(
                    {"authorName": author.authorName, "url": choice(arts).getURL()}
                )

        return result

    def get_period_art(self):
        ctx = self.context

        minmax = []
        brains = []

        if ctx.objectCreationDateFrom and ctx.objectCreationDateTo:
            try:
                start = int(ctx.objectCreationDateFrom)
                end = int(ctx.objectCreationDateTo)
                minmax = [start, end]
            except Exception:
                pass

        if not minmax:
            try:
                year = int(ctx.objectCreationDate)
                minmax = [year, year + 1]
            except Exception:
                pass

        # TODO: convert years to DateTime
        if minmax:
            brains = find(
                portal_type="artwork",
                Language=self.context.language,
                objectCreationDateRange={"query": minmax, "range": "min:max"},
            )

        arts = [b for b in brains if b.id != self.context.id]
        return arts and choice(arts) or None

    def get_publications(self):
        result = []
        for rel in self.context.authors:
            author = rel.to_object
            authorSortName = author.authorSortName
            publications = find(
                portal_type="publication",
                Language=self.context.language,
                bookArtist=[authorSortName],
            )
            if publications:
                result.append(
                    {
                        "authorName": author.authorName,
                        "url": choice(publications).getURL(),
                    }
                )

        return result

    def get_exhibition_art(self):
        result = []
        for rel in self.context.authors:
            author = rel.to_object
            authorSortName = author.authorSortName
            exhibitions = find(
                portal_type="exhibition",
                Language=self.context.language,
                eventArtist=[authorSortName],
            )
            if exhibitions:
                result.append(
                    {
                        "authorName": author.authorName,
                        "url": choice(exhibitions).getURL(),
                    }
                )
        return result

    def __call__(self, result):

        items = []
        result["contextLinks"]["items"] = items

        period_art = self.get_period_art()
        if period_art:
            items.append({"id": "period", "url": period_art.getURL()})

        other_art = self.get_other_art()
        if other_art:
            items.append({"id": "artwork", "items": other_art})

        pub_art = self.get_publications()
        if pub_art:
            items.append({"id": "publication", "url": pub_art.getURL()})

        exhibition_art = self.get_exhibition_art()
        if exhibition_art:
            items.append({"id": "exhibition", "items": exhibition_art})

        return result


@implementer(IExpandableElement)
@adapter(Interface, Interface)
class ContextLinks:
    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __call__(self, expand=False):
        result = {
            "contextLinks": {"@id": f"{self.context.absolute_url()}/@contextLinks"}
        }

        factories = {"artwork": ArtworkContextLinks, "author": AuthorContextLinks}

        ptype = self.context.portal_type
        if ptype not in factories:  # autoexpand
            return result

        factory = factories[ptype]
        result = factory(self.context, self.request)(result)

        return result


class ContextLinksGet(Service):
    def reply(self):
        links = ContextLinks(self.context, self.request)
        return links(expand=True)["contextLinks"]
