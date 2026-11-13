from pathlib import Path

from PIL import Image, ImageDraw

from render_mindfulness_manual import BG, INK, LINE, NAVY, PALE_BLUE, TEAL, font, round_rect, text_block


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
PAGES = ASSETS / "manuales" / "lector" / "retos-atencion-visual-6-9"
STORYBOARD = ASSETS / "manuales" / "escenas-3d" / "retos-atencion-visual-v1.png"
RULES_STORYBOARD = ASSETS / "manuales" / "escenas-3d" / "retos-atencion-reglas-v1.png"
PDF = Path(r"D:\LISSETH\RAICES\MANUALES\PRODUCCION EDITORIAL RAICES\01_MANUALES_FINALIZADOS\12_Retos_de_atencion_visual_INFANCIA_6a9_RAICES_Peru.pdf")


UPGRADES = {
    3: (0, "Encuentra los objetos azules", "Busca los objetos azules. ¿Cuáles encuentras?", "Nombra, señala o toca. Puedes comprobar por color antes de contar."),
    4: (1, "¿Cuál no pertenece?", "En cada grupo hay un objeto diferente. Señálalo y explica tu criterio.", "Puede haber más de una explicación si el criterio está claro."),
    5: (2, "¿Qué sigue?", "Mira los objetos y elige cuál continuaría la secuencia.", "Explica la regla con tus palabras antes de responder."),
    6: (3, "Sigue el camino", "Empieza en una semilla. ¿A qué planta llega cada camino?", "Recorre cada camino con el dedo sin escribir."),
    9: (4, "Ahora cambia la regla", "Primero encuentra las aves. Después ignóralas y busca los objetos verdes.", "Cambiar la regla también es parte del reto: detente, escucha y vuelve a mirar."),
    10: (5, "Busca cinco cambios", "Compara las dos escenas del jardín. ¿Qué cambió?", "Puedes describir un cambio aunque no encuentres los cinco."),
}


def panel(sheet, index):
    if index >= 4:
        rules = Image.open(RULES_STORYBOARD).convert("RGB")
        if index == 4:
            crop = rules.crop((8, 8, rules.width - 8, 535))
        else:
            crop = rules.crop((8, 550, rules.width - 8, rules.height - 8))
        crop.thumbnail((710, 700), Image.Resampling.LANCZOS)
        return crop
    col, row = index % 2, index // 2
    x0, x1 = ((8, 623), (640, 1255))[col]
    y0, y1 = ((8, 578), (591, 1238))[row]
    crop = sheet.crop((x0, y0, x1, y1))
    crop.thumbnail((710, 700), Image.Resampling.LANCZOS)
    return crop


def upgrade(page_number, sheet):
    path = PAGES / f"page-{page_number:02d}.webp"
    page = Image.open(path).convert("RGBA")
    draw = ImageDraw.Draw(page)
    draw.rectangle((45, 150, 825, 1105), fill=BG)
    _, title, prompt, support = UPGRADES[page_number]
    draw.rectangle((45, 92, 825, 150), fill=BG)
    draw.text((58, 108), title, font=font(35, black=True), fill=NAVY)
    round_rect(draw, (58, 158, 812, 224), PALE_BLUE, None, 24)
    text_block(draw, (84, 178), prompt, font(16, bold=True), NAVY, 700, 5)

    art = panel(sheet, UPGRADES[page_number][0]).convert("RGBA")
    x = (page.width - art.width) // 2
    y = 260
    mask = Image.new("L", art.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, art.width, art.height), radius=30, fill=255)
    page.paste(art, (x, y), mask)

    if page_number == 9:
        round_rect(draw, (88, 625, 418, 795), PALE_BLUE, None, 24)
        draw.text((118, 657), "REGLA 1", font=font(15, bold=True), fill=TEAL)
        text_block(draw, (118, 700), "Señala cada ave que encuentres.", font(18, bold=True), NAVY, 260, 6)
        round_rect(draw, (452, 625, 782, 795), "#E9F1E9", None, 24)
        draw.text((482, 657), "REGLA 2", font=font(15, bold=True), fill="#6F9278")
        text_block(draw, (482, 700), "Sin mover nada, señala ahora los objetos verdes.", font(18, bold=True), NAVY, 260, 6)
    elif page_number == 10:
        for index in range(5):
            x0 = 88 + (index % 3) * 235
            y0 = 625 + (index // 3) * 118
            round_rect(draw, (x0, y0, x0 + 210, y0 + 92), "#FFFFFF", LINE, 20, 2)
            draw.text((x0 + 24, y0 + 32), f"Cambio {index + 1}", font=font(16, bold=True), fill=NAVY)

    round_rect(draw, (88, 980, 782, 1068), "#FFFFFF", LINE, 24, 2)
    text_block(draw, (118, 1008), support, font(15, bold=True), INK, 640, 5)
    page.convert("RGB").save(path, "WEBP", quality=94, method=6)


def rebuild_pdf():
    images = [Image.open(PAGES / f"page-{number:02d}.webp").convert("RGB") for number in range(1, 13)]
    PDF.parent.mkdir(parents=True, exist_ok=True)
    images[0].save(PDF, "PDF", save_all=True, append_images=images[1:], resolution=150.0, quality=95)
    for image in images:
        image.close()


if __name__ == "__main__":
    storyboard = Image.open(STORYBOARD).convert("RGB")
    for number in UPGRADES:
        upgrade(number, storyboard)
    rebuild_pdf()
    print(f"Actualizadas {len(UPGRADES)} páginas y PDF: {PDF}")
