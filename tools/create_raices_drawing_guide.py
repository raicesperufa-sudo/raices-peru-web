from math import cos, pi, sin
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "assets" / "descargas" / "raices-dibujo-geometrico-11-2026.pdf"
W, H = A4
INK = HexColor("#123b4a")
TEAL = HexColor("#07677b")
GOLD = HexColor("#efb928")
CORAL = HexColor("#e97f5d")
VIOLET = HexColor("#765488")
PALE = HexColor("#edf5f2")
GRID = HexColor("#d7e4e2")


def header(c, number, title):
    c.setFillColor(TEAL)
    c.rect(0, H - 60, W, 60, fill=1, stroke=0)
    c.setFillColor(HexColor("#ffffff"))
    c.setFont("Helvetica-Bold", 16)
    c.drawString(36, H - 37, "RAÍCES PERÚ")
    c.setFont("Helvetica", 10)
    c.drawRightString(W - 36, H - 35, f"Dibujo geométrico · {number:02d}")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(42, H - 95, title)
    c.setFont("Helvetica", 10)
    c.setFillColor(HexColor("#526e76"))
    c.drawString(42, 30, "Observa la estructura, prueba un recorrido y crea una versión propia. Puedes pausar.")


def grid(c, x, y, size, step=18):
    c.setStrokeColor(GRID)
    c.setLineWidth(.35)
    for i in range(int(size / step) + 1):
        c.line(x + i * step, y, x + i * step, y + size)
        c.line(x, y + i * step, x + size, y + i * step)
    c.setStrokeColor(HexColor("#9bb9b8"))
    c.rect(x, y, size, size, fill=0, stroke=1)


def poly(c, points, color=TEAL, width=2.2, close=False, dashed=False):
    c.setStrokeColor(color)
    c.setLineWidth(width)
    c.setDash(7, 5) if dashed else c.setDash()
    p = c.beginPath()
    p.moveTo(*points[0])
    for point in points[1:]:
        p.lineTo(*point)
    if close:
        p.close()
    c.drawPath(p, fill=0, stroke=1)
    c.setDash()


def radial(cx, cy, outer, inner, points):
    result = []
    for i in range(points * 2):
        angle = -pi / 2 + i * pi / points
        radius = outer if i % 2 == 0 else inner
        result.append((cx + cos(angle) * radius, cy + sin(angle) * radius))
    return result


def model(c, kind, x, y, size, guide=False):
    cx, cy = x + size / 2, y + size / 2
    color = HexColor("#9bb9b8") if guide else TEAL
    width = 1.4 if guide else 3
    dashed = guide
    if kind == 1:
        pts = []
        for i in range(17):
            a = i * pi / 2
            r = 10 + i * 8
            pts.append((cx + cos(a) * r, cy + sin(a) * r))
        poly(c, pts, color, width, dashed=dashed)
    elif kind in (2, 5, 10):
        count = {2: 5, 5: 4, 10: 8}[kind]
        poly(c, radial(cx, cy, size * .42, size * .18, count), color, width, True, dashed)
    elif kind == 3:
        s = size * .28
        poly(c, [(cx, cy-s),(cx-s,cy-s),(cx+s,cy+s),(cx+s,cy-s),(cx-s,cy+s),(cx,cy-s)], color, width, False, dashed)
    elif kind == 4:
        s = size * .32
        for q in range(4):
            angle = q * pi / 2
            pts = [(cx, cy)]
            for r in (s * .35, s * .7, s):
                pts.append((cx + cos(angle + r / s * .7) * r, cy + sin(angle + r / s * .7) * r))
            poly(c, pts, color, width, dashed=dashed)
    elif kind == 6:
        pts=[]
        for i in range(100):
            t = i / 99 * 2 * pi
            r = size * .18 * (1 - sin(t))
            pts.append((cx + r*cos(t), cy + r*sin(t)))
        poly(c, pts, color, width, dashed=dashed)
    elif kind == 7:
        for ring in (size*.16,size*.28,size*.4):
            poly(c, radial(cx,cy,ring,ring*.58,6),color,width,True,dashed)
    elif kind == 8:
        s=size*.24
        pts=[(cx-s,cy-s),(cx,cy-s),(cx,cy),(cx+s,cy),(cx+s,cy+s),(cx,cy+s),(cx,cy),(cx-s,cy)]
        poly(c,pts,color,width,False,dashed)
        poly(c,[(cx-s,cy-s),(cx+s,cy+s),(cx+s,cy-s),(cx-s,cy+s)],color,width,False,dashed)
    elif kind == 9:
        s=size*.34
        for offset in (-s*.35,s*.35):
            poly(c,[(cx-s,cy+offset),(cx-s*.35,cy-offset),(cx+s*.35,cy+offset),(cx+s,cy-offset)],color,width,False,dashed)


def cover(c):
    c.setFillColor(PALE)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(TEAL)
    c.rect(0, H * .58, W, H * .42, fill=1, stroke=0)
    c.setFillColor(HexColor("#ffffff"))
    c.setFont("Helvetica-Bold", 18)
    c.drawString(48, H - 72, "RAÍCES PERÚ")
    c.setFont("Helvetica-Bold", 38)
    c.drawString(48, H - 140, "Dibujo geométrico")
    c.drawString(48, H - 184, "con Queñal")
    c.setFont("Helvetica", 16)
    c.drawString(48, H - 222, "10 construcciones originales y progresivas")
    model(c, 7, 115, 130, 360, False)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(W / 2, 92, "Mirar · trazar · transformar")
    c.setFont("Helvetica", 11)
    c.drawCentredString(W / 2, 70, "No hay una única forma correcta de crear.")
    c.showPage()


def make():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("Dibujo geométrico con Queñal")
    c.setAuthor("RAÍCES PERÚ")
    c.setSubject("Guía original de dibujo geométrico progresivo")
    cover(c)
    titles = ["Espiral por giros", "Estrella de cinco puntas", "Cubo en recorrido", "Molino que cambia", "Rombo en equilibrio", "Corazón geométrico", "Flor de seis caminos", "Escalera con cruces", "Trama entrelazada", "Estrella con ocho direcciones"]
    for number, title in enumerate(titles, 1):
        header(c, number, title)
        c.setFillColor(PALE)
        c.roundRect(34, 75, W - 68, H - 190, 18, fill=1, stroke=0)
        guide_x, guide_y, guide_size = 62, 155, 205
        create_x, create_y, create_size = 325, 155, 205
        grid(c, guide_x, guide_y, guide_size)
        grid(c, create_x, create_y, create_size)
        model(c, number, guide_x, guide_y, guide_size, True)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(guide_x + guide_size / 2, 132, "Sigue la guía")
        c.drawCentredString(create_x + create_size / 2, 132, "Crea tu versión")
        c.setFillColor(CORAL)
        c.circle(W / 2, 260, 8, fill=1, stroke=0)
        c.setFillColor(GOLD)
        c.circle(W / 2, 300, 8, fill=1, stroke=0)
        c.showPage()
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    make()
