DATA_REPO = "/Users/cihanandac/Documents/vanabbe/data-import"

IMPORT_LOCATIONS = {
    "artwork": "nl/collectie",
    "publication": "nl/collectie-onderzoek/bibliotheek/publicaties",
    "exhibition": "nl/tentoonstellingen",
    "author": "nl/collectie-onderzoek/kunstenaars",
}

IMAGE_BASE_URL = "https://vanabbemuseum.nl/fileadmin/files/collectie/%s"

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
