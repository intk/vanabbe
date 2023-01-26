from Products.Five.browser import BrowserView


class GoPDB(BrowserView):
    def __call__(self):
        ctx = self.context
        import pdb; pdb.set_trace()
