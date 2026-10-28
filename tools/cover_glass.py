from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops
import sys

W, H = 1080, 1920
SRC = sys.argv[1] if len(sys.argv) > 1 else "fr_17.5.png"
FOCUS_Y = float(sys.argv[2]) if len(sys.argv) > 2 else 0.42
OUT = sys.argv[3] if len(sys.argv) > 3 else "cover.jpg"

def font(size, wght):
    f = ImageFont.truetype("Inter.ttf", size)
    try:
        f.set_variation_by_axes([size / 4 if size < 32 else 32, wght])
    except Exception:
        pass
    return f

frame = Image.open(SRC).convert("RGB")

# --- background: blurred frame + deep blue glass tint ---
bg = frame.resize((W, H)).filter(ImageFilter.GaussianBlur(60))
grad = Image.new("RGB", (W, H))
gd = ImageDraw.Draw(grad)
for y in range(H):
    p = y / H
    gd.line([(0, y), (W, y)], fill=(int(14 + 10 * p), int(38 + 14 * p), int(112 + 40 * p)))
bg = Image.blend(bg, grad, 0.82)
canvas = bg.convert("RGBA")

def rounded_mask(size, r):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], r, fill=255)
    return m

def glass(box, r, fill_alpha=38, border_alpha=110, border=3):
    x0, y0, x1, y1 = box
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle(box, r, fill=(255, 255, 255, fill_alpha), outline=(255, 255, 255, border_alpha), width=border)
    return layer

# --- photo card ---
cx0, cy0, cx1, cy1 = 64, 330, 1016, 1140
pad = 14
iw, ih = cx1 - cx0 - 2 * pad, cy1 - cy0 - 2 * pad
scale = max(iw / frame.width, ih / frame.height)
fr = frame.resize((int(frame.width * scale), int(frame.height * scale)))
top = int(max(0, min(fr.height - ih, FOCUS_Y * fr.height - ih / 2)))
left = (fr.width - iw) // 2
photo = fr.crop((left, top, left + iw, top + ih))
canvas = Image.alpha_composite(canvas, glass((cx0, cy0, cx1, cy1), 56, 30, 120, 3))
ph = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ph.paste(photo, (cx0 + pad, cy0 + pad), rounded_mask(photo.size, 44))
canvas = Image.alpha_composite(canvas, ph)

d = ImageDraw.Draw(canvas)

# --- pills ---
def pill(x, y, text, size=30, anchor_right=False):
    f = font(size, 600)
    tw = d.textlength(text, font=f)
    w, h = tw + 44, size + 26
    if anchor_right: x = x - w
    layer = glass((x, y, x + w, y + h), h // 2, 70, 140, 2)
    return layer, (x + 22, y + h / 2), f, text

for args in ((64, 236, "CumiAsin.id"), (1016, 236, "EP 1", 30, True)):
    layer, pos, f, t = pill(*args)
    canvas = Image.alpha_composite(canvas, layer)
    d = ImageDraw.Draw(canvas)
    d.text(pos, t, font=f, fill=(255, 255, 255), anchor="lm")

# --- text block ---
label = font(30, 600)
d.text((70, 1196), "SINETRON ASIN  ·  SERI 1: CUMI YANG TERHINA", font=label, fill=(206, 220, 255), anchor="lm")

YEL = (255, 214, 64)
lines = [[("Dihina karena bau,", "w")], [("padahal dicari chef", "w")], [("selama ", "w"), ("20 tahun.", "y")]]
size = 96
while True:
    hf = font(size, 800)
    widest = max(sum(d.textlength(s, font=hf) for s, _ in ln) for ln in lines)
    if widest <= 940: break
    size -= 2
y = 1240
for ln in lines:
    x = 66
    for s, c in ln:
        d.text((x, y), s, font=hf, fill=YEL if c == "y" else (255, 255, 255))
        x += d.textlength(s, font=hf)
    y += int(size * 1.12)

sub = font(32, 450)
d.text((70, y + 22), "Episode 1: Dihina di Pasar. Siapa chef misterius itu?", font=sub, fill=(222, 230, 250))
d.text((1012, 1650), "Tonton →", font=font(28, 500), fill=(222, 230, 250), anchor="rm")

canvas.convert("RGB").save(OUT, quality=92)
print("ok", size)
