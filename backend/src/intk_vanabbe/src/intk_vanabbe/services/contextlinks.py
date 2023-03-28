from intk_vanabbe.config import IMPORT_LOCATIONS
from intk_vanabbe.content.artwork import get_decades
from plone.api import portal
from plone.api.content import find
from plone.app.multilingual.api import get_translation_manager
from plone.memoize import instance
from plone.restapi.interfaces import IExpandableElement
from plone.restapi.interfaces import ISerializeToJsonSummary  # Summary
from plone.restapi.services import Service
from random import choice
from urllib.parse import quote
from zope.component import adapter
from zope.component import getMultiAdapter
from zope.interface import implementer
from zope.interface import Interface

import json
import logging


logger = logging.getLogger('vubis')


QUOTE_SAFE = "!~*'()\""


class FakeRequest:
    def __init__(self, form):
        self.form = form

    def set(self, k, value):
        self.form[k] = value

    def get(self, k, default=None):
        return self.form.get(k, default)


def tojson(brain):
    form = {"metadata_fields": "_all"}
    request = FakeRequest(form)
    serializer = getMultiAdapter((brain, request), ISerializeToJsonSummary)
    return serializer()


class AuthorContextLinks(object):
    def __init__(self, context, request):
        self.context = context
        self.request = request

    @instance.memoize
    def repo_url(self, type_):
        site = portal.get()
        try:
            repo = site.restrictedTraverse(IMPORT_LOCATIONS[type_])
        except Exception:
            logger.error("Could not find %s", IMPORT_LOCATIONS[type_])
            return "/"
        if self.context.language == "en":
            intl_mgr = get_translation_manager(repo)
            repo = intl_mgr.get_translation("en")
        repo_url = repo.absolute_url()
        return repo_url

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
            items.append({"id": "artworks", "items": [
                         tojson(b) for b in artworks]})

        # TODO: this makes no sense for authors
        # period_art = self.get_period_art()
        # if period_art:
        #     items.append({"id": "period", "url": period_art.getURL()})

        publication_art = self.get_publications()
        if publication_art:

            query = [
                {
                    "i": "SearchableText",
                    "o": "plone.app.querystring.operation.string.contains",
                    "v": self.context.authorSortName,
                }
            ]  # extra
            encoded = quote(json.dumps(query), safe=QUOTE_SAFE)
            items.append(
                {
                    "id": "publication",
                    "preview": publication_art.getURL(),
                    "href": f"{self.repo_url('publication')}#query={encoded}",
                }
            )  # noqa

        exhibition_art = self.get_exhibition_art()
        if exhibition_art:
            query = [
                {
                    "i": "SearchableText",
                    "o": "plone.app.querystring.operation.string.contains",
                    "v": self.context.authorSortName,
                }
            ]  # extra
            encoded = quote(json.dumps(query), safe=QUOTE_SAFE)
            items.append(
                {
                    "id": "exhibition",
                    "preview": exhibition_art.getURL(),
                    "href": f"{self.repo_url('exhibition')}#query={encoded}",
                }
            )

        result["contextLinks"]["items"] = items
        return result


class ArtworkContextLinks(object):
    def __init__(self, context, request):
        self.context = context
        self.request = request

    @instance.memoize
    def repo_url(self, type_):
        site = portal.get()
        try:
            repo = site.restrictedTraverse(IMPORT_LOCATIONS[type_])
        except Exception:
            logger.error("Could not find %s", IMPORT_LOCATIONS[type_])
            return "/"
        if self.context.language == "en":
            intl_mgr = get_translation_manager(repo)
            repo = intl_mgr.get_translation("en")
        repo_url = repo.absolute_url()
        return repo_url

    def get_period_art(self, result):
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
        if arts:
            decades = get_decades(self.context)
            query = [
                {
                    "i": "decades",
                    "v": decades,
                    "o": "paqo.operation.list.contains",
                }
            ]  # extra
            encoded = quote(json.dumps(query), safe=QUOTE_SAFE)
            result["contextLinks"]["items"].append(
                {
                    "type": "period",
                    "preview": choice(arts).getURL(),
                    "href": f"{self.repo_url('artwork')}#query={encoded}",
                }
            )

        return result

    def get_other_art(self, result):
        other_arts = []

        for rel in self.context.authors:
            author = rel.to_object
            query = [
                {
                    "i": "authorID",
                    "v": author.authorID,
                    "o": "paqo.selection.is",
                }
            ]  # extra
            encoded = quote(json.dumps(query), safe=QUOTE_SAFE)

            brains = find(
                portal_type="artwork",
                authorID=author.authorID,
                Language=self.context.language,
            )
            arts = [b for b in brains if b.id != self.context.id]
            if arts:
                other_arts.append(
                    {
                        "authorName": author.authorName,
                        "preview": choice(arts).getURL(),
                        "type": "other_artworks",
                        "href": f"{self.repo_url('artwork')}#query={encoded}",
                    }
                )

        if other_arts:
            result["contextLinks"]["items"].append(
                {"id": "other_artworks", "items": other_arts}
            )

        return result

    def get_publications(self, result):

        # result = []
        pubs = []
        for rel in self.context.authors:
            author = rel.to_object
            authorSortName = author.authorSortName
            publications = find(
                portal_type="publication",
                Language=self.context.language,
                bookArtist=[authorSortName],
            )
            if publications:
                query = [
                    {
                        "i": "SearchableText",
                        "o": "plone.app.querystring.operation.string.contains",
                        "v": author.authorName,
                    }
                ]  # extra
                encoded = quote(json.dumps(query), safe=QUOTE_SAFE)

                pubs.append(
                    {
                        "type": "publications",
                        "authorName": author.authorName,
                        "preview": choice(publications).getURL(),
                        "href": f"{self.repo_url('publication')}#query={encoded}",
                    }
                )
        if pubs:
            result["contextLinks"]["items"].append(
                {"id": "publications", "items": pubs}
            )

        return result

    def get_exhibition_art(self, result):

        arts = []
        for rel in self.context.authors:
            author = rel.to_object
            authorSortName = author.authorSortName
            exhibitions = find(
                portal_type="exhibition",
                Language=self.context.language,
                eventArtist=[authorSortName],
            )
            if exhibitions:
                query = [
                    {
                        "i": "SearchableText",
                        "o": "plone.app.querystring.operation.string.contains",
                        "v": author.authorName,
                    }
                ]  # extra
                encoded = quote(json.dumps(query), safe=QUOTE_SAFE)
                arts.append(
                    {
                        "type": "exhibitions",
                        "authorName": author.authorName,
                        "preview": choice(exhibitions).getURL(),
                        "href": f"{self.repo_url('exhibition')}#query={encoded}",
                    }
                )

        if arts:
            result["contextLinks"]["items"].append(
                {"id": "exhibitions", "items": arts}
            )  # extra

        return result

    def __call__(self, result):

        items = []
        result["contextLinks"]["items"] = items

        result = self.get_other_art(result)
        result = self.get_period_art(result)
        result = self.get_publications(result)
        result = self.get_exhibition_art(result)

        return result


@implementer(IExpandableElement)
@adapter(Interface, Interface)
class ContextLinks:
    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __call__(self, expand=False):
        result = {
            "contextLinks": {
                "@id": f"{self.context.absolute_url()}/@contextLinks"
            }  # extra
        }

        factories = {
            "artwork": ArtworkContextLinks,
            "author": AuthorContextLinks,
        }  # extra

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
