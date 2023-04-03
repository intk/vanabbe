#!/bin/env python3

from collections import defaultdict
from intk_vanabbe.config import DATA_REPO
from intk_vanabbe.utils import is_artwork
from intk_vanabbe.utils import is_exhibition

import lxml.etree
import os


# DATA_REPO = "/data-import"

type_map = defaultdict(set)
attributes_map = defaultdict(set)


def main():
    repo = DATA_REPO
    filenames = [
        os.path.join(repo, f)
        for f in next(os.walk(repo), (None, None, []))[2]
        if f.endswith(".xml")
    ]

    for fname in filenames:
        with open(fname) as f:
            xml = f.read()

        element = lxml.etree.fromstring(xml)

        # if element.xpath('./authorName'):
        #     import pdb
        #     pdb.set_trace()

        type_ = None
        if is_artwork(element):
            type_ = 'artwork'
        elif is_exhibition(element):
            type_ = 'exhibition'
        else:
            type_ = 'publication'

        for node in element.iterchildren():
            type_map[type_].add(node.tag)
            attributes = node.attrib.keys()
            if attributes:
                for k in attributes:
                    attributes_map[node.tag].add(k)

    for name, types in type_map.items():
        print(f"Type: {name}")
        for line in sorted(types):
            print(line)
        print()

    print("Attributes")
    for name, attribs in attributes_map.items():
        print(f"Attribute: {name}")
        for line in sorted(attribs):
            print(line)
        print()


if __name__ == "__main__":
    main()
