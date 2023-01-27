from plone.api.content import find
from plone.restapi.interfaces import IExpandableElement
from plone.restapi.services import Service
from zope.component import adapter
from zope.component import getMultiAdapter
from zope.interface import implementer
from zope.interface import Interface


@implementer(IExpandableElement)
@adapter(Interface, Interface)
class ContextLinks:
    def __init__(self, context, request):
        self.context = context
        self.request = request

    def get_other_art(self):
        brains = find(portal_type='artwork', authorID=self.context.authorID,
                Language=self.context.language)
        arts = [b for b in brains if b.id != self.context.id]
        return arts and arts[0] or None

    def __call__(self, expand=False):
        result = {"contextLinks": {"@id": f"{self.context.absolute_url()}/@contextLinks"}}

        if self.context.portal_type != 'artwork':       # autoexpand
            return result

        portal_state = getMultiAdapter(
            (self.context, self.request), name="plone_portal_state"
        )
        items = []

        other_art = self.get_other_art()
        if other_art:
            items.append({"id": "artwork", "url": other_art.getURL()})

        # for crumb in breadcrumbs_view.breadcrumbs():
        #     item = {
        #         "title": crumb["Title"],
        #         "@id": crumb["absolute_url"],
        #     }
        #     if crumb.get("nav_title", False):
        #         item.update({"title": crumb["nav_title"]})
        #
        #     items.append(item)

        result["contextLinks"]['items'] = items
        return result


class ContextLinksGet(Service):
    def reply(self):
        links = ContextLinks(self.context, self.request)
        return links(expand=True)["contextLinks"]
