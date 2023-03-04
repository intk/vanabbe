from plone.app.vocabularies.catalog import KeywordsVocabulary as BKV
from zope.interface import implementer
from zope.schema.interfaces import IVocabularyFactory


@implementer(IVocabularyFactory)
class KeywordsVocabulary(BKV):
    """KeywordsVocabulary"""

    def __init__(self, index):
        self.keyword_index = index


DecadesVocabularyFactory = KeywordsVocabulary("decades")
