"""Extract plain text (one paragraph per line) and hyperlink targets from the CV .docx.

Usage:  python -I content/scripts/extract_cv_docx.py content/source/CV_molly_Winter_2026.docx content/source/cv_text.txt

Standard library only. Hyperlink targets are written inline as  [[link: URL]]  after the
linked run so that DOIs embedded as hyperlinks are preserved for the content audit.
"""
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
R = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"


def main(src: str, dst: str) -> None:
    with zipfile.ZipFile(src) as z:
        doc = ET.fromstring(z.read("word/document.xml"))
        rels = ET.fromstring(z.read("word/_rels/document.xml.rels"))
    targets = {r.get("Id"): r.get("Target") for r in rels}

    lines = []
    for p in doc.iter(W + "p"):
        parts = []
        for node in p:
            if node.tag == W + "r":
                parts.append("".join(t.text or "" for t in node.iter(W + "t")))
            elif node.tag == W + "hyperlink":
                parts.append("".join(t.text or "" for t in node.iter(W + "t")))
                rid = node.get(R + "id")
                if rid and rid in targets:
                    parts.append(f" [[link: {targets[rid]}]]")
        text = re.sub(r"\s+", " ", "".join(parts)).strip()
        lines.append(text)

    # collapse runs of blank lines
    out, blank = [], False
    for line in lines:
        if not line:
            if not blank:
                out.append("")
            blank = True
        else:
            out.append(line)
            blank = False
    with open(dst, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print(f"{len(out)} lines -> {dst}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
