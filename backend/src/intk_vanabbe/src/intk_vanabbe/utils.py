import math


def decade(year):
    if not isinstance(year, int):
        try:
            year = int(year)
        except Exception:
            return

    start = math.floor(year / 10) * 10
    end = start + 10

    return f"{start}-{end}"


def is_artwork(element):
    if element.xpath("./objectTitle"):
        return True
    if element.xpath("./AuthorBio"):
        return True


def is_exhibition(element):
    if element.xpath("./eventTitle"):
        return True

    if element.xpath("./eventCoorporation"):
        return True
