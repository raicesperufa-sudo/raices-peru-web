from pathlib import Path
from math import cos, sin, pi

from PIL import Image, ImageDraw, ImageFont
import pypdfium2 as pdfium
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
WEB_ROOT = ASSETS / "manuales" / "lector"
COVER_ROOT = ASSETS / "manuales" / "portadas"
PDF_ROOT = Path(r"D:\LISSETH\RAICES\MANUALES\PRODUCCION EDITORIAL RAICES\01_MANUALES_FINALIZADOS")
QA_ROOT = Path(r"D:\LISSETH\RAICES\MANUALES\PRODUCCION EDITORIAL RAICES\_QA\coleccion_cuerpo_movimiento")

W, H = 870, 1230
BG = "#F7F2E6"
NAVY = "#173A5E"
TEAL = "#17697A"
TERRA = "#D77D58"
GREEN = "#76977E"
GOLD = "#E2B954"
PALE_BLUE = "#E7F1F2"
PALE_GREEN = "#EAF2EB"
PALE_TERRA = "#F7E5D8"
PALE_GOLD = "#FFF4D8"
INK = "#2F4148"
MUTED = "#607176"
LINE = "#C9D9D6"
WHITE = "#FFFFFF"

FONT_REG = Path("C:/Windows/Fonts/segoeui.ttf")
FONT_SEMI = Path("C:/Windows/Fonts/seguisb.ttf")
FONT_BLACK = Path("C:/Windows/Fonts/seguibl.ttf")


def font(size, bold=False, black=False):
    path = FONT_BLACK if black else FONT_SEMI if bold else FONT_REG
    return ImageFont.truetype(str(path), size)


def wrap(draw, text, fnt, width):
    lines = []
    for paragraph in text.split("\n"):
        words = paragraph.split()
        if not words:
            lines.append("")
            continue
        current = words[0]
        for word in words[1:]:
            trial = f"{current} {word}"
            if draw.textlength(trial, font=fnt) <= width:
                current = trial
            else:
                lines.append(current)
                current = word
        lines.append(current)
    return lines


def text_block(draw, xy, text, fnt, fill=INK, width=720, spacing=8):
    x, y = xy
    line_h = fnt.getbbox("Ag")[3] - fnt.getbbox("Ag")[1]
    for line in wrap(draw, text, fnt, width):
        draw.text((x, y), line, font=fnt, fill=fill)
        y += line_h + spacing
    return y


def round_rect(draw, box, fill, outline=None, radius=24, width=2):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def add_watermark(page):
    mark = Image.open(ASSETS / "isotipo-raices.webp").convert("RGBA")
    mark.thumbnail((470, 470), Image.Resampling.LANCZOS)
    alpha = mark.getchannel("A").point(lambda p: round(p * 0.045))
    mark.putalpha(alpha)
    page.alpha_composite(mark, (W - mark.width - 8, H - mark.height - 55))


def cover_crop(image, box):
    x, y, x2, y2 = box
    tw, th = x2 - x, y2 - y
    im = image.convert("RGB")
    scale = max(tw / im.width, th / im.height)
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.Resampling.LANCZOS)
    left = max(0, (im.width - tw) // 2)
    top = max(0, (im.height - th) // 2)
    return im.crop((left, top, left + tw, top + th))


def image_panel(page, source, box, radius=30):
    im = Image.open(ASSETS / source).convert("RGB")
    crop = cover_crop(im, box)
    mask = Image.new("L", crop.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, crop.width, crop.height), radius=radius, fill=255)
    page.paste(crop, (box[0], box[1]), mask)


def logo(page, xy=(58, 22), max_size=(250, 205)):
    im = Image.open(ASSETS / "logo-raices-completo.webp").convert("RGB")
    im = im.crop((210, 25, 1290, 930))
    im.thumbnail(max_size, Image.Resampling.LANCZOS)
    page.paste(im, xy)


def pill(draw, box, text, fill=PALE_BLUE, color=NAVY):
    round_rect(draw, box, fill, None, (box[3] - box[1]) // 2)
    draw.text(((box[0] + box[2]) / 2, (box[1] + box[3]) / 2), text.upper(), font=font(12, bold=True), fill=color, anchor="mm")


def base_page(number, manual):
    page = Image.new("RGBA", (W, H), BG)
    add_watermark(page)
    d = ImageDraw.Draw(page)
    d.text((58, 35), f"RAÍCES PERÚ  /  {manual['strap'].upper()}", font=font(13, bold=True), fill=NAVY)
    d.text((812, 35), manual["short"].upper(), font=font(12, bold=True), fill=manual["accent"], anchor="ra")
    d.line((58, 68, 812, 68), fill=LINE, width=2)
    d.text((58, 1184), "Guía orientativa. Adaptar siempre a la persona y al entorno.", font=font(11), fill=MUTED)
    d.text((812, 1184), f"{number:02d}", font=font(11, bold=True), fill=TEAL, anchor="ra")
    return page, d


def title(draw, first, accent, y=108, size=43):
    y = text_block(draw, (58, y), first, font(size, black=True), NAVY, 755, 4)
    return text_block(draw, (58, y + 2), accent, font(size, black=True), TERRA, 755, 4)


def step_card(draw, y, number, heading, body, accent):
    round_rect(draw, (58, y, 812, y + 106), WHITE, LINE, 22, 2)
    draw.ellipse((76, y + 25, 130, y + 79), fill=accent)
    draw.text((103, y + 52), str(number), font=font(18, bold=True), fill=WHITE, anchor="mm")
    draw.text((151, y + 18), heading.upper(), font=font(14, bold=True), fill=accent)
    text_block(draw, (151, y + 49), body, font(17), INK, 625, 6)


def level_cards(draw, levels, y=870):
    colors = [(TEAL, PALE_BLUE), (GREEN, PALE_GREEN), (TERRA, PALE_TERRA)]
    for i, (head, body) in enumerate(levels):
        x = 58 + i * 254
        accent, fill = colors[i]
        round_rect(draw, (x, y, x + 238, y + 164), fill, None, 22)
        draw.text((x + 20, y + 17), head.upper(), font=font(13, bold=True), fill=accent)
        text_block(draw, (x + 20, y + 50), body, font(15), INK, 198, 6)


def footer_note(draw, text, color=GOLD):
    round_rect(draw, (58, 1055, 812, 1135), PALE_GOLD, None, 22)
    draw.ellipse((78, 1075, 118, 1115), fill=color)
    draw.text((98, 1095), "!", font=font(19, bold=True), fill=WHITE, anchor="mm")
    text_block(draw, (138, 1072), text, font(14, bold=True), NAVY, 640, 5)


def draw_foot(draw, x, y, color, flip=False, scale=1.0):
    w, h = 58 * scale, 122 * scale
    draw.ellipse((x, y + 30 * scale, x + w, y + h), fill=color)
    direction = -1 if flip else 1
    toe_x = x + (w * 0.72 if not flip else w * 0.28)
    for i, r in enumerate([13, 11, 10, 9, 8]):
        tx = toe_x + direction * (i - 2) * 11 * scale
        ty = y + (18 + abs(i - 1) * 3) * scale
        draw.ellipse((tx - r * scale / 2, ty - r * scale / 2, tx + r * scale / 2, ty + r * scale / 2), fill=color)


def draw_hand(draw, x, y, color, scale=1.0, mirror=False):
    palm_w, palm_h = 110 * scale, 120 * scale
    draw.rounded_rectangle((x, y + 78 * scale, x + palm_w, y + 78 * scale + palm_h), radius=28, fill=color)
    widths = [22, 24, 24, 22]
    heights = [76, 105, 96, 75]
    offsets = [8, 34, 62, 88]
    for off, fw, fh in zip(offsets, widths, heights):
        px = x + (palm_w - off - fw if mirror else off)
        draw.rounded_rectangle((px, y + 86 * scale - fh, px + fw * scale, y + 90 * scale), radius=11, fill=color)
    thumb_x = x - 27 * scale if not mirror else x + palm_w - 5 * scale
    draw.rounded_rectangle((thumb_x, y + 102 * scale, thumb_x + 48 * scale, y + 133 * scale), radius=15, fill=color)


def draw_stick(draw, x, y, color, pose=0, scale=1.0):
    r = 24 * scale
    draw.ellipse((x-r, y-r, x+r, y+r), fill=color)
    draw.line((x, y+r, x, y+120*scale), fill=color, width=max(4, int(8*scale)))
    if pose % 2 == 0:
        draw.line((x, y+58*scale, x-62*scale, y+25*scale), fill=color, width=max(4, int(8*scale)))
        draw.line((x, y+58*scale, x+62*scale, y+25*scale), fill=color, width=max(4, int(8*scale)))
    else:
        draw.line((x, y+58*scale, x-56*scale, y+90*scale), fill=color, width=max(4, int(8*scale)))
        draw.line((x, y+58*scale, x+56*scale, y+90*scale), fill=color, width=max(4, int(8*scale)))
    draw.line((x, y+120*scale, x-42*scale, y+184*scale), fill=color, width=max(4, int(8*scale)))
    leg2 = (x+20*scale, y+190*scale) if pose == 2 else (x+42*scale, y+184*scale)
    draw.line((x, y+120*scale, *leg2), fill=color, width=max(4, int(8*scale)))


def visual(draw, kind, box, accent):
    x, y, x2, y2 = box
    round_rect(draw, box, WHITE, LINE, 26, 2)
    cx, cy = (x + x2) / 2, (y + y2) / 2
    colors = [TEAL, GREEN, TERRA, GOLD, NAVY]
    if kind == "feet_map":
        draw_foot(draw, cx - 100, y + 38, TEAL, False, .9)
        draw_foot(draw, cx + 30, y + 38, TERRA, True, .9)
        for px, py in [(cx-70, y+95), (cx-55, y+150), (cx+65, y+95), (cx+50, y+150)]:
            draw.ellipse((px-8, py-8, px+8, py+8), fill=GOLD)
    elif kind in {"steps", "memory_path", "circuit"}:
        pts = [(x+90, cy+35), (x+205, cy-50), (x+330, cy+35), (x+455, cy-50), (x+590, cy+35)]
        draw.line(pts, fill=LINE, width=8)
        for i, (px, py) in enumerate(pts):
            draw.ellipse((px-29, py-29, px+29, py+29), fill=colors[i])
            draw.text((px, py), str(i+1), font=font(17, bold=True), fill=WHITE, anchor="mm")
    elif kind == "one_two":
        draw_foot(draw, x+125, y+48, TEAL, False, .65)
        draw_foot(draw, x+310, y+48, GREEN, True, .65)
        draw_foot(draw, x+500, y+48, TERRA, False, .65)
        draw.text((x+153, y+185), "1", font=font(20, bold=True), fill=NAVY, anchor="mm")
        draw.text((x+340, y+185), "2", font=font(20, bold=True), fill=NAVY, anchor="mm")
        draw.text((x+530, y+185), "CAMBIO", font=font(15, bold=True), fill=NAVY, anchor="mm")
    elif kind == "textures":
        patterns = [PALE_BLUE, PALE_GREEN, PALE_TERRA, PALE_GOLD]
        for i, fill in enumerate(patterns):
            bx = x + 42 + i * 168
            round_rect(draw, (bx, y+52, bx+138, y2-42), fill, colors[i], 20, 3)
            for k in range(4):
                yy = y + 85 + k * 31
                draw.line((bx+23, yy, bx+115, yy), fill=colors[i], width=(k % 2 + 1) * 2)
    elif kind == "left_right":
        draw_foot(draw, x+160, y+45, TEAL, False, .8)
        draw_foot(draw, x+460, y+45, TERRA, True, .8)
        draw.text((x+185, y2-42), "IZQUIERDO", font=font(16, bold=True), fill=TEAL, anchor="mm")
        draw.text((x+485, y2-42), "DERECHO", font=font(16, bold=True), fill=TERRA, anchor="mm")
    elif kind == "line":
        draw.line((x+75, cy+55, x2-75, cy-35), fill=NAVY, width=10)
        for i in range(6):
            px = x+130+i*100
            py = cy+48-i*16
            draw.ellipse((px-15, py-25, px+15, py+25), fill=colors[i % 5])
    elif kind == "traffic":
        round_rect(draw, (cx-68, y+22, cx+68, y2-22), NAVY, None, 32)
        for i, c in enumerate([GREEN, GOLD, TERRA]):
            py = y+67+i*65
            draw.ellipse((cx-26, py-26, cx+26, py+26), fill=c)
    elif kind == "statue":
        for i, px in enumerate([x+150, x+365, x+580]):
            draw_stick(draw, px, y+55, colors[i], i, .62)
    elif kind == "gaze":
        draw.ellipse((cx-110, cy-60, cx+110, cy+60), fill=PALE_BLUE, outline=TEAL, width=5)
        draw.ellipse((cx-34, cy-34, cx+34, cy+34), fill=NAVY)
        draw.ellipse((cx-8, cy-8, cx+8, cy+8), fill=WHITE)
        for a in range(0, 360, 45):
            px = cx + cos(a*pi/180)*155
            py = cy + sin(a*pi/180)*85
            draw.ellipse((px-8, py-8, px+8, py+8), fill=GOLD)
    elif kind == "eight":
        pts=[]
        for i in range(121):
            t=2*pi*i/120
            pts.append((cx+230*sin(t), cy+85*sin(2*t)))
        draw.line(pts, fill=TEAL, width=12)
        draw.ellipse((cx-18, cy-18, cx+18, cy+18), fill=TERRA)
    elif kind in {"touch", "pincer", "tower", "trace", "build", "bilateral", "hands_circuit"}:
        if kind == "touch":
            draw_hand(draw, x+300, y+20, TERRA, .75)
            for i, c in enumerate(colors[:4]):
                round_rect(draw, (x+70+i*150, y2-80, x+185+i*150, y2-30), [PALE_BLUE, PALE_GREEN, PALE_TERRA, PALE_GOLD][i], c, 14, 3)
        elif kind == "pincer":
            for i, c in enumerate(colors):
                px=x+150+i*110
                draw.ellipse((px-24, cy+20, px+24, cy+68), fill=c)
            draw.line((x+90, y+40, x+250, cy+15), fill=NAVY, width=9)
            draw.line((x+90, y+75, x+250, cy+15), fill=NAVY, width=9)
        elif kind in {"tower", "build"}:
            blocks=[(cx-120,y2-85,TEAL),(cx,y2-85,GREEN),(cx-60,y2-145,TERRA),(cx-60,y2-205,GOLD)]
            if kind=="build": blocks += [(cx+60,y2-145,NAVY)]
            for bx,by,c in blocks:
                round_rect(draw,(bx-52,by,bx+52,by+50),c,None,8)
        elif kind == "trace":
            pts=[]
            for i in range(80):
                px=x+65+i*8
                py=cy+55*sin(i/8)
                pts.append((px,py))
            draw.line(pts, fill=LINE, width=18)
            draw.line(pts[:42], fill=TEAL, width=8)
            draw.ellipse((pts[41][0]-12,pts[41][1]-12,pts[41][0]+12,pts[41][1]+12),fill=TERRA)
        elif kind == "bilateral":
            draw_hand(draw, x+110, y+25, TEAL, .62)
            draw_hand(draw, x+500, y+25, TERRA, .62, True)
            draw.ellipse((cx-42,cy-42,cx+42,cy+42),fill=GOLD)
            draw.line((x+260,cy,x+455,cy),fill=LINE,width=8)
        else:
            for i, c in enumerate(colors):
                px=x+95+i*135
                draw.ellipse((px-28,cy-28,px+28,cy+28),fill=c)
                if i<4: draw.line((px+28,cy,px+107,cy),fill=LINE,width=7)
    elif kind in {"fingers", "thumb", "code", "orchestra", "hidden", "mirror", "finger_circuit"}:
        if kind == "fingers":
            draw_hand(draw, cx-55, y+14, TEAL, .92)
            for i in range(5):
                px=x+160+i*105
                draw.ellipse((px-19,y2-55,px+19,y2-17),fill=colors[i])
                draw.text((px,y2-36),str(i+1),font=font(13,bold=True),fill=WHITE,anchor="mm")
        elif kind == "thumb":
            draw_hand(draw, x+120, y+18, GREEN, .78)
            for i, c in enumerate(colors[:4]):
                px=x+390+i*70
                draw.ellipse((px-22,cy-22,px+22,cy+22),fill=c)
                if i<3: draw.line((px+22,cy,px+48,cy),fill=LINE,width=6)
        elif kind == "code":
            for i,c in enumerate(colors[:4]):
                bx=x+60+i*165
                round_rect(draw,(bx,y+42,bx+135,y2-42),[PALE_BLUE,PALE_GREEN,PALE_TERRA,PALE_GOLD][i],c,18,3)
                draw.text((bx+68,cy),["1-3","2-4","5-1","3-2"][i],font=font(21,bold=True),fill=c,anchor="mm")
        elif kind == "orchestra":
            for i,c in enumerate(colors):
                px=x+105+i*130
                py=cy+(i%2)*45-20
                draw.ellipse((px-25,py-25,px+25,py+25),fill=c)
                draw.line((px+25,py,px+25,py-70),fill=c,width=7)
        elif kind == "hidden":
            draw_hand(draw,cx-55,y+15,TERRA,.9)
            for i,c in enumerate([TEAL,GOLD,GREEN]):
                draw.ellipse((x+150+i*215, y2-62, x+195+i*215, y2-17), fill=c)
        elif kind == "mirror":
            draw_hand(draw,x+120,y+20,TEAL,.72)
            draw.line((cx,y+20,cx,y2-20),fill=LINE,width=6)
            draw_hand(draw,x+510,y+20,TERRA,.72,True)
        else:
            for i,c in enumerate(colors):
                px=x+100+i*130
                draw.ellipse((px-26,cy-26,px+26,cy+26),fill=c)
                draw.text((px,cy),str(i+1),font=font(14,bold=True),fill=WHITE,anchor="mm")


MANUALS = [
    {
        "slug": "pies-propiocepcion-infancia-ninez",
        "pdf": "13_Pies_y_propiocepcion_INFANCIA_NINEZ_RAICES_Peru.pdf",
        "cover": "manual-pies-propiocepcion-infancia-ninez.webp",
        "strap": "Cuerpo y movimiento",
        "short": "Pies y propiocepción",
        "title": ("PIES QUE", "ORIENTAN"),
        "subtitle": "Sentir el apoyo, seguir caminos y recordar secuencias",
        "audience": "GUÍA VISUAL · 6 A 12 AÑOS · FAMILIAS Y EDUCADORES",
        "accent": TEAL,
        "character": "personaje-monito-v2.webp",
        "cover_note": "No buscamos hacerlo perfecto. Buscamos notar, elegir y probar.",
        "intro": "Los pies informan sobre contacto, presión y posición. Esta guía combina esa exploración con orientación, equilibrio, memoria y cambios de regla.",
        "prepare": [("ESPACIO", "Suelo firme, seco y sin obstáculos."), ("CALZADO", "Con medias, calzado o descalzo según comodidad."), ("APOYO", "Pared, silla estable o mano adulta disponibles."), ("SALIDA", "Detenerse ante dolor, mareo o inseguridad.")],
        "activities": [
            ("El mapa de los pies", "Reconocer dónde apoyamos.", "feet_map", [("MIRA", "Señala talón, borde, centro y dedos."), ("PRUEBA", "Cambia suavemente el peso."), ("CUENTA", "Di qué zona notas más.")], [("NIVEL 1", "Sentado, señala zonas."), ("NIVEL 2", "De pie con apoyo."), ("NIVEL 3", "Sigue dos consignas.")], "La percepción cambia. No hay una respuesta única."),
            ("Caminata de puntos", "Seguir marcas de color.", "steps", [("PREPARA", "Coloca cinco marcas amplias."), ("RECORRE", "Pisa una marca por vez."), ("CAMBIA", "Sigue una secuencia de colores.")], [("NIVEL 1", "Un color."), ("NIVEL 2", "Dos o tres colores."), ("NIVEL 3", "Mira, tapa y recuerda.")], "Separe las marcas para que el paso sea cómodo."),
            ("Un pie, dos pies", "Responder a un código corporal.", "one_two", [("ACUERDA", "1 es un pie; 2 son dos pies."), ("ESCUCHA", "Prueba 1–2–2–1."), ("INVIERTE", "Cambia el significado del código.")], [("NIVEL 1", "Dos señales."), ("NIVEL 2", "Cuatro señales."), ("NIVEL 3", "Nueva regla.")], "Mantener dos apoyos también es una participación válida."),
            ("Camino de texturas", "Comparar sensaciones seguras.", "textures", [("ELIGE", "Tela, cartón, goma o toalla."), ("EXPLORA", "Toca con pie o mano."), ("DESCRIBE", "Suave, firme, frío o rugoso.")], [("NIVEL 1", "Mira y toca."), ("NIVEL 2", "Compara dos."), ("NIVEL 3", "Recuerda el orden.")], "Nunca obligue a tocar una textura desagradable."),
            ("Derecho e izquierdo", "Orientarse con señales laterales.", "left_right", [("MARCA", "Asigna un color a cada lado."), ("RESPONDE", "Toca o pisa el color pedido."), ("CAMBIA", "Invierte la regla cuando esté listo.")], [("NIVEL 1", "Con color visible."), ("NIVEL 2", "Solo palabra."), ("NIVEL 3", "Regla invertida.")], "Evite corregir con apuro; dé tiempo para orientarse."),
            ("Camino de memoria", "Recordar estaciones.", "memory_path", [("OBSERVA", "Mira una ruta de tres puntos."), ("RECORRE", "Hazla en el mismo orden."), ("TRANSFORMA", "Prueba el orden inverso.")], [("NIVEL 1", "Tres puntos."), ("NIVEL 2", "Cuatro o cinco."), ("NIVEL 3", "Cambia una estación.")], "Una pista o demostración es parte del aprendizaje."),
            ("Misión del jaguar", "Integrar apoyo, memoria y cambio.", "circuit", [("UNE", "Marca, textura y señal de parada."), ("RECUERDA", "Haz el recorrido acordado."), ("CREA", "Diseña una nueva misión.")], [("NIVEL 1", "Tres estaciones."), ("NIVEL 2", "Añade memoria."), ("NIVEL 3", "Cambia una regla.")], "La misión termina antes si aparece cansancio o inseguridad."),
        ],
        "observe": ["Qué apoyo eligió y qué evitó.", "Qué señal comprendió con menos ayuda.", "Cómo recordó el camino.", "Qué adaptación aumentó seguridad.", "Cuándo pidió pausa o cambio."],
    },
    {
        "slug": "equilibrio-seguro-infancia-ninez",
        "pdf": "14_Equilibrio_seguro_INFANCIA_NINEZ_RAICES_Peru.pdf",
        "cover": "manual-equilibrio-seguro-infancia-ninez.webp",
        "strap": "Cuerpo y movimiento",
        "short": "Equilibrio seguro",
        "title": ("EQUILIBRIO", "EN JUEGO"),
        "subtitle": "Estabilizar, orientar y moverse con seguridad",
        "audience": "GUÍA VISUAL · 6 A 12 AÑOS · FAMILIAS Y EDUCADORES",
        "accent": GREEN,
        "character": "personaje-cuerpoespin-v2.webp",
        "cover_note": "Apoyarse, bajar el nivel o detenerse también es decidir bien.",
        "intro": "El equilibrio integra información visual, vestibular y propioceptiva. Las propuestas avanzan lentamente y nunca usan giros rápidos ni inestabilidad artificial.",
        "prepare": [("PISO", "Firme, seco y despejado."), ("CERCA", "Una pared o apoyo estable al alcance."), ("RITMO", "Movimientos lentos y predecibles."), ("DETENER", "Ante mareo, náusea, dolor o desorientación.")],
        "activities": [
            ("La línea del explorador", "Caminar sobre una ruta visible.", "line", [("TRAZA", "Usa cinta ancha en el suelo."), ("AVANZA", "Mira al frente y da pasos cómodos."), ("CAMBIA", "Añade una señal de pausa.")], [("NIVEL 1", "Línea ancha."), ("NIVEL 2", "Curva suave."), ("NIVEL 3", "Secuencia y pausa.")], "El apoyo cercano debe estar disponible, no como premio."),
            ("Semáforo del equilibrio", "Cambiar velocidad y detenerse.", "traffic", [("VERDE", "Camina a ritmo cómodo."), ("AMARILLO", "Reduce el paso."), ("ROJO", "Detente con base estable.")], [("NIVEL 1", "Tres colores."), ("NIVEL 2", "Añade azul: apoyo."), ("NIVEL 3", "Cambia significados.")], "No se evalúa rapidez: importa responder con control."),
            ("Estatua cambia de base", "Explorar posturas estables.", "statue", [("ELIGE", "Pies separados o juntos."), ("SOSTÉN", "Mantén solo mientras sea cómodo."), ("CAMBIA", "Prueba brazos o base distinta.")], [("NIVEL 1", "Dos apoyos."), ("NIVEL 2", "Nueva postura."), ("NIVEL 3", "Recuerda tres.")], "Un pie con apoyo ligero es una variante completa."),
            ("Mirada del guardián", "Orientar mirada y cabeza con calma.", "gaze", [("FIJA", "Mira un punto estable."), ("MUEVE", "Gira la cabeza muy poco y despacio."), ("VUELVE", "Regresa al centro y descansa.")], [("NIVEL 1", "Solo mirada."), ("NIVEL 2", "Giro pequeño."), ("NIVEL 3", "Dos direcciones.")], "No es rehabilitación vestibular. Detenga ante cualquier síntoma."),
            ("Camino en ocho", "Cambiar dirección con control.", "eight", [("MIRA", "Observa la figura de ocho."), ("RECORRE", "Camina lento alrededor de las curvas."), ("ALTERNA", "Cambia el sentido al oír una señal.")], [("NIVEL 1", "Ocho amplio."), ("NIVEL 2", "Dos sentidos."), ("NIVEL 3", "Señal y memoria.")], "Amplíe la figura antes de pedir mayor precisión."),
            ("Ruta que recuerdo", "Unir equilibrio y memoria.", "memory_path", [("OBSERVA", "Mira tres estaciones."), ("RECORRE", "Sigue el orden."), ("REVISA", "Compara con la ruta inicial.")], [("NIVEL 1", "Tres estaciones."), ("NIVEL 2", "Cuatro."), ("NIVEL 3", "Orden inverso.")], "Si olvida, muestre una pista sin retirar la participación."),
            ("Circuito de orientación", "Integrar línea, postura y señales.", "circuit", [("ARMA", "Línea, estatua y ocho."), ("RECORRE", "Sigue la secuencia acordada."), ("AJUSTA", "Cambia solo una variable.")], [("NIVEL 1", "Tres estaciones."), ("NIVEL 2", "Añade señal."), ("NIVEL 3", "Crea su ruta.")], "No use ojos cerrados ni superficies inestables para dificultar."),
        ],
        "observe": ["Qué apoyo dio seguridad.", "Cómo reguló velocidad y pausa.", "Qué direcciones resultaron cómodas.", "Qué señal recordó.", "Si apareció algún síntoma."],
    },
    {
        "slug": "manos-motricidad-fina-infancia-ninez",
        "pdf": "15_Manos_tacto_motricidad_fina_INFANCIA_NINEZ_RAICES_Peru.pdf",
        "cover": "manual-manos-motricidad-fina-infancia-ninez.webp",
        "strap": "Cuerpo y movimiento",
        "short": "Manos y tacto",
        "title": ("MANOS QUE", "EXPLORAN"),
        "subtitle": "Tocar, manipular, construir y resolver",
        "audience": "GUÍA VISUAL · 6 A 12 AÑOS · FAMILIAS Y EDUCADORES",
        "accent": TERRA,
        "character": "personaje-quenal-v2.webp",
        "cover_note": "La precisión crece con práctica amable, no con apuro.",
        "intro": "Las manos reciben información táctil y propioceptiva y también permiten manipular con precisión. Aquí se combinan exploración, coordinación, memoria y construcción.",
        "prepare": [("TAMAÑO", "Objetos grandes si existe riesgo de llevarlos a la boca."), ("TEXTURA", "Permitir mirar antes de tocar."), ("FUERZA", "No forzar dedos, muñeca ni agarre."), ("RITMO", "Priorizar control antes que velocidad.")],
        "activities": [
            ("Explorador de las manos", "Comparar materiales y objetos.", "touch", [("MIRA", "Elige telas u objetos seguros."), ("TOCA", "Explora con una o ambas manos."), ("DESCRIBE", "Forma, textura, peso o temperatura.")], [("NIVEL 1", "Con la vista."), ("NIVEL 2", "Dentro de una bolsa."), ("NIVEL 3", "Recuerda el orden.")], "La persona puede usar una herramienta si evita una textura."),
            ("Pinza de precisión", "Trasladar y clasificar.", "pincer", [("TOMA", "Usa pinza grande o dedos."), ("TRASLADA", "Mueve objetos entre recipientes."), ("CLASIFICA", "Separa por color, forma o regla.")], [("NIVEL 1", "Objetos grandes."), ("NIVEL 2", "Dos categorías."), ("NIVEL 3", "Cambia la regla.")], "Detenga si la mano se tensa, duele o se fatiga."),
            ("La torre posible", "Planificar una construcción.", "tower", [("OBSERVA", "Mira un modelo de cuatro piezas."), ("COPIA", "Construye sin prisa."), ("MODIFICA", "Cambia una pieza y estabiliza.")], [("NIVEL 1", "Copia visible."), ("NIVEL 2", "Mira y tapa."), ("NIVEL 3", "Nueva condición.")], "Una torre que cae ofrece información; no es fracaso."),
            ("El mensaje secreto", "Seguir trazos y caminos.", "trace", [("ELIGE", "Usa lápiz grueso, dedo o puntero."), ("SIGUE", "Recorre la línea de inicio a meta."), ("RECUERDA", "Repite un tramo sin modelo.")], [("NIVEL 1", "Camino ancho."), ("NIVEL 2", "Curvas."), ("NIVEL 3", "Secuencia breve.")], "Aumente espacio si el trazo pequeño incomoda."),
            ("La mano que construye", "Crear y resolver un problema.", "build", [("MODELA", "Arma una estructura sencilla."), ("PRUEBA", "Comprueba si cumple su función."), ("AJUSTA", "Cambia una parte y vuelve a probar.")], [("NIVEL 1", "Modelo libre."), ("NIVEL 2", "Debe sostener algo."), ("NIVEL 3", "Material limitado.")], "Explique qué cambió antes de juzgar el resultado."),
            ("Una mano, dos, cambio", "Coordinar lados y reglas.", "bilateral", [("PASA", "Mueve una pelota de mano a mano."), ("COMBINA", "Una sostiene y otra coloca."), ("CAMBIA", "Invierte funciones al oír la señal.")], [("NIVEL 1", "Pase amplio."), ("NIVEL 2", "Dos acciones."), ("NIVEL 3", "Cambio de regla.")], "El objeto debe ser blando, grande y fácil de sujetar."),
            ("Circuito de manos", "Integrar tacto, precisión y creación.", "hands_circuit", [("EXPLORA", "Reconoce un material."), ("MANIPULA", "Traslada y construye."), ("CREA", "Inventa una estación nueva.")], [("NIVEL 1", "Tres estaciones."), ("NIVEL 2", "Añade memoria."), ("NIVEL 3", "Cambia la regla.")], "Reduzca cantidad antes de reducir el tamaño de los objetos."),
        ],
        "observe": ["Qué texturas aceptó o evitó.", "Qué agarre resultó cómodo.", "Cómo coordinó ambas manos.", "Qué estrategia usó al construir.", "Cuándo necesitó descanso."],
    },
    {
        "slug": "dedos-coordinacion-intramanual-infancia-ninez",
        "pdf": "16_Dedos_coordinacion_intramanual_INFANCIA_NINEZ_RAICES_Peru.pdf",
        "cover": "manual-dedos-coordinacion-intramanual-infancia-ninez.webp",
        "strap": "Cuerpo y movimiento",
        "short": "Dedos en acción",
        "title": ("DEDOS EN", "ACCIÓN"),
        "subtitle": "Diferenciar, coordinar, recordar y crear",
        "audience": "GUÍA VISUAL · 6 A 12 AÑOS · FAMILIAS Y EDUCADORES",
        "accent": GOLD,
        "character": "personaje-colibri-v2.webp",
        "cover_note": "Cada mano puede encontrar su propio ritmo y su propia forma.",
        "intro": "Mover dedos de manera diferenciada, oponer el pulgar y reorganizar objetos dentro de la mano son habilidades específicas que pueden practicarse con juego y elección.",
        "prepare": [("CALOR", "Abrir y cerrar manos sin dolor."), ("OBJETOS", "Grandes, limpios y no cortantes."), ("TIEMPO", "Series cortas con pausas."), ("SALIDA", "Detener ante dolor, hormigueo o fatiga.")],
        "activities": [
            ("Saludo de los dedos", "Mover un dedo por vez.", "fingers", [("NOMBRA", "Asigna del 1 al 5."), ("SALUDA", "Levanta el dedo indicado."), ("ORDENA", "Sigue una secuencia corta.")], [("NIVEL 1", "Una mano."), ("NIVEL 2", "Dos manos."), ("NIVEL 3", "Orden inverso.")], "Si un dedo acompaña a otro, sigue siendo exploración válida."),
            ("Escalera del pulgar", "Tocar cada yema con el pulgar.", "thumb", [("SUBE", "Índice, medio, anular y meñique."), ("BAJA", "Regresa en sentido contrario."), ("COMBINA", "Una mano sube y otra baja.")], [("NIVEL 1", "Una dirección."), ("NIVEL 2", "Ida y vuelta."), ("NIVEL 3", "Direcciones distintas.")], "No fuerce la apertura ni la oposición del pulgar."),
            ("Código secreto", "Traducir señales en movimientos.", "code", [("ACUERDA", "Cada tarjeta indica dos dedos."), ("IMITA", "Realiza el código visible."), ("RECUERDA", "Tapa y repite dos tarjetas.")], [("NIVEL 1", "Una tarjeta."), ("NIVEL 2", "Dos seguidas."), ("NIVEL 3", "Cambia el código.")], "Use dibujos o colores si los números confunden."),
            ("Orquesta de dedos", "Crear ritmo con movimientos.", "orchestra", [("ASIGNA", "Cada dedo tiene sonido o toque."), ("REPITE", "Imita un ritmo breve."), ("DIRIGE", "Crea una secuencia para otra persona.")], [("NIVEL 1", "Dos sonidos."), ("NIVEL 2", "Cuatro."), ("NIVEL 3", "Cambia el ritmo.")], "El silencio o un movimiento sin sonido también puede ser señal."),
            ("Objeto escondido", "Mover objetos dentro de una mano.", "hidden", [("COLOCA", "Usa dos objetos grandes."), ("REORGANIZA", "Muévelos con los dedos de esa mano."), ("ELIGE", "Entrega el color solicitado.")], [("NIVEL 1", "Dos objetos."), ("NIVEL 2", "Tres."), ("NIVEL 3", "Orden solicitado.")], "No use piezas pequeñas si existe riesgo de llevarlas a la boca."),
            ("Espejo de dedos", "Coordinar ambas manos.", "mirror", [("MODELO", "Una mano crea una postura."), ("ESPEJO", "La otra la imita."), ("CAMBIA", "Haz lo contrario a la señal.")], [("NIVEL 1", "Una postura."), ("NIVEL 2", "Tres seguidas."), ("NIVEL 3", "Opuesto.")], "Permita observar de cerca y repetir lentamente."),
            ("Circuito de dedos", "Integrar precisión, memoria y cambio.", "finger_circuit", [("UNE", "Saludo, pulgar, código y ritmo."), ("RECUERDA", "Sigue cuatro estaciones."), ("CREA", "Inventa una combinación propia.")], [("NIVEL 1", "Dos estaciones."), ("NIVEL 2", "Cuatro."), ("NIVEL 3", "Nueva regla.")], "Menos repeticiones con buena comodidad valen más que insistir."),
        ],
        "observe": ["Qué movimientos fueron independientes.", "Qué mano pidió más tiempo.", "Cómo recordó el código.", "Qué ritmo pudo crear.", "Qué adaptación evitó fatiga."],
    },
]


def cover_page(manual):
    page = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(page)
    add_watermark(page)
    logo(page)
    pill(d, (58, 258, 610, 306), manual["audience"])
    d.text((58, 365), manual["title"][0], font=font(51, black=True), fill=NAVY)
    d.text((58, 427), manual["title"][1], font=font(51, black=True), fill=TERRA)
    text_block(d, (58, 510), manual["subtitle"], font(24, bold=True), GREEN, 735, 8)
    image_panel(page, manual["character"], (42, 670, 828, 1118), 34)
    round_rect(d, (58, 610, 740, 704), "#FFFFFFE8", LINE, 22, 2)
    text_block(d, (82, 635), manual["cover_note"], font(17, bold=True), NAVY, 610, 7)
    d.text((58, 1151), "RAÍCES PERÚ", font=font(15, bold=True), fill=NAVY)
    d.text((812, 1151), "Investigación y autoría: Patricia B. Albornoz", font=font(11), fill=MUTED, anchor="ra")
    return page


def intro_page(manual):
    page, d = base_page(2, manual)
    y = title(d, "Antes de empezar,", "seguridad y elección")
    text_block(d, (58, y + 20), manual["intro"], font(18), INK, 750, 8)
    image_panel(page, manual["character"], (520, 270, 812, 480), 28)
    top = 420
    colors = [TEAL, GREEN, TERRA, GOLD]
    for i, (head, body) in enumerate(manual["prepare"]):
        yy = top + i * 132
        step_card(d, yy, i + 1, head, body, colors[i])
    round_rect(d, (58, 978, 812, 1125), PALE_BLUE, None, 24)
    d.text((82, 1003), "ACUERDO RAÍCES", font=font(15, bold=True), fill=TEAL)
    text_block(d, (82, 1038), "La persona puede mirar, pedir ayuda, cambiar la propuesta o detenerse. Adaptar no es hacer menos: es hacerla accesible.", font(17), INK, 670, 7)
    return page


def activity_page(manual, number, activity):
    name, goal, kind, steps, levels, note = activity
    page, d = base_page(number, manual)
    y = title(d, name, goal, size=39)
    visual(d, kind, (58, y + 20, 812, y + 280), manual["accent"])
    sy = y + 312
    colors = [TEAL, GREEN, TERRA]
    for i, (head, body) in enumerate(steps):
        step_card(d, sy + i * 116, i + 1, head, body, colors[i])
    level_cards(d, levels, 870)
    footer_note(d, note, manual["accent"])
    return page


def closing_page(manual):
    page, d = base_page(10, manual)
    y = title(d, "Observe el proceso,", "no la perfección")
    text_block(d, (58, y + 16), "Después de jugar, registre cambios pequeños y útiles. No convierta la guía en examen, diagnóstico ni competencia.", font(18), INK, 740, 8)
    colors = [TEAL, GREEN, TERRA, GOLD, NAVY]
    yy = 340
    for i, item in enumerate(manual["observe"]):
        d.ellipse((66, yy, 116, yy + 50), fill=colors[i])
        d.text((91, yy + 25), "✓", font=font(17, bold=True), fill=WHITE, anchor="mm")
        text_block(d, (140, yy + 5), item, font(18), INK, 635, 7)
        yy += 105
    round_rect(d, (58, 885, 812, 1062), PALE_GREEN, None, 26)
    d.text((82, 912), "ALCANCE Y EVIDENCIA", font=font(15, bold=True), fill=GREEN)
    text_block(d, (82, 948), "Estas propuestas practican tareas motrices y sensoriales observables. No demuestran que una zona del cuerpo active la inteligencia ni garantizan mejoras automáticas en lectura, atención o rendimiento escolar.", font(16), INK, 670, 7)
    d.text((58, 1100), "RAÍCES PERÚ", font=font(20, black=True), fill=NAVY)
    d.text((58, 1136), "La persona antes que el resultado.", font=font(14), fill=GREEN)
    d.text((812, 1110), "Investigación y autoría", font=font(11, bold=True), fill=MUTED, anchor="ra")
    d.text((812, 1136), "Patricia B. Albornoz", font=font(13, bold=True), fill=TERRA, anchor="ra")
    return page


def save_pdf(pages, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(path), pagesize=(W, H), pageCompression=1)
    temp = QA_ROOT / "_pdf_temp"
    temp.mkdir(parents=True, exist_ok=True)
    for idx, page in enumerate(pages, 1):
        png = temp / f"{path.stem}-{idx:02d}.png"
        page.convert("RGB").save(png, "PNG", optimize=True)
        c.drawImage(str(png), 0, 0, width=W, height=H)
        c.showPage()
    c.save()
    for png in temp.glob(f"{path.stem}-*.png"):
        png.unlink()


def make_contact_sheet(pages, path):
    thumb_w, thumb_h = 435, 615
    sheet = Image.new("RGB", (thumb_w * 5, thumb_h * 2), "#DDE5E2")
    for i, page in enumerate(pages):
        thumb = page.convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        sheet.paste(thumb, ((i % 5) * thumb_w, (i // 5) * thumb_h))
    path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(path, "JPEG", quality=90)


def render_pdf_for_qa(pdf_path, qa_dir):
    """Render the finished PDF, not the source canvas, so QA covers the deliverable."""
    qa_dir.mkdir(parents=True, exist_ok=True)
    document = pdfium.PdfDocument(str(pdf_path))
    rendered = []
    for index in range(len(document)):
        bitmap = document[index].render(scale=1.5)
        image = bitmap.to_pil().convert("RGB")
        output = qa_dir / f"page-{index + 1:02d}.png"
        image.save(output, "PNG", optimize=True)
        rendered.append(image)
    make_contact_sheet(rendered, qa_dir / "contacto-pdf-renderizado.jpg")
    return rendered


def render_manual(manual):
    pages = [cover_page(manual), intro_page(manual)]
    pages.extend(activity_page(manual, i + 3, item) for i, item in enumerate(manual["activities"]))
    pages.append(closing_page(manual))
    assert len(pages) == 10

    out = WEB_ROOT / manual["slug"]
    out.mkdir(parents=True, exist_ok=True)
    for index, page in enumerate(pages, 1):
        page.convert("RGB").save(out / f"page-{index:02d}.webp", "WEBP", quality=89, method=6)
    COVER_ROOT.mkdir(parents=True, exist_ok=True)
    pages[0].convert("RGB").resize((700, 989), Image.Resampling.LANCZOS).save(COVER_ROOT / manual["cover"], "WEBP", quality=91, method=6)
    pdf_path = PDF_ROOT / manual["pdf"]
    save_pdf(pages, pdf_path)
    make_contact_sheet(pages, QA_ROOT / f"{manual['slug']}-contacto.jpg")
    render_pdf_for_qa(pdf_path, QA_ROOT / manual["slug"])
    return pages


def main():
    for manual in MANUALS:
        render_manual(manual)
        print(f"Creado: {manual['pdf']}")
    print(f"PDF: {PDF_ROOT}")
    print(f"Web: {WEB_ROOT}")
    print(f"QA: {QA_ROOT}")


if __name__ == "__main__":
    main()
