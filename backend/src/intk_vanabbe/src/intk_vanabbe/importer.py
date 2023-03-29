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

Import exhibitions:
http://62.221.199.184:17718/action=get&command=search&query=ccIndexName=VanabbeTentoonstellingen&fields=*&range=1-1000

Import publications:
http://62.221.199.184:17718/action=get&command=search&query=bookArtist=Gordon,%20Douglas&fields=*&range=0-100

Import artwork
"""  # noqa

from intk_vanabbe.config import IMAGE_BASE_URL
from intk_vanabbe.config import INT_FIELDS
from intk_vanabbe.config import INTL_FIELDS

import argparse
import hashlib
import logging
import lxml.etree
import os.path
import requests
import time
import transaction


logger = logging.getLogger("vubis")


opts = {
    "action": "get",
    "command": "search",
    # "query": "*=*",
    "fields": "*",
}
BASE_URL = (
    "http://62.221.199.184:17718/"
    + "&".join("=".join([k, v]) for k, v in opts.items())
    + "&range=%s-%s"
)

# http://62.221.199.184:17718/action=get&command=search&query=recordNumber=14633&fields=*&range=0-100

# action=get&command=search&query=*=*&fields=*&range=1-100

BATCH_SIZE = 500

ROOT = "//collectionConnection-resultset"


def to_dict(rec):
    """Convert a record to a dict"""

    out = {}
    for node in rec.iterchildren():
        k = node.tag
        text = node.text
        if k in INTL_FIELDS:
            lang = (node.get("Language", "nl")).lower()
            if not out.get(k):
                out[k] = {}
            out[k][lang] = text
            continue
        if k in out:
            if isinstance(out[k], list):
                out[k].append(text)
            else:
                out[k] = [out[k], text]
        else:
            out[k] = text

    for name in INT_FIELDS:
        if name in out:
            try:
                out[name] = int(out[name])
            except ValueError:
                # TODO: convert these fields to int
                print("Unable to convert to int:", name, out[name])
                del out[name]

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
    </dc_record>"""  # noqa

    # keys = ['ccObjectID', 'AuthorBio', 'authorBirthDate', 'authorDeathDate',
    # 'authorID', 'authorName', 'authorURL', 'ccIdentifier', 'ccIndexName', 'Dimensions',
    # 'objectCreationDate', 'objectCredit', 'objectID', 'objectImage', 'objectIsVisible',
    # 'objectMedium', 'objectTitle', 'objectYearPurchase', 'recordnumber']

    pass


def _import_exhibition(rec):
    """
    <dc_record>
    <ccObjectID>https://vanabbe.inforlibraries.com/abbeweb/LinkToVubis.csp?DataBib=3:344</ccObjectID>
    <ccIdentifier>https://vanabbe.inforlibraries.com/abbeweb/LinkToVubis.csp?DataBib=3:344</ccIdentifier>
    <ccIndexName>VanabbeTentoonstellingen</ccIndexName>
    <eventArtist>Wiley, William</eventArtist>
    <eventCoorporation>Solotentoonstelling - Curator: Jean Leering (directeur). - Opening: Inleiding : J. Leering. - Film: W.T. Wiley, 'Man's Nature'. Verder: W.T. Wiley, 'Plastic Haircut' ; 'Off Hand Jape' ; W.T. Wiley en R. Nelson, 'The Great Blondino' (28-04 en 29-04-1973) - Opmerkingen: Reizende tentoonstelling : Stedelijk Van Abbemuseum ; Lijnbaan Kunstcentrum, Rotterdam ; Internationaal Cultureel Centrum (ICC), Antwerpen - Met documentatie - Foto's: Van den Bichelaer, A. Villevoye</eventCoorporation>
    <eventDescription>In deze tentoonstelling werd een overzicht gegeven van de assemblages, aquarellen, tekeningen en films van de West-Coast kunstenaar William T. Wiley (Bedford 21-10-1937). De presentatie werd gezien als een nadere uitwerking en aanvulling op de Kompas IV-tentoonstelling over de beeldende kunst aan de West-Coast van de Verenigde Staten. Delen van zijn oeuvre worden wel gerekend tot de Funk Art.</eventDescription>
    <eventImages>https://mediabank.vanabbemuseum.nl/vam/files/alexandria/publiciteit/zaaloverzichten/1973/wiley/1973_wiley007.jpg</eventImages>
    <eventImages>https://mediabank.vanabbemuseum.nl/vam/files/alexandria/publiciteit/zaaloverzichten/1973/wiley/1973_wiley012.jpg</eventImages>
    <eventImages>https://mediabank.vanabbemuseum.nl/vam/files/alexandria/publiciteit/zaaloverzichten/1973/wiley/1973_wiley017.jpg</eventImages>
    <eventMedia>https://mediabank.vanabbemuseum.nl/vam/files/alexandria/publiciteit/zaaloverzichten/1973/wiley/wiley catalogus.pdf|Catalogus</eventMedia>
    <eventMedia>https://mediabank.vanabbemuseum.nl/vam/files/alexandria/publiciteit/folders/1973/FolderWiley1973.pdf|Folder</eventMedia>
    <eventMedia>https://mediabank.vanabbemuseum.nl/vam/files/alexandria/publiciteit/zaaloverzichten/1973/wiley/1973_wiley_inrichting.pdf|Inrichting (negatieven)</eventMedia>
    <eventMedia>https://mediabank.vanabbemuseum.nl/vam/files/alexandria/publiciteit/persberichten/1973/PersberichtNEDWiley1973.pdf|Persbericht NE</eventMedia>
    <eventMedia>http://mediabank.vanabbemuseum.nl/vam/start/tentoonstellingsarchief/1973%20William%20T.%20Wiley%20%3A%20Assemblages%20en%20aquarellen/Zaaloverzicht?fc=browse&column=8|Zaaloverzichten (mediabank)</eventMedia>
    <eventMedia>https://mediabank.vanabbemuseum.nl/vam/files/alexandria/publiciteit/zaalteksten/1973/ZaaltekstNEDWiley1973.pdf|Zaaltekst NE</eventMedia>
    <eventTimeFrom>Van: 13-04-73 tot: 28-05-73</eventTimeFrom>
    <eventTitle>William T. Wiley : Assemblages en aquarellen</eventTitle>
    <eventTitle_EN>William T. Wiley : Assemblages and watercolours</eventTitle_EN>
    <recordnumber>102971</recordnumber>
    </dc_record>
    """  # noqa
    pass


def _import_publication(rec):
    """
    <dc_record>
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


    <ccObjectID>2:105020</ccObjectID>
    <bookAnnotation>Kunstenaarsboek. - Oplage: 50. - Afmetingen: 11 x 14.9 cm</bookAnnotation>
    <bookArtist>Andreasen, Kasper</bookArtist>
    <bookauthorName>Andreasen, K</bookauthorName>
    <bookBarcode>105020</bookBarcode>
    <bookBBCode>105020</bookBBCode>
    <bookBbnummer>105020</bookBbnummer>
    <bookBinding>Kluis; 40 p ill</bookBinding>
    <bookCity>[Berlin]</bookCity>
    <bookCountry>Denemarken</bookCountry>
    <bookDatePublished>2021</bookDatePublished>
    <bookDescription>Kunstenaarsboek van de Deens kunstenaar Kasper Andreasen. - The The is a textual derivative based on combinations between the first word (which is a variable) followed by the word ‘the’. Meant as a passport-sized booklet, the words on these pages unfold as a sequence of statements whereby the subject always remains ‘the’. The alternating texts could be seen as having a self-reflexive mantra: for the, eat the, shit the, cut the, cure the, reject the, elect the, fight the, end the.</bookDescription>
    <bookIllustrations>https://mediabank.vanabbemuseum.nl/vam/files/alexandria/publicaties/2021/kasperthe02.jpg</bookIllustrations>
    <bookIllustrations>https://mediabank.vanabbemuseum.nl/vam/files/alexandria/publicaties/2021/kasperthe01.jpg</bookIllustrations>
    <bookLanguage>en</bookLanguage>
    <bookPublisher>s.n.</bookPublisher>
    <bookShelfmark>ANDREASEN, KASPER</bookShelfmark>
    <BookTitle>The The</BookTitle>
    <bookVubisid>2:105020</bookVubisid>
    <ccIdentifier>https://vanabbe.inforlibraries.com/abbeweb/LinkToVubis.csp?DataBib=2:105020</ccIdentifier>
    <ccIndexName>VanAbbeBibliotheek</ccIndexName>
    <recordnumber>96712</recordnumber>
    <VubisID>2:105020</VubisID>
    </dc_record>


    <dc_record>
    <ccObjectID>2:44573</ccObjectID>
    <bookAnnotation>Met bio- en bibliografie. - Met lijst werken</bookAnnotation>
    <bookArtist>Gordon, Douglas</bookArtist>
    <bookauthorName>Gordon, D</bookauthorName>
    <bookauthorName>McKee, F</bookauthorName>
    <bookauthorName>Lawson, T</bookauthorName>
    <bookauthorName>Debbaut, J</bookauthorName>
    <bookauthorName>Brouwers, A</bookauthorName>
    <bookBarcode>44573</bookBarcode>
    <bookBarcode>44573-2</bookBarcode>
    <bookBarcode>44573-3</bookBarcode>
    <bookBBCode>44573</bookBBCode>
    <bookBbnummer>44573</bookBbnummer>
    <bookBinding>Boek; 199 p ill</bookBinding>
    <bookCity>Eindhoven</bookCity>
    <bookCountry>Groot-Brittannië</bookCountry>
    <bookDatePublished>1998</bookDatePublished>
    <bookDescription>Boekproject van Douglas Gordon. - Coll. VAM: Gordon, Douglas, 10 ms-1, 1994, p. 68-69 ill. kleur ; Untitled Text (for someplace other than this), 1996, p. 75 ill. kleur ; Between Darkness and Light (After William Blake), 1997, p. 166-171 kleur en p. 176 zw ; The End (Split-Second Configuration), 1995, p. 188 ill. zw</bookDescription>
    <bookISBN>90-70149-65-6</bookISBN>
    <bookLanguage>en</bookLanguage>
    <bookPublisher>Stedelijk Van Abbemuseum</bookPublisher>
    <bookShelfmark>GORDON, DOUGLAS</bookShelfmark>
    <BookSubTitle>Douglas Gordon</BookSubTitle>
    <BookTitle>Kidnapping</BookTitle>
    <bookVubisid>2:44573</bookVubisid>
    <ccIdentifier>https://vanabbe.inforlibraries.com/abbeweb/LinkToVubis.csp?DataBib=2:44573</ccIdentifier>
    <ccIndexName>VanAbbeBibliotheek</ccIndexName>
    <recordnumber>18281</recordnumber>
    <VubisID>2:44573</VubisID>
    </dc_record>

    """  # noqa
    # keys = ['ccObjectID', 'bookBarcode', 'bookBBCode', 'bookBbnummer', 'bookBinding',
    #         'bookCity', 'bookDatePublished', 'bookLanguage', 'bookPublisher',
    #         'bookShelfmark', 'BookTitle', 'bookVubisid', 'ccIdentifier', 'ccIndexName',
    #         'recordnumber', 'VubisID']
    pass


def scroll(
    import_artwork,
    import_publication,
    import_exhibition,
    max_records=10,
    query="&query=*=*",
):
    """Fetch information from URL"""
    cur = 1
    count = 0
    use_archive = False

    while count < max_records:
        url = (BASE_URL + query) % (cur, cur + BATCH_SIZE)
        print("Fetch records: ", cur, cur + BATCH_SIZE, url)
        resp = requests.get(url, verify=False)
        cur = cur + BATCH_SIZE + 1
        doc = lxml.etree.fromstring(resp.text.encode("utf-8"))
        # max_records = int(doc.xpath(
        # 'number(%s/request/count/text())' % ROOT))

        records = doc.xpath("%s/records/record/data/dc_record" % ROOT)

        if not records:
            break

        for element in records:
            infodict = to_dict(element)

            imported = False

            if element.xpath("./AuthorBio"):
                imported = import_artwork(infodict, element, use_archive)
            elif element.xpath("./eventCoorporation"):
                imported = import_exhibition(infodict, element, use_archive)
            else:
                imported = import_publication(infodict, element, use_archive)

            if imported:
                count += 1

            if count % 100 == 0:
                transaction.savepoint()

            if count == max_records:
                break


def scroll_from_archive(
    import_artwork,
    import_publication,
    import_exhibition,
    imported_records=None,
    max_records=10,
    query=None,
):
    imported_records = imported_records or []
    use_archive = True
    repo = "/data-import"

    if query:
        filenames = [os.path.join(repo, f"{query}.xml")]
    else:
        filenames = [
            os.path.join(repo, f)
            for f in next(os.walk(repo), (None, None, []))[2]
            if f.endswith(".xml")
        ]
    cur = 0
    count = 0

    while count < min(len(filenames), max_records):
        try:
            fname = filenames[cur]
        except Exception:
            logger.exception("Finished?")
            break

        cur += 1

        with open(fname) as f:
            xml = f.read()

        element = lxml.etree.fromstring(xml)

        infodict = to_dict(element)

        recordnumber = int(element.xpath("./recordnumber/text()")[0])
        if recordnumber in imported_records:
            print(f"Skipping {recordnumber}, already imported")
            continue

        imported = False

        if element.xpath("./AuthorBio"):
            imported = import_artwork(infodict, element, use_archive)
        elif element.xpath("./eventCoorporation"):
            imported = import_exhibition(infodict, element, use_archive)
        else:
            imported = import_publication(infodict, element, use_archive)

        if imported:
            count += 1

        if count % 100 == 0:
            transaction.savepoint()

        if count % 500 == 0:
            transaction.commit()

        if count == max_records:
            break


def extract_images(record):
    images = []

    for img in record.xpath("eventImages/text()"):
        images.append(img)

    for img in record.xpath("bookIllustrations/text()"):
        images.append(img)

    for img in record.xpath("objectImage/text()"):
        img = IMAGE_BASE_URL % img
        images.append(img)

    return images


def get_filename(url):
    m = hashlib.sha1()
    m.update(url.encode("ascii"))

    ext = url.rsplit(".", 1)[-1]

    return f"{m.hexdigest()}.{ext}"


def download_image(url, filename):
    _headers = [
        "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Language: en,ro-RO;q=0.9,ro;q=0.8",
        "Cache-Control: no-cache",
        "Connection: keep-alive",
        "Cookie: vam=lasturi&%2Fvam%2Ffiles%2Falexandria%2Fpubliciteit%2Fzaaloverzichten%2F2022%2Falastingtruthischange%2FM10P6879.jpg; gridWidthSize=width=1200&height=1000; TS01b41909=01a17e7670f1c83c0a893e8bd7a582528a8201baac266c3f7d751e0c96aa5acb6962c0dfc5df056f9c5720c54d801a6badbfbfa37dba80b6588e1d603343047d8776aef87ddfd408e9f4ace6a701ebcf3c3a7e6d53; TSd8810ea4027=08cee8bad7ab2000b4ff69515fd3a62ed8685f4ae1facb1ccfdd3ea385561a7b41e63f2901ef2386089f7a7e90113000250c4e692be171e4ca37386fb8daa575a67e88da9eac3d30c1c45de282c1f081cdb0c404ced8133f30470bcaf799d59a",
        "DNT: 1",
        "Pragma: no-cache",
        "Sec-Fetch-Dest: document",
        "Sec-Fetch-Mode: navigate",
        "Sec-Fetch-Site: none",
        "Sec-Fetch-User: ?1",
        "Upgrade-Insecure-Requests: 1",
        "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
        'sec-ch-ua: "Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
        "sec-ch-ua-mobile: ?0" 'sec-ch-ua-platform: "Linux"',
    ]

    HEADERS = dict([line.split(":", 1) for line in _headers])

    for k, v in HEADERS.items():
        HEADERS[k] = v.strip()

    try:
        with requests.get(
            url, stream=True, verify=False, headers=HEADERS
        ) as req:  # noqa
            data = req.raw.read()

            if "DOCTYP" in str(data[:10]):  # avoids missing images
                return
            with open(filename, "wb") as f:
                f.write(data)
    except Exception:
        print(f"Error fetching {url}")


def dump(record, destination):
    rec_id = record.xpath("recordnumber/text()")[0]

    fname = f"{rec_id}.xml"
    location = os.path.join(destination, fname)

    if not os.path.isfile(location):
        with open(location, "wb") as f:
            printed = lxml.etree.tostring(record)
            f.write(printed)

            print("Dumped", fname)

    images = extract_images(record)
    if images:
        dirname = os.path.join(destination, rec_id)
        if not os.path.isdir(dirname):
            os.makedirs(dirname)

        for img in images:
            fname = os.path.join(dirname, get_filename(img))

            if not os.path.isfile(fname):
                download_image(img, fname)
                print("Downloaded", img)
        # return 1

    return 0


def get_max_records():
    query = "&query=*=*"
    url = (BASE_URL + query) % (1, 1 + BATCH_SIZE)
    resp = requests.get(url, verify=False)
    doc = lxml.etree.fromstring(resp.text.encode("utf-8"))
    count = int(doc.xpath(f'{ROOT}/request/count/text()')[0])
    return count


def copy_vubis():
    parser = argparse.ArgumentParser(
        prog="Copy Vubis",
        description="Command line tool to create an offline copy of Vubis",
    )
    parser.add_argument("destination")
    parser.add_argument("-c", "--maxcount", type=int, help="Max records copied")  # noqa

    args = parser.parse_args()
    destination = args.destination
    query = "&query=*=*"

    max_records = args.maxcount or get_max_records()

    print(f"Fetching vubis archive of {max_records} records")

    cur = 1
    count = 0
    new = 0

    start = time.time()

    while count < max_records:
        url = (BASE_URL + query) % (cur, cur + BATCH_SIZE)
        # print("Fetch records: ", cur, cur + BATCH_SIZE, url)
        resp = requests.get(url, verify=False)
        cur = cur + BATCH_SIZE + 1
        doc = lxml.etree.fromstring(resp.text.encode("utf-8"))
        # max_records = int(doc.xpath(
        # 'number(%s/request/count/text())' % ROOT))

        records = doc.xpath("%s/records/record/data/dc_record" % ROOT)
        for rec in records:
            new += dump(rec, destination)
            count += 1

    end = time.time()

    print(f"Saved {count} records. {new} new records. No failures")
    print(f"Elapsed time: {end - start} seconds")


if __name__ == "__main__":
    copy_vubis()
