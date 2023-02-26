from plone.restapi.behaviors import IBlocks
from zope.component import adapter  # , subscribers
from zope.publisher.interfaces.browser import IBrowserRequest

import urllib


# from plone.app.linkintegrity.interfaces import IRetriever
# from plone.app.linkintegrity.retriever import DXGeneral
# from zope.globalrequest import getRequest
# from zope.interface import implementer
# from plone.restapi.deserializer.blocks import iterate_children


def fix(url):
    if "http" in url and "new.vanabbe" in url:
        return urllib.parse.urlparse(url).path
    else:
        return url


@adapter(IBlocks, IBrowserRequest)
class ActionLinksTransformers(object):
    order = 100
    block_type = "actionLinks"

    def __init__(self, context, request):
        self.context = context
        self.request = request

    def __call__(self, value):
        actions = value.get("actions", None)
        if actions:
            for action in actions:
                if action.get("href", None):
                    action["href"] = fix(action["href"])
                if action.get("linkHref"):
                    for link in action["linkHref"]:
                        link["@id"] = fix(link["@id"])

        return value
