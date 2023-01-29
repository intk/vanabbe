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
