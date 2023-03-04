from plone.api import portal
from plone.app.vocabularies.catalog import KeywordsVocabulary as BKV
from zope.interface import implementer
from zope.schema.interfaces import IVocabularyFactory


@implementer(IVocabularyFactory)
class KeywordsVocabulary(BKV):
    """KeywordsVocabulary"""

    def __init__(self, index):
        self.keyword_index = index


@implementer(IVocabularyFactory)
class MultilingualKeywordsVocabulary(BKV):
    """KeywordsVocabulary"""

    _base = None

    def __init__(self, index):
        self._base = index

    def __call__(self, registry):
        language = portal.get_current_language()
        self.keyword_index = f"{self._base}_{language}"

        return super(MultilingualKeywordsVocabulary, self).__call__(registry)


DecadesVocabularyFactory = KeywordsVocabulary("decades")
TechniqueVocabularyFactory = MultilingualKeywordsVocabulary("technique")
