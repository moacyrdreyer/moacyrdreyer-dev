"""Composite RGBA frames over the obsidian page colour for review.
Usage: blender -b --factory-startup --python comp.py -- <in.webp> <out.png> [<in2> <out2> ...]"""
import bpy, sys
import numpy as np

args = sys.argv[sys.argv.index("--") + 1:]
bg = np.array([0x10, 0x11, 0x13], dtype=np.float32) / 255.0
bg_lin = np.where(bg <= 0.04045, bg / 12.92, ((bg + 0.055) / 1.055) ** 2.4)
for src, dst in zip(args[0::2], args[1::2]):
    img = bpy.data.images.load(src)
    img.colorspace_settings.name = "sRGB"
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32); img.pixels.foreach_get(px)
    px = px.reshape(h, w, 4)
    a = px[..., 3:4]
    px[..., :3] = px[..., :3] * a + bg_lin * (1 - a)  # straight alpha over
    px[..., 3] = 1
    out = bpy.data.images.new("o", w, h, alpha=False)
    out.pixels.foreach_set(px.ravel())
    out.filepath_raw = dst; out.file_format = "PNG"; out.save()
