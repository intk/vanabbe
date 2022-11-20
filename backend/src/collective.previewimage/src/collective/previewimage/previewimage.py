# get a preview image
from Products.Five import BrowserView


class FallbackPreviewImage(BrowserView):
    def __call__(self):
        # identifies the proper @@images view for the content item used as fallback
        pass
