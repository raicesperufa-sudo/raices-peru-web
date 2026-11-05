from html.parser import HTMLParser
from pathlib import Path


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.h1_count = 0
        self.has_title = False
        self.links: list[str] = []
        self.images: list[tuple[str, bool]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "title":
            self.has_title = True
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "a" and values.get("href"):
            self.links.append(values["href"] or "")
        elif tag == "img" and values.get("src"):
            self.images.append((values["src"] or "", "alt" in values))


root = Path(__file__).parent
errors: list[str] = []
pages = list(root.glob("*.html"))

for page in pages:
    parser = PageParser()
    parser.feed(page.read_text(encoding="utf-8"))
    if not parser.has_title:
        errors.append(f"{page.name}: falta title")
    if parser.h1_count != 1:
        errors.append(f"{page.name}: contiene {parser.h1_count} h1")
    for href in parser.links:
        local_href = href.split("#", 1)[0]
        if not href.startswith(("http:", "https:", "mailto:", "#")) and not (root / local_href).exists():
            errors.append(f"{page.name}: enlace inexistente {href}")
    for src, has_alt in parser.images:
        if not (page.parent / src).exists():
            errors.append(f"{page.name}: imagen inexistente {src}")
        if not has_alt:
            errors.append(f"{page.name}: imagen sin alt")

print(f"Páginas verificadas: {len(pages)}")
if errors:
    print("Errores:")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)
print("Validación estructural correcta")
