# intk_vanabbe

Create a folder /nl/archief. Add its English translation, /en/archive.

### Import a publication:

```
http://localhost:8080/Plone/nl/archief/@@import_vubis?import=publication&max=10&query=bookBarcode=105020
```

### Import an exhibition:

```
http://localhost:8080/Plone/nl/archief/@@import_vubis?import=exhibition&max=10&query=recordNumber=101920
```

### Import 10 artworks and authors:

```
http://localhost:8080/Plone/nl/archief/@@import_vubis?import=artwork&max=10
```
