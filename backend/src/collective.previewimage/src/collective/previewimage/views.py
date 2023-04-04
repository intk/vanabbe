# get a preview image
from plone import api
from plone.namedfile.scaling import ImageScaling


class FallbackImageScale(ImageScaling):
    fieldname = "preview_image"

    def __init__(self, context, request):
        # identifies the proper @@images view for the content item used as fallback

        # import pdb
        #
        # pdb.set_trace()
        obj = None
        for child in context.contentValues():
            if getattr(child, "image", None):  # TODO: handle permissions
                obj = child
                self.fieldname = "image"
            if getattr(child, "preview_image", None):  # TODO: handle permissions
                obj = child

        if obj is None:
            try:
                site = api.portal.get()
                obj = site.restrictedTraverse("fallback-preview-image")
                self.fieldname = "image"
            except Exception:
                print("You should create /fallback-preview-image")

        # obj = obj.__of__(context)
        print("Using", obj)
        self.context = obj or context
        self.request = request
        ImageScaling.__init__(self, self.context, self.request)

    def scale(
        self,
        fieldname=None,
        scale=None,
        height=None,
        width=None,
        direction="thumbnail",
        pre=False,
        include_srcset=None,
        **parameters
    ):
        if self.fieldname:
            print("Using fallback fieldname", self.fieldname)
            return super(FallbackImageScale, self).scale(
                fieldname=self.fieldname,
                scale=scale,
                height=height,
                width=width,
                direction=direction,
                pre=pre,
                include_srcset=include_srcset,
                **parameters
            )

        return super(FallbackImageScale, self).scale(
            fieldname=fieldname,
            scale=scale,
            height=height,
            width=width,
            direction=direction,
            pre=pre,
            include_srcset=include_srcset,
            **parameters
        )
