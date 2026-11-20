"""Renderiza los cuatro videos guiados de Foco y movimiento RAICES.

Direccion visual: papel ilustrado RAICES. Una idea dominante por momento,
movimiento lento, texto breve y cierre de pausa. El resultado es determinista.
"""
from __future__ import annotations

import math
from pathlib import Path

import imageio.v2 as imageio
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "video"
CHARACTER = ROOT / "assets" / "personaje-quenal-v2.webp"
W = H = 640
FPS = 24
DURATION = 15
FRAMES = FPS * DURATION

INK = "#123b4a"
DEEP = "#075c70"
TEAL = "#148496"
PAPER = "#fbf7ef"
GOLD = "#edbd45"
CORAL = "#df805d"
GREEN = "#6f9c7b"
LAVENDER = "#9b83b8"
WHITE = "#ffffff"

FONT_REGULAR = "C:/Windows/Fonts/segoeui.ttf"
FONT_BOLD = "C:/Windows/Fonts/segoeuib.ttf"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size)


F_SMALL = font(18)
F_LABEL = font(18, True)
F_TITLE = font(36, True)
F_BIG = font(52, True)
F_NUMBER = font(27, True)


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def ease(value: float) -> float:
    value = clamp(value)
    return value * value * (3 - 2 * value)


def opacity_window(t: float, start: float, end: float, fade: float = 0.35) -> float:
    return min(ease((t - start) / fade), ease((end - t) / fade))


def fit_character() -> Image.Image:
    source = Image.open(CHARACTER).convert("RGBA")
    source.thumbnail((132, 150), Image.Resampling.LANCZOS)
    return source


QUENAL = fit_character()


def base_frame(title: str, subtitle: str, t: float) -> Image.Image:
    image = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((18, 18, W - 18, H - 18), 38, fill="#e7f3ef")
    draw.ellipse((420, -120, 720, 180), fill="#fff0c9")
    draw.ellipse((-100, 480, 180, 760), fill="#f5e8f2")
    draw.text((44, 42), "RAICES  ·  FAMILIA PLUS", font=F_LABEL, fill=DEEP)
    image.paste(QUENAL, (W - QUENAL.width - 40, 36), QUENAL)
    title_alpha = opacity_window(t, 0, 3.0, .4)
    if title_alpha > 0:
        overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.text((44, 105), title, font=F_TITLE, fill=(18, 59, 74, int(255 * title_alpha)))
        od.text((45, 153), subtitle, font=F_SMALL, fill=(83, 111, 119, int(255 * title_alpha)))
        image = Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB")
    return image


def draw_footer(draw: ImageDraw.ImageDraw, t: float, text: str = "Puedes pausar cuando quieras") -> None:
    draw.rounded_rectangle((52, 568, 588, 600), 16, fill=WHITE)
    width = 496 * clamp(t / DURATION)
    draw.rounded_rectangle((72, 579, 72 + width, 589), 5, fill=GOLD)
    draw.text((72, 615), text, font=F_SMALL, fill=INK, anchor="ls")


def frame_numbers(t: float) -> Image.Image:
    image = base_frame("Numeros en camino", "Encuentra la secuencia en orden", t)
    draw = ImageDraw.Draw(image)
    positions = [(130, 310), (330, 271), (485, 340), (235, 405), (430, 445),
                 (115, 490), (330, 505), (525, 490), (205, 250), (510, 245)]
    current = min(10, max(1, int((t - 2.5) / .9) + 1))
    for number, (x, y) in enumerate(positions, 1):
        found = t >= 2.5 + number * .9
        active = number == current and 2.5 <= t < 12.3
        radius = 35 + (4 * math.sin((t * 5)) if active else 0)
        fill = "#dff1e5" if found else WHITE
        outline = GOLD if active else (GREEN if found else "#8ab9b1")
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=fill, outline=outline, width=5 if active else 3)
        draw.text((x, y), str(number), font=F_NUMBER, fill=INK, anchor="mm")
    if t >= 12.3:
        draw.rounded_rectangle((120, 280, 520, 410), 28, fill=WHITE, outline="#b9d5cf", width=3)
        draw.text((320, 320), "Ruta completada", font=F_TITLE, fill=DEEP, anchor="mm")
        draw.text((320, 370), "Mira otra vez o descansa", font=F_SMALL, fill=INK, anchor="mm")
    else:
        draw.text((60, 185), f"Busca el {current}", font=F_TITLE, fill=DEEP)
    draw_footer(draw, t)
    return image


def frame_firefly(t: float) -> Image.Image:
    image = base_frame("La luciernaga de Quenal", "Sigue una luz con una mirada comoda", t)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((56, 218, 584, 535), 30, fill=WHITE, outline="#c5dcd7", width=3)
    points = []
    for step in range(101):
        angle = (step / 100) * math.tau
        points.append((320 + 205 * math.sin(angle), 370 + 95 * math.sin(angle * 2)))
    draw.line(points, fill="#d8cbe8", width=5, joint="curve")
    angle = clamp((t - 2.5) / 9.5) * math.tau
    x = 320 + 205 * math.sin(angle)
    y = 370 + 95 * math.sin(angle * 2)
    pulse = 7 + 3 * math.sin(t * 4)
    draw.ellipse((x - 28 - pulse, y - 28 - pulse, x + 28 + pulse, y + 28 + pulse), fill="#fff3c8")
    draw.ellipse((x - 22, y - 22, x + 22, y + 22), fill=GOLD, outline=CORAL, width=4)
    if t >= 12.3:
        draw.rounded_rectangle((125, 315, 515, 415), 24, fill="#e7f3ef")
        draw.text((320, 345), "Recorrido listo", font=F_TITLE, fill=DEEP, anchor="mm")
        draw.text((320, 390), "Parpadea y descansa", font=F_SMALL, fill=INK, anchor="mm")
    draw_footer(draw, t, "Mueve tambien la cabeza si lo necesitas")
    return image


def frame_hands(t: float) -> Image.Image:
    image = base_frame("Dos manos, un ritmo", "Coordina los dos lados sin apurarte", t)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((58, 235, 582, 500), 30, fill=WHITE, outline="#c7ddd8", width=3)
    phase = 0 if t < 5.5 else 1 if t < 9.5 else 2
    labels = ["Juntas", "Alterna", "Pausa"]
    draw.text((320, 265), labels[phase], font=F_TITLE, fill=DEEP, anchor="mm")
    if phase == 0:
        offset = 28 * math.sin((t - 2.5) * 2.2)
        left_y = right_y = 390 + offset
    elif phase == 1:
        offset = 34 * math.sin((t - 5.5) * 2.4)
        left_y, right_y = 390 + offset, 390 - offset
    else:
        left_y = right_y = 390
    for x, y, color, label in [(205, left_y, CORAL, "IZQ."), (435, right_y, TEAL, "DER.")]:
        draw.rounded_rectangle((x - 76, y - 55, x + 76, y + 55), 26, fill=color)
        draw.text((x, y), label, font=F_LABEL, fill=WHITE, anchor="mm")
    if phase < 2:
        direction = -1 if math.sin(t * 2.3) < 0 else 1
        draw.line((320, 355, 320, 425), fill=GOLD, width=8)
        draw.polygon([(320, 335 if direction < 0 else 445), (306, 360 if direction < 0 else 420), (334, 360 if direction < 0 else 420)], fill=GOLD)
    else:
        draw.text((320, 455), "Suelta y nota como te sientes", font=F_SMALL, fill=INK, anchor="mm")
    draw_footer(draw, t, "Puedes usar solo las manos")
    return image


def frame_rhythm(t: float) -> Image.Image:
    image = base_frame("Palmas companeras", "Mira la ruta y despues tocala", t)
    draw = ImageDraw.Draw(image)
    sequence = [0, 1, 0, 0, 1, 1]
    draw.rounded_rectangle((58, 235, 582, 500), 30, fill=WHITE, outline="#c7ddd8", width=3)
    cue = -1 if t < 2.5 else min(len(sequence) - 1, int((t - 2.5) / 1.35))
    for index, (x, color, label) in enumerate([(205, CORAL, "IZQUIERDA"), (435, TEAL, "DERECHA")]):
        active = cue >= 0 and sequence[cue] == index and t < 11.2
        pad = 12 if active else 0
        draw.rounded_rectangle((x - 95 - pad, 325 - pad, x + 95 + pad, 435 + pad), 28, fill=color, outline=GOLD if active else color, width=8 if active else 2)
        draw.text((x, 380), label, font=F_LABEL, fill=WHITE, anchor="mm")
    for i, side in enumerate(sequence):
        x = 205 + i * 46
        fill = (CORAL if side == 0 else TEAL) if i <= cue else "#d7e4e1"
        draw.ellipse((x, 470, x + 22, 492), fill=fill)
    if t >= 11.2:
        draw.rounded_rectangle((120, 290, 520, 455), 28, fill="#e7f3ef")
        draw.text((320, 335), "Ahora prueba tu", font=F_TITLE, fill=DEEP, anchor="mm")
        draw.text((320, 390), "Repite la ruta a tu ritmo", font=F_SMALL, fill=INK, anchor="mm")
    draw_footer(draw, t)
    return image


VIDEOS = {
    "numeros-en-camino-raices.mp4": frame_numbers,
    "luciernaga-quenal-raices.mp4": frame_firefly,
    "dos-manos-un-ritmo-raices.mp4": frame_hands,
    "palmas-companeras-raices.mp4": frame_rhythm,
}


def render() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, frame_function in VIDEOS.items():
        destination = OUT / filename
        print(f"Renderizando {filename}...", flush=True)
        with imageio.get_writer(
            destination,
            fps=FPS,
            codec="libx264",
            pixelformat="yuv420p",
            quality=8,
            ffmpeg_params=["-movflags", "+faststart"],
        ) as writer:
            for frame_index in range(FRAMES):
                timestamp = frame_index / FPS
                writer.append_data(np.asarray(frame_function(timestamp)))
        print(f"Listo: {destination.stat().st_size} bytes", flush=True)


if __name__ == "__main__":
    render()
