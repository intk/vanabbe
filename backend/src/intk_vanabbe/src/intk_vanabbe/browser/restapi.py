from plone.api.content import find
from plone.restapi.interfaces import IExpandableElement
from plone.restapi.services import Service
from random import choice
from zope.component import adapter
from zope.interface import implementer
from zope.interface import Interface


class AuthorContextLinks(object):
    def __init__(self, context, request):
        self.context = context
        self.request = request

    def get_publications(self):
        # ctx = self.context
        authorName = self.context.authorName

        # TODO: needs TextIndex "bookArtists"
        brains = find(
            portal_type="publication",
            Language=self.context.language,
            SearchableText=authorName,
        )
        arts = [b for b in brains if b.id != self.context.id]

        return arts and choice(arts) or None

    def get_exhibition_art(self):
        return None

    def __call__(self, result):
        items = []
        #
        # other_art = self.get_other_art()
        # if other_art:
        #     items.append({"id": "artwork", "url": other_art.getURL()})
        #
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
        brains = find(
            portal_type="artwork",
            authorID=self.context.authorID,
            Language=self.context.language,
        )
        arts = [b for b in brains if b.id != self.context.id]
        return arts and choice(arts) or None

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
        # ctx = self.context
        authorName = self.context.authorName

        # TODO: needs TextIndex "bookArtists"
        brains = find(
            portal_type="publication",
            Language=self.context.language,
            SearchableText=authorName,
        )
        arts = [b for b in brains if b.id != self.context.id]

        return arts and choice(arts) or None

    def get_exhibition_art(self):
        return None

    def __call__(self, result):
        items = []

        other_art = self.get_other_art()
        if other_art:
            items.append({"id": "artwork", "url": other_art.getURL()})

        period_art = self.get_period_art()
        if period_art:
            items.append({"id": "period", "url": period_art.getURL()})

        publication_art = self.get_publications()
        if publication_art:
            items.append({"id": "publication", "url": publication_art.getURL()})

        exhibition_art = self.get_exhibition_art()
        if exhibition_art:
            items.append({"id": "exhibition", "url": exhibition_art.getURL()})

        result["contextLinks"]["items"] = items
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
