from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
OUT = ASSETS / "manuales" / "lector" / "mindfulness-respiracion-familias"
PORTADA = ASSETS / "manuales" / "portadas" / "manual-mindfulness-respiracion-familias.webp"

W, H = 870, 1230
# Coincide con el fondo del logotipo para integrarlo sin un rectángulo visible.
BG = "#F7F2E6"
NAVY = "#173A5E"
TEAL = "#17697A"
TERRA = "#D77D58"
GREEN = "#76977E"
GOLD = "#E2B954"
PALE_BLUE = "#E7F1F2"
PALE_GREEN = "#EAF2EB"
PALE_TERRA = "#F7E5D8"
INK = "#2F4148"
MUTED = "#607176"
LINE = "#C9D9D6"

FONT_REG = Path("C:/Windows/Fonts/segoeui.ttf")
FONT_SEMI = Path("C:/Windows/Fonts/seguisb.ttf")
FONT_BOLD = Path("C:/Windows/Fonts/seguisb.ttf")
FONT_BLACK = Path("C:/Windows/Fonts/seguibl.ttf")


def font(size, bold=False, black=False):
    path = FONT_BLACK if black else FONT_BOLD if bold else FONT_REG
    return ImageFont.truetype(str(path), size)


def cover_crop(image, box):
    x, y, x2, y2 = box
    tw, th = x2 - x, y2 - y
    im = image.convert("RGB")
    scale = max(tw / im.width, th / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.Resampling.LANCZOS)
    left = max(0, (im.width - tw) // 2)
    top = max(0, (im.height - th) // 2)
    return im.crop((left, top, left + tw, top + th))


def wrap(draw, text, fnt, width):
    lines = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        if not words:
            lines.append("")
            continue
        line = words[0]
        for word in words[1:]:
            trial = f"{line} {word}"
            if draw.textlength(trial, font=fnt) <= width:
                line = trial
            else:
                lines.append(line)
                line = word
        lines.append(line)
    return lines


def text_block(draw, xy, text, fnt, fill=INK, width=720, spacing=10, anchor="la"):
    x, y = xy
    lines = wrap(draw, text, fnt, width)
    line_h = fnt.getbbox("Ag")[3] - fnt.getbbox("Ag")[1]
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=fill, anchor=anchor)
        y += line_h + spacing
    return y


def round_rect(draw, box, fill, outline=None, radius=24, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def add_watermark(page):
    mark = Image.open(ASSETS / "isotipo-raices.webp").convert("RGBA")
    mark.thumbnail((480, 480), Image.Resampling.LANCZOS)
    alpha = mark.getchannel("A").point(lambda p: round(p * 0.055))
    mark.putalpha(alpha)
    page.alpha_composite(mark, (W - mark.width - 15, H - mark.height - 60))


def base_page(number, section):
    page = Image.new("RGBA", (W, H), BG)
    add_watermark(page)
    d = ImageDraw.Draw(page)
    d.text((58, 35), "RAÍCES PERÚ  /  MINDFULNESS Y RESPIRACIÓN", font=font(13, bold=True), fill=NAVY)
    d.text((812, 35), section.upper(), font=font(12, bold=True), fill=TERRA, anchor="ra")
    d.line((58, 68, 812, 68), fill=LINE, width=2)
    d.text((58, 1185), "Guía orientativa. La práctica se adapta a la persona.", font=font(11), fill=MUTED)
    d.text((812, 1185), f"{number:02d}", font=font(11, bold=True), fill=TEAL, anchor="ra")
    return page, d


def title(draw, top, first, accent=None, size=45):
    y = text_block(draw, (58, top), first, font(size, black=True), NAVY, 750, 5)
    if accent:
        y = text_block(draw, (58, y + 2), accent, font(size, black=True), TERRA, 750, 5)
    return y


def pill(draw, xy, text, fill=PALE_BLUE, color=NAVY, width=260):
    x, y = xy
    round_rect(draw, (x, y, x + width, y + 46), fill, None, 23)
    draw.text((x + width / 2, y + 23), text.upper(), font=font(12, bold=True), fill=color, anchor="mm")


def info_card(draw, box, label, body, accent, fill="#FFFFFF"):
    x, y, x2, y2 = box
    round_rect(draw, box, fill, LINE, 24, 2)
    draw.ellipse((x + 22, y + 24, x + 56, y + 58), fill=accent)
    draw.text((x + 73, y + 26), label, font=font(16, bold=True), fill=accent)
    text_block(draw, (x + 24, y + 76), body, font(17), INK, x2 - x - 48, 8)


def image_panel(page, source, box, radius=30, focus=None):
    im = Image.open(ASSETS / source).convert("RGB")
    crop = cover_crop(im, box)
    mask = Image.new("L", crop.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, crop.width, crop.height), radius=radius, fill=255)
    page.paste(crop, (box[0], box[1]), mask)


def page_01():
    page = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(page)
    # Logo shares the same warm background so it feels integrated rather than pasted on.
    logo = Image.open(ASSETS / "logo-raices-completo.webp").convert("RGB")
    logo = logo.crop((210, 25, 1290, 930))
    logo.thumbnail((285, 238), Image.Resampling.LANCZOS)
    page.paste(logo, (58, 30))
    pill(d, (58, 276), "Guía visual · familias y educadores", PALE_BLUE, NAVY, 418)
    d.text((58, 370), "MINDFULNESS", font=font(52, black=True), fill=NAVY)
    d.text((58, 430), "EN RAÍCES", font=font(52, black=True), fill=TERRA)
    d.text((58, 510), "NOTAR SIN OBLIGAR", font=font(27, bold=True), fill=GREEN)
    text_block(d, (58, 560), "Respiración, sentidos y cuerpo en prácticas breves, cómodas y adaptables.", font(22), INK, 700, 10)
    image_panel(page, "personaje-cuerpoespin-v2.webp", (42, 710, 828, 1115), 34)
    round_rect(d, (58, 650, 530, 730), "#FFFFFFE8", LINE, 22, 2)
    d.text((82, 672), "No buscamos imponer calma.", font=font(17, bold=True), fill=NAVY)
    d.text((82, 703), "Buscamos hacer visible lo que el cuerpo nota.", font=font(16), fill=INK)
    d.text((58, 1152), "RAÍCES PERÚ", font=font(15, bold=True), fill=NAVY)
    d.text((812, 1152), "Investigación y autoría: Patricia B. Albornoz", font=font(11), fill=MUTED, anchor="ra")
    return page


def page_02():
    page, d = base_page(2, "Punto de partida")
    y = title(d, 110, "Mindfulness aquí significa", "notar con curiosidad")
    text_block(d, (60, y + 18), "La atención puede ir a una respiración, un sonido, una sensación o una necesidad. No hay que dejar la mente en blanco ni permanecer inmóvil.", font(19), INK, 745, 9)
    cards = [
        ("SÍ PUEDE SER", "Una pausa corta para observar, elegir y continuar.", TEAL, PALE_BLUE),
        ("NO TIENE QUE SER", "Silencio total, ojos cerrados o una postura perfecta.", TERRA, PALE_TERRA),
        ("SI DISTRAE", "Cambie de práctica, reduzca el tiempo o permita movimiento.", GREEN, PALE_GREEN),
        ("SI NO QUIERE", "La persona puede mirar, escuchar, posponer o detenerse.", GOLD, "#FFF4D8"),
    ]
    top = 480
    for i, (label, body, accent, fill) in enumerate(cards):
        row, col = divmod(i, 2)
        x = 58 + col * 382
        y0 = top + row * 225
        info_card(d, (x, y0, x + 356, y0 + 198), label, body, accent, fill)
    round_rect(d, (58, 965, 812, 1102), PALE_BLUE, None, 28)
    d.text((84, 993), "LA META NO ES SENTIRSE BIEN TODO EL TIEMPO.", font=font(18, bold=True), fill=NAVY)
    text_block(d, (84, 1032), "La meta es reconocer lo que ocurre y elegir una respuesta posible.", font(18), INK, 680, 7)
    return page


def page_03():
    page, d = base_page(3, "Preparar")
    title(d, 110, "Antes de empezar,", "abra opciones")
    image_panel(page, "personaje-colibri-v2.webp", (58, 275, 812, 520), 28)
    items = [
        ("1", "TIEMPO", "Empiece con 30 a 60 segundos."),
        ("2", "MIRADA", "Ojos abiertos, entreabiertos o cerrados."),
        ("3", "CUERPO", "Sentado, de pie o en movimiento suave."),
        ("4", "SALIDA", "Puede detenerse sin dar explicaciones."),
    ]
    y = 565
    for n, label, body in items:
        d.ellipse((66, y, 116, y + 50), fill=[TEAL, GREEN, TERRA, GOLD][int(n)-1])
        d.text((91, y + 25), n, font=font(18, bold=True), fill="white", anchor="mm")
        d.text((140, y + 2), label, font=font(15, bold=True), fill=NAVY)
        d.text((140, y + 30), body, font=font(17), fill=INK)
        y += 115
    round_rect(d, (58, 1035, 812, 1125), PALE_TERRA, None, 24)
    d.text((82, 1066), "Pregunte: ¿esto se siente cómodo, neutro o incómodo?", font=font(18, bold=True), fill=NAVY)
    return page


def page_04():
    page, d = base_page(4, "Práctica 1")
    title(d, 110, "El detective", "de la respiración")
    text_block(d, (60, 245), "Observe la respiración sin intentar cambiarla. Una mano puede ir al pecho o al abdomen si ese contacto resulta cómodo.", font(19), INK, 740, 9)
    steps = [
        ("OBSERVA", "¿Dónde notas movimiento?"),
        ("DESCRIBE", "¿Rápida, lenta, pequeña o amplia?"),
        ("COMPARA", "¿Está igual o cambió después de moverte?"),
        ("VUELVE", "Deja que la respiración siga su ritmo espontáneo."),
    ]
    y = 405
    colors = [TEAL, GREEN, TERRA, GOLD]
    for i, (head, body) in enumerate(steps):
        round_rect(d, (58, y, 812, y + 128), "#FFFFFF", LINE, 24, 2)
        d.ellipse((82, y + 30, 150, y + 98), fill=colors[i])
        d.text((116, y + 64), str(i + 1), font=font(23, bold=True), fill="white", anchor="mm")
        d.text((177, y + 28), head, font=font(16, bold=True), fill=colors[i])
        d.text((177, y + 64), body, font=font(18), fill=INK)
        y += 145
    round_rect(d, (58, 1012, 812, 1112), PALE_BLUE, None, 24)
    d.text((82, 1042), "No pida respiraciones máximas ni profundamente forzadas.", font=font(18, bold=True), fill=NAVY)
    d.text((82, 1074), "Observar ya es una práctica completa.", font=font(17), fill=INK)
    return page


def page_05():
    page, d = base_page(5, "Práctica 2")
    title(d, 110, "Cinco sentidos", "para volver al presente")
    image_panel(page, "personaje-monito-v2.webp", (58, 270, 812, 560), 28)
    senses = [
        ("5", "cosas que puedes ver", TEAL),
        ("4", "sensaciones de contacto", GREEN),
        ("3", "sonidos cercanos o lejanos", TERRA),
        ("2", "olores, si los hay", GOLD),
        ("1", "cosa que necesitas ahora", NAVY),
    ]
    y = 600
    for n, label, color in senses:
        d.ellipse((70, y, 130, y + 60), fill=color)
        d.text((100, y + 30), n, font=font(23, bold=True), fill="white", anchor="mm")
        d.text((155, y + 14), label, font=font(18, bold=True), fill=INK)
        y += 88
    round_rect(d, (58, 1050, 812, 1128), PALE_GREEN, None, 22)
    d.text((82, 1077), "No es una prueba: se puede saltar un sentido o pedir ayuda.", font=font(17, bold=True), fill=NAVY)
    return page


def page_06():
    page, d = base_page(6, "Práctica 3")
    title(d, 110, "Un mapa del cuerpo", "sin corregirlo")
    text_block(d, (60, 240), "Recorra el cuerpo de abajo hacia arriba. En cada zona basta con notar una palabra: cómodo, tenso, caliente, frío, inquieto o sin señal clara.", font(19), INK, 740, 9)
    # Simple body map illustration.
    cx = 230
    d.ellipse((cx - 42, 380, cx + 42, 464), outline=TEAL, width=8)
    d.line((cx, 464, cx, 730), fill=TEAL, width=12)
    d.line((cx, 520, cx - 105, 625), fill=TEAL, width=11)
    d.line((cx, 520, cx + 105, 625), fill=TEAL, width=11)
    d.line((cx, 728, cx - 80, 920), fill=TEAL, width=12)
    d.line((cx, 728, cx + 80, 920), fill=TEAL, width=12)
    zones = [
        ("PIES", "¿Necesitan apoyo o movimiento?", GREEN),
        ("ABDOMEN", "¿Hay espacio, presión o cambio?", TERRA),
        ("HOMBROS", "¿Quieren bajar, girar o quedarse?", GOLD),
        ("ROSTRO", "Nota mandíbula, ojos y frente.", TEAL),
    ]
    y = 405
    for head, body, color in zones:
        round_rect(d, (410, y, 812, y + 118), "#FFFFFF", LINE, 22, 2)
        d.text((438, y + 24), head, font=font(15, bold=True), fill=color)
        text_block(d, (438, y + 55), body, font(17), INK, 340, 6)
        y += 137
    round_rect(d, (58, 1015, 812, 1120), PALE_TERRA, None, 24)
    d.text((82, 1045), "Al final, elija una opción:", font=font(16, bold=True), fill=NAVY)
    d.text((82, 1080), "moverse · descansar · beber agua · cambiar de actividad", font=font(17), fill=INK)
    return page


def page_07():
    page, d = base_page(7, "Práctica 4")
    title(d, 110, "Rápido, tranquilo", "y recuperación")
    image_panel(page, "personaje-aguila-v2.webp", (58, 270, 812, 540), 28)
    stages = [
        ("ANTES", "Nota cómo respiras y cómo se siente tu cuerpo.", TEAL),
        ("MOVIMIENTO", "Camina, estira o mueve brazos con intensidad cómoda.", TERRA),
        ("DESPUÉS", "Observa qué cambió sin intentar corregirlo.", GOLD),
        ("RECUPERACIÓN", "Espera y reconoce cuándo vuelve hacia lo habitual.", GREEN),
    ]
    y = 580
    for label, body, color in stages:
        d.rounded_rectangle((58, y, 220, y + 58), radius=29, fill=color)
        d.text((139, y + 29), label, font=font(13, bold=True), fill="white", anchor="mm")
        text_block(d, (248, y + 3), body, font(17), INK, 545, 7)
        y += 112
    round_rect(d, (58, 1036, 812, 1125), PALE_BLUE, None, 24)
    d.text((82, 1066), "Comparar no es competir. Cada cuerpo recupera a su manera.", font=font(17, bold=True), fill=NAVY)
    return page


def page_08():
    page, d = base_page(8, "Progresión")
    title(d, 110, "De una pausa breve", "a una práctica propia")
    levels = [
        ("SEMILLA", "30–60 segundos", "Elija una sola señal: respiración, sonido o contacto.", TEAL),
        ("BROTE", "2–3 minutos", "Combine dos señales y diga qué ayudó o distrajo.", GREEN),
        ("BOSQUE", "4–5 minutos", "Elija la práctica, ajuste el ritmo y decida cómo continuar.", TERRA),
    ]
    y = 300
    for i, (name, time, body, color) in enumerate(levels, 1):
        round_rect(d, (58, y, 812, y + 190), "#FFFFFF", LINE, 28, 2)
        d.ellipse((82, y + 38, 170, y + 126), fill=color)
        d.text((126, y + 82), str(i), font=font(28, bold=True), fill="white", anchor="mm")
        d.text((200, y + 33), name, font=font(18, bold=True), fill=color)
        d.text((200, y + 68), time, font=font(17, bold=True), fill=NAVY)
        text_block(d, (200, y + 103), body, font(17), INK, 565, 7)
        y += 215
    round_rect(d, (58, 965, 812, 1125), PALE_BLUE, None, 26)
    d.text((82, 994), "GUÍA DE VOZ EN LA WEB", font=font(16, bold=True), fill=TEAL)
    text_block(d, (82, 1032), "Abra Biblioteca Activa y elija “Estación del momento presente”. La voz lee cada paso y permite avanzar o repetir.", font(18), INK, 660, 8)
    return page


def page_09():
    page, d = base_page(9, "Observar")
    title(d, 110, "Después de practicar,", "pregunte menos y escuche más")
    text_block(d, (60, 250), "No buscamos una respuesta correcta. Buscamos información para adaptar la próxima experiencia.", font(19), INK, 740, 9)
    options = [
        ("AYUDÓ", "¿Qué parte quisieras repetir?", GREEN, PALE_GREEN),
        ("FUE NEUTRO", "¿Prefieres otra señal o más movimiento?", TEAL, PALE_BLUE),
        ("DISTRAJO", "¿Qué sonido, palabra o espera incomodó?", GOLD, "#FFF4D8"),
        ("INCOMODÓ", "Detenga la práctica y vuelva a una opción conocida.", TERRA, PALE_TERRA),
    ]
    y = 410
    for label, body, color, fill in options:
        round_rect(d, (58, y, 812, y + 132), fill, None, 24)
        d.text((84, y + 28), label, font=font(16, bold=True), fill=color)
        d.text((84, y + 67), body, font=font(18), fill=INK)
        y += 150
    round_rect(d, (58, 1033, 812, 1125), "#FFFFFF", LINE, 24, 2)
    d.text((82, 1064), "Registre solo lo útil: práctica · duración · respuesta · ajuste.", font=font(17, bold=True), fill=NAVY)
    return page


def page_10():
    page, d = base_page(10, "Cuidado y cierre")
    title(d, 110, "La seguridad", "va antes que la técnica")
    items = [
        "No realizar hiperventilación voluntaria.",
        "No hacer retenciones prolongadas ni competencias de aguantar.",
        "No exigir respiraciones máximas o profundas si incomodan.",
        "Detenerse ante mareo, hormigueo, dolor, dificultad respiratoria o aumento de ansiedad.",
        "Volver a la respiración espontánea y pedir apoyo cuando corresponda.",
    ]
    y = 305
    for i, item in enumerate(items):
        color = [TEAL, GREEN, TERRA, GOLD, NAVY][i]
        d.ellipse((66, y + 4, 112, y + 50), fill=color)
        d.line((78, y + 27, 89, y + 38), fill="white", width=4)
        d.line((89, y + 38, 103, y + 18), fill="white", width=4)
        text_block(d, (136, y), item, font(18), INK, 650, 8)
        y += 120
    round_rect(d, (58, 910, 812, 1046), PALE_BLUE, None, 26)
    d.text((82, 940), "Esta guía es educativa y no sustituye atención clínica.", font=font(18, bold=True), fill=NAVY)
    text_block(d, (82, 978), "No promete regular, diagnosticar ni tratar por sí sola. Cada práctica se adapta a la persona y al contexto.", font(17), INK, 660, 7)
    d.text((58, 1098), "RAÍCES PERÚ", font=font(20, black=True), fill=NAVY)
    d.text((58, 1133), "Familias y neurodiversidad, construyendo juntos.", font=font(14), fill=GREEN)
    d.text((812, 1110), "Investigación y autoría", font=font(11, bold=True), fill=MUTED, anchor="ra")
    d.text((812, 1134), "Patricia B. Albornoz", font=font(13, bold=True), fill=TERRA, anchor="ra")
    return page


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    pages = [page_01(), page_02(), page_03(), page_04(), page_05(), page_06(), page_07(), page_08(), page_09(), page_10()]
    for index, page in enumerate(pages, 1):
        page.convert("RGB").save(OUT / f"page-{index:02d}.webp", "WEBP", quality=88, method=6)
    pages[0].convert("RGB").resize((700, 989), Image.Resampling.LANCZOS).save(PORTADA, "WEBP", quality=90, method=6)
    print(f"Rendered {len(pages)} pages to {OUT}")
    print(f"Cover: {PORTADA}")


if __name__ == "__main__":
    main()
