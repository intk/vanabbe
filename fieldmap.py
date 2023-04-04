#!/bin/env python3

import os
from collections import defaultdict

import lxml.etree

repo = "./data-import"

type_map = defaultdict(set)


def main():
    filenames = [
        os.path.join(repo, f)
        for f in next(os.walk(repo), (None, None, []))[2]
        if f.endswith(".xml")
    ]

    for fname in filenames:
        with open(fname) as f:
            xml = f.read()

        element = lxml.etree.fromstring(xml)

        type_ = None
        if element.xpath("./AuthorBio"):
            type_ = 'artwork'
        elif element.xpath("./eventCoorporation"):
            type_ = 'exhibition'
        else:
            type_ = 'publication'

        for node in element.iterchildren():
            type_map[type_].add(node.tag)

    for name, types in type_map.items():
        print(f"Type: {name}")
        print(types)
        print()


if __name__ == "__main__":
    main()
