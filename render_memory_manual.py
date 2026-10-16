from pathlib import Path
from PIL import Image, ImageDraw

from render_mindfulness_manual import (
    ASSETS, W, H, BG, NAVY, TEAL, TERRA, GREEN, GOLD, PALE_BLUE,
    PALE_GREEN, PALE_TERRA, INK, MUTED, LINE, font, text_block,
    round_rect, pill, info_card, image_panel, add_watermark,
)


ROOT = Path(__file__).resolve().parent
OUT = ASSETS / "manuales" / "lector" / "memoria-aprendizaje-familias"
PORTADA = ASSETS / "manuales" / "portadas" / "manual-memoria-aprendizaje-familias.webp"


def base_page(number, section):
    page = Image.new("RGBA", (W, H), BG)
    add_watermark(page)
    d = ImageDraw.Draw(page)
    d.text((58, 35), "RAÍCES PERÚ  /  MEMORIA Y APRENDIZAJE", font=font(13, bold=True), fill=NAVY)
    d.text((812, 35), section.upper(), font=font(12, bold=True), fill=TERRA, anchor="ra")
    d.line((58, 68, 812, 68), fill=LINE, width=2)
    d.text((58, 1185), "Guía orientativa. Una actividad no define la memoria global.", font=font(11), fill=MUTED)
    d.text((812, 1185), f"{number:02d}", font=font(11, bold=True), fill=TEAL, anchor="ra")
    return page, d


def heading(draw, first, accent=None, top=110, size=44):
    y = text_block(draw, (58, top), first, font(size, black=True), NAVY, 750, 5)
    if accent:
        y = text_block(draw, (58, y + 2), accent, font(size, black=True), TERRA, 750, 5)
    return y


def page_01():
    page = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(page)
    logo = Image.open(ASSETS / "logo-raices-completo.webp").convert("RGB").crop((210, 25, 1290, 930))
    logo.thumbnail((285, 238), Image.Resampling.LANCZOS)
    page.paste(logo, (58, 30))
    pill(d, (58, 276), "Guía visual · familias y educadores", PALE_BLUE, NAVY, 418)
    d.text((58, 370), "MEMORIA", font=font(55, black=True), fill=NAVY)
    d.text((58, 434), "EN RAÍCES", font=font(55, black=True), fill=TERRA)
    d.text((58, 516), "RECORDAR CON ESTRATEGIA", font=font(25, bold=True), fill=GREEN)
    text_block(d, (58, 563), "Cómo codificar, recuperar, organizar y usar información sin convertir un resultado en una etiqueta.", font(21), INK, 720, 9)
    image_panel(page, "personaje-quenal-v2.webp", (42, 728, 828, 1112), 34)
    round_rect(d, (58, 650, 575, 746), "#FFFFFFE8", LINE, 22, 2)
    d.text((82, 675), "Recordar no es repetir sin comprender.", font=font(17, bold=True), fill=NAVY)
    d.text((82, 709), "La estrategia y el contexto también cuentan.", font=font(16), fill=INK)
    d.text((58, 1152), "RAÍCES PERÚ", font=font(15, bold=True), fill=NAVY)
    d.text((812, 1152), "Investigación y autoría: Patricia B. Albornoz", font=font(11), fill=MUTED, anchor="ra")
    return page


def page_02():
    page, d = base_page(2, "Comprender")
    heading(d, "La memoria no es", "una sola habilidad")
    text_block(d, (58, 245), "Una tarea de memoria puede pedir varias operaciones. Observar cuál aparece ayuda a elegir mejor el apoyo.", font(19), INK, 744, 9)
    cards = [
        ("CODIFICAR", "Dar forma a la información para que pueda entrar al sistema.", TEAL, PALE_BLUE),
        ("MANTENER", "Conservarla durante el tiempo que exige la tarea.", GREEN, PALE_GREEN),
        ("RECUPERAR", "Volver a encontrarla sin limitarse a reconocerla.", TERRA, PALE_TERRA),
        ("UTILIZAR", "Aplicarla para decidir, explicar o resolver algo.", GOLD, "#FFF4D8"),
    ]
    for i, item in enumerate(cards):
        row, col = divmod(i, 2)
        x, y = 58 + col * 382, 410 + row * 235
        info_card(d, (x, y, x + 356, y + 205), *item)
    round_rect(d, (58, 925, 812, 1100), PALE_BLUE, None, 28)
    d.text((84, 956), "NO CONCLUYA “TIENE MALA MEMORIA” POR UN ERROR.", font=font(17, bold=True), fill=NAVY)
    text_block(d, (84, 998), "Revise instrucciones, atención, familiaridad, ayuda, modalidad, cansancio y estrategia antes de interpretar.", font(17), INK, 660, 8)
    return page


def page_03():
    page, d = base_page(3, "Diseñar")
    heading(d, "Una actividad útil", "tiene un propósito claro")
    image_panel(page, "personaje-brujita-v2.webp", (58, 270, 812, 530), 28)
    chain = [
        ("1", "OBJETIVO", "¿Qué queremos recordar o usar?", TEAL),
        ("2", "PROCESO", "¿Codificar, mantener, recuperar u organizar?", GREEN),
        ("3", "TÉCNICA", "¿Recuperar, espaciar, asociar o explicar?", TERRA),
        ("4", "EVIDENCIA", "¿Qué observaremos para decidir el siguiente paso?", GOLD),
    ]
    y = 570
    for n, head, body, color in chain:
        d.ellipse((66, y, 118, y + 52), fill=color)
        d.text((92, y + 26), n, font=font(18, bold=True), fill="white", anchor="mm")
        d.text((142, y), head, font=font(15, bold=True), fill=color)
        d.text((142, y + 31), body, font=font(17), fill=INK)
        y += 116
    round_rect(d, (58, 1040, 812, 1128), PALE_TERRA, None, 23)
    d.text((82, 1070), "Una ficha atractiva no sustituye un objetivo cognitivo.", font=font(17, bold=True), fill=NAVY)
    return page


def page_04():
    page, d = base_page(4, "Técnica 1")
    heading(d, "Mira, tapa, recuerda", "y comprueba")
    text_block(d, (58, 245), "La recuperación activa pide intentar recordar antes de volver a mirar. El error se usa como información, no como castigo.", font(19), INK, 744, 9)
    steps = [
        ("MIRA", "Observe de 3 a 5 elementos y relaciónelos."),
        ("TAPA", "Retire la información cuando la persona esté lista."),
        ("RECUERDA", "Nombre, dibuje, señale o explique lo que conserva."),
        ("COMPRUEBA", "Compare y elija una pista para el próximo intento."),
    ]
    colors = [TEAL, GREEN, TERRA, GOLD]
    y = 405
    for i, (head, body) in enumerate(steps):
        round_rect(d, (58, y, 812, y + 128), "#FFFFFF", LINE, 24, 2)
        d.ellipse((82, y + 30, 150, y + 98), fill=colors[i])
        d.text((116, y + 64), str(i + 1), font=font(23, bold=True), fill="white", anchor="mm")
        d.text((177, y + 27), head, font=font(16, bold=True), fill=colors[i])
        d.text((177, y + 64), body, font=font(17), fill=INK)
        y += 145
    round_rect(d, (58, 1014, 812, 1115), PALE_BLUE, None, 24)
    d.text((82, 1044), "Puede responder hablando, señalando, moviendo o dibujando.", font=font(17, bold=True), fill=NAVY)
    d.text((82, 1078), "La modalidad no debe convertirse en el obstáculo.", font=font(16), fill=INK)
    return page


def page_05():
    page, d = base_page(5, "Técnica 2")
    heading(d, "Recordar en distintos", "momentos")
    image_panel(page, "personaje-cocodrilo-v2.webp", (58, 270, 812, 545), 28)
    moments = [
        ("HOY", "Recupera después de aprender.", TEAL),
        ("MAÑANA", "Vuelve a intentar antes de repasar.", GREEN),
        ("EN 3 DÍAS", "Cambia ejemplos o formato.", TERRA),
        ("EN 1 SEMANA", "Comprueba qué permanece y qué apoyo ayuda.", GOLD),
    ]
    y = 590
    for i, (when, body, color) in enumerate(moments):
        d.line((106, y + 44, 106, y + 112), fill=LINE, width=6)
        d.ellipse((78, y, 134, y + 56), fill=color)
        d.text((158, y), when, font=font(16, bold=True), fill=color)
        d.text((158, y + 35), body, font=font(17), fill=INK)
        y += 110
    round_rect(d, (58, 1035, 812, 1125), PALE_GREEN, None, 24)
    d.text((82, 1066), "Más sesiones no siempre es mejor: ajuste el intervalo a la persona.", font=font(17, bold=True), fill=NAVY)
    return page


def page_06():
    page, d = base_page(6, "Técnica 3")
    heading(d, "Organizar y asociar", "para encontrar el camino")
    text_block(d, (58, 245), "La información puede recuperarse mejor cuando tiene relaciones visibles. La estrategia debe tener sentido para quien la usa.", font(19), INK, 744, 9)
    cards = [
        ("AGRUPAR", "Junte por categoría: animales, lugares, acciones o colores.", TEAL, PALE_BLUE),
        ("CONECTAR", "Relacione lo nuevo con una experiencia conocida.", GREEN, PALE_GREEN),
        ("NARRAR", "Construya una historia breve con los elementos.", TERRA, PALE_TERRA),
        ("DIBUJAR", "Use un mapa o secuencia que muestre relaciones.", GOLD, "#FFF4D8"),
    ]
    y = 405
    for i, item in enumerate(cards):
        row, col = divmod(i, 2)
        x, yy = 58 + col * 382, y + row * 225
        info_card(d, (x, yy, x + 356, yy + 195), *item)
    # Visual network.
    centers = [(170, 970), (330, 925), (500, 980), (675, 925)]
    for a, b in zip(centers, centers[1:]):
        d.line((*a, *b), fill=LINE, width=8)
    for i, (x, yy) in enumerate(centers):
        d.ellipse((x - 34, yy - 34, x + 34, yy + 34), fill=[TEAL, GREEN, TERRA, GOLD][i])
    d.text((58, 1065), "La apariencia del mapa no demuestra comprensión: explique las relaciones.", font=font(16, bold=True), fill=NAVY)
    return page


def page_07():
    page, d = base_page(7, "Memoria de trabajo")
    heading(d, "Mantener información", "mientras hacemos algo")
    text_block(d, (58, 245), "La memoria de trabajo participa cuando seguimos pasos, actualizamos una regla o usamos información durante una tarea.", font(19), INK, 744, 9)
    examples = [
        ("DOS PASOS", "Toma la tarjeta azul y colócala debajo del círculo.", TEAL),
        ("ACTUALIZAR", "Recuerda la regla y cámbiala cuando aparezca una señal.", GREEN),
        ("ORDENAR", "Escucha una secuencia y reconstruye qué ocurrió primero.", TERRA),
        ("DIVIDIR", "Agrupa una instrucción larga en fragmentos pequeños.", GOLD),
    ]
    y = 395
    for i, (head, body, color) in enumerate(examples):
        round_rect(d, (58, y, 812, y + 132), "#FFFFFF", LINE, 24, 2)
        d.text((84, y + 25), head, font=font(16, bold=True), fill=color)
        text_block(d, (84, y + 60), body, font(18), INK, 670, 7)
        y += 150
    round_rect(d, (58, 1025, 812, 1124), PALE_BLUE, None, 24)
    d.text((82, 1055), "Progrese reduciendo ayuda antes de aumentar muchos pasos.", font=font(17, bold=True), fill=NAVY)
    d.text((82, 1088), "Ayuda no significa incapacidad.", font=font(16), fill=INK)
    return page


def page_08():
    page, d = base_page(8, "Técnica especializada")
    heading(d, "Palacio de la memoria", "cinco lugares, cinco ideas")
    text_block(d, (58, 245), "Elija una ruta conocida y coloque una imagen llamativa en cada lugar. Luego recorra la ruta en el mismo orden.", font(19), INK, 744, 9)
    places = [
        ("1", "ENTRADA", "pan", TEAL),
        ("2", "SALA", "luna", GREEN),
        ("3", "COCINA", "perro", TERRA),
        ("4", "CUARTO", "llave", GOLD),
        ("5", "JARDÍN", "pelota", NAVY),
    ]
    y = 405
    for n, place, word, color in places:
        d.ellipse((62, y, 116, y + 54), fill=color)
        d.text((89, y + 27), n, font=font(17, bold=True), fill="white", anchor="mm")
        round_rect(d, (138, y - 6, 812, y + 70), "#FFFFFF", LINE, 20, 2)
        d.text((166, y + 12), place, font=font(15, bold=True), fill=color)
        d.text((420, y + 12), word.upper(), font=font(18, bold=True), fill=NAVY)
        y += 105
    round_rect(d, (58, 965, 812, 1124), PALE_TERRA, None, 25)
    d.text((82, 995), "PRUEBA", font=font(16, bold=True), fill=TERRA)
    text_block(d, (82, 1032), "Tape las palabras, recorra mentalmente los cinco lugares y recupérelas. Después cambie palabras o ruta para explorar transferencia.", font(17), INK, 665, 8)
    return page


def page_09():
    page, d = base_page(9, "Progresión")
    heading(d, "Cambie una variable", "cada vez")
    variables = [
        ("COMPLEJIDAD", "más elementos, pasos o relaciones", TEAL),
        ("AYUDA", "de demostración a pista y luego independencia", GREEN),
        ("VARIABILIDAD", "nuevos ejemplos, formatos o reglas", TERRA),
        ("CONTEXTO", "otra habitación, material o situación", GOLD),
        ("AUTONOMÍA", "la persona elige y evalúa su estrategia", NAVY),
    ]
    y = 330
    for i, (head, body, color) in enumerate(variables, 1):
        d.ellipse((66, y, 128, y + 62), fill=color)
        d.text((97, y + 31), str(i), font=font(20, bold=True), fill="white", anchor="mm")
        d.text((156, y + 1), head, font=font(16, bold=True), fill=color)
        d.text((156, y + 34), body, font=font(17), fill=INK)
        y += 130
    round_rect(d, (58, 1000, 812, 1122), PALE_BLUE, None, 25)
    d.text((82, 1030), "AVANZAR NO SIEMPRE SIGNIFICA HACERLO MÁS DIFÍCIL.", font=font(17, bold=True), fill=NAVY)
    d.text((82, 1067), "También puede significar usar menos ayuda o elegir mejor una estrategia.", font=font(16), fill=INK)
    return page


def page_10():
    page, d = base_page(10, "Cuidado y cierre")
    heading(d, "Observe el proceso", "antes que la puntuación")
    items = [
        "Registre qué recordó, cómo lo hizo y qué ayuda necesitó.",
        "No penalice lentitud cuando la velocidad no es el objetivo.",
        "Evite vergüenza, comparaciones y competencias de memoria.",
        "Una mejora en la tarea no demuestra transferencia automática.",
        "Cambie la estrategia si cansa, frustra o no cumple su función.",
    ]
    y = 325
    for i, item in enumerate(items):
        color = [TEAL, GREEN, TERRA, GOLD, NAVY][i]
        d.ellipse((66, y + 3, 114, y + 51), fill=color)
        d.text((90, y + 27), "✓", font=font(19, bold=True), fill="white", anchor="mm")
        text_block(d, (140, y), item, font(18), INK, 640, 8)
        y += 118
    round_rect(d, (58, 925, 812, 1055), PALE_GREEN, None, 25)
    d.text((82, 954), "PRÁCTICA INTERACTIVA", font=font(16, bold=True), fill=GREEN)
    text_block(d, (82, 992), "En Mente en RAÍCES encontrará secuencias de luces y sonido, palacio de la memoria y retos graduados con guía de voz.", font(17), INK, 660, 8)
    d.text((58, 1102), "RAÍCES PERÚ", font=font(20, black=True), fill=NAVY)
    d.text((58, 1137), "La persona antes que el resultado.", font=font(14), fill=GREEN)
    d.text((812, 1113), "Investigación y autoría", font=font(11, bold=True), fill=MUTED, anchor="ra")
    d.text((812, 1137), "Patricia B. Albornoz", font=font(13, bold=True), fill=TERRA, anchor="ra")
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
