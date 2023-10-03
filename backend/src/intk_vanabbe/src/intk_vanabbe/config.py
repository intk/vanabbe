DATA_REPO = "/Users/cihanandac/Documents/vanabbe/data-import"

IMPORT_LOCATIONS = {
    "artwork": "nl/collectie",
    "artwork_en": "en/collection",
    "publication": "nl/collectie-onderzoek/bibliotheek/publicaties",
    "exhibition": "nl/tentoonstellingen",
    "author": "nl/collectie-onderzoek/kunstenaars",
    "author_en": "en/collection-research/artists"
    # "author": "nl/kunstenaars",
    # "author_en": "en/artists",
}

# IMAGE_BASE_URL = "https://vanabbemuseum.nl/fileadmin/files/collectie/%s"
IMAGE_BASE_URL = "https://mediabank.vanabbemuseum.nl/website/Artworks_HR"

INT_FIELDS = [
    "bookDatePublished",
    "recordnumber",
    "authorBirthDate",
    "authorDeathDate",
    "objectCreationDateFrom",
    "objectCreationDateTo",
    "objectYearPurchase",
]

INTL_FIELDS = [
    "authorURL",
    "objectMedium",
    "objectDescription",
]
