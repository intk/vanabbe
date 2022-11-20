""" Importer for TMS/VUBIS

This week I was researching how we can sync data with their systems. As far as
I understand, all data (TMS and VUBIS) comes from a combined XML.
The XML follows an open standard that is described here:
https://www.openarchives.org/pmh/
http://62.221.199.184:17718/action=get&command=search&query=*=*&fields=*&range=1-100
Here on top of the XML data you’ll see that the index counts: 103.598 records in total.
If I’m informed correctly, for the current website this data is downloaded with a script,
I guess requesting the data in step, first range 1-1000, then 1001-2001, and so on. It’s
strongly advised not to request more than 1.000 at once, to keep the data stream working
smoothly.  
This might be the most straight forward method for your company as well.
The XML is updated once every 24 hours. The fresh XML will be ready each day around 4:30
in the morning.

"""

import lxml.etree
import os
import requests
import shutil


BASE_URL = "http://62.221.199.184:17718/action=get&command=search"\
        "&query=*=*&fields=*&range=%s-%s"
BATCH_SIZE = 100

ROOT = "//collectionConnection-resultset"
IMAGE_BASE_URL = "https://vanabbemuseum.nl/fileadmin/files/collectie/%s"

FILE_REPO = "./files"

if not os.path.isdir(FILE_REPO):
    os.makedirs(FILE_REPO)


def to_dict(rec):
    """ Convert a record to a dict
    """

    out = {}
    for node in rec.iterchildren():
        k = node.tag
        text = node.text
        if k in out:
            if isinstance(out[k], list):
                out[k].append(text)
            else:
                out[k] = [out[k], text]
        else:
            out[k] = text

    print(out.keys())
    return out


def _import_artwork(rec):
    """<dc_record>
<ccObjectID>344</ccObjectID>
<AuthorBio authorID="977">1864 Banka (RI) - 1942 Amersfoort (NL)</AuthorBio>
<authorBirthDate authorID="977">1864</authorBirthDate>
<authorDeathDate authorID="977">1942</authorDeathDate>
<authorID>977</authorID>
<authorName authorID="977" authorSortName="Akkeringa, Johan">Johan Akkeringa</authorName>
<authorURL authorID="977" Language="NL" Title="naar biografie op wikipedia">https://nl.wikipedia.org/wiki/Johannes_Evert_Hendrik_Akkeringa</authorURL>
<authorURL authorID="977" Language="EN" Title="to biography on wikipedia">https://en.wikipedia.org/wiki/Johannes_Evert_Hendrik_Akkeringa</authorURL>
<ccIdentifier>C344</ccIdentifier>
<ccIndexName>VanAbbeCollectie</ccIndexName>
<Dimensions>26,7 x 54,1cm (incl. lijst / frame)</Dimensions>
<objectCreationDate>z.j. / s.a.</objectCreationDate>
<objectCredit>schenking / donation B. de Geus v.d. Heuvel</objectCredit>
<objectID>1</objectID>
<objectImage PrimaryDisplay="1" Rank="0">0001.JPG</objectImage>
<objectIsVisible>0</objectIsVisible>
<objectMedium Language="NL">olieverf op paneel</objectMedium>
<objectMedium Language="EN">oil on panel</objectMedium>
<objectTitle Rangorde="1">Paardenrennen te Clingendaal</objectTitle>
<objectYearPurchase>1948</objectYearPurchase>
<recordnumber>1</recordnumber>
</dc_record>
"""
    # keys = ['ccObjectID', 'AuthorBio', 'authorBirthDate', 'authorDeathDate', 'authorID',
    #         'authorName', 'authorURL', 'ccIdentifier', 'ccIndexName', 'Dimensions',
    #         'objectCreationDate', 'objectCredit', 'objectID', 'objectImage',
    #         'objectIsVisible', 'objectMedium', 'objectTitle', 'objectYearPurchase',
    #         'recordnumber']
    filename = rec['objectImage']
    local_filename = os.path.join(FILE_REPO, filename)

    img_url = IMAGE_BASE_URL % filename

    with requests.get(img_url, stream=True) as req:
        with open(local_filename, 'wb') as file:
            shutil.copyfileobj(req.raw, file)


def _import_publication(rec):
    """<dc_record>
<ccObjectID>2:63445</ccObjectID>
<bookAnnotation>Met bibliografie</bookAnnotation>
<bookArtist>Wickenburgh, Alfred (Gleichenberg, 26-07-1885 - ..., ...)</bookArtist>
<bookauthorName>Jungenritt, K</bookauthorName>
<bookBarcode>EO-23-45</bookBarcode>
<bookBBCode>63445</bookBBCode>
<bookBbnummer>63445</bookBbnummer>
<bookBinding>Boek; ... p ill</bookBinding>
<bookCity>Graz</bookCity>
<bookDatePublished>1975</bookDatePublished>
<bookDescription>Tent. Graz, Neue Gal. Landesmuseum, 01-07-1975 - 24-08-1975</bookDescription>
<bookLanguage>de</bookLanguage>
<bookPublisher>Neue Galerie am Landesmuseum</bookPublisher>
<bookShelfmark>WICKENBURGH, ALFRED</bookShelfmark>
<BookTitle>Alfred Wickenburgh</BookTitle>
<bookVubisid>2:63445</bookVubisid>
<ccIdentifier>https://vanabbe.inforlibraries.com/abbeweb/LinkToVubis.csp?DataBib=2:63445</ccIdentifier>
<ccIndexName>VanAbbeBibliotheek</ccIndexName>
<recordnumber>100002</recordnumber>
<VubisID>2:63445</VubisID>
</dc_record>
"""
    # keys = ['ccObjectID', 'bookBarcode', 'bookBBCode', 'bookBbnummer', 'bookBinding',
    #         'bookCity', 'bookDatePublished', 'bookLanguage', 'bookPublisher',
    #         'bookShelfmark', 'BookTitle', 'bookVubisid', 'ccIdentifier', 'ccIndexName',
    #         'recordnumber', 'VubisID']
    pass


def scroll(import_artwork, import_publication, max_records=10):
    """ Fetch information from URL
    """
    cur = 1

    while cur < max_records:
        url = BASE_URL % (cur, cur + BATCH_SIZE)
        print(url)
        resp = requests.get(url)
        cur = cur + BATCH_SIZE + 1
        doc = lxml.etree.fromstring(resp.text.encode('utf-8'))
        max_recs = doc.xpath('number(%s/request/count/text())' % ROOT)
        print(max_recs)
        # print(resp.text)
        # print(doc.xpath('//dc_record'))

        for rec in doc.xpath('%s/records/record/data/dc_record' % ROOT):
            info = to_dict(rec)
            if rec.xpath('./AuthorBio'):
                import_artwork(info)
            else:
                import_publication(info)


if __name__ == "__main__":
    scroll()
