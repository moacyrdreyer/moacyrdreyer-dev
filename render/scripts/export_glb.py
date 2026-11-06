"""Export a web-ready GLB of the MacBook for the interactive (WebGL) version.

Usage: blender -b --factory-startup --python export_glb.py -- <scene.gltf> <out.glb>

Same fixes as the render: metres, Apple logo removed, real aluminium, and a "LidHinge"
node at the hinge so the lid can be animated. The screen mesh is named "Screen".
Geometry is Draco-compressed and textures are downscaled to 1024px WebP.
"""
import bpy, sys, math
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
SRC, OUT = argv[0], argv[1]
S = 0.01

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)
scene = bpy.context.scene
objs = {o.name: o for o in bpy.data.objects}
top = objs["Sketchfab_model"]
lid_grp = objs["VCQqxpxkUlzqcJI_62"]

top.scale = (S, S, S)
bpy.context.view_layer.update()

root = bpy.data.objects.new("Laptop", None); scene.collection.objects.link(root)
hinge = bpy.data.objects.new("LidHinge", None); scene.collection.objects.link(hinge)
hinge.location = (0, 11.46 * S, -0.28 * S)
hinge.parent = root
top.parent = root
bpy.context.view_layer.update()
mw = lid_grp.matrix_world.copy()
lid_grp.parent = hinge
lid_grp.matrix_world = mw

# remove the Apple logo
logo = objs["Object_125"]
bpy.data.objects.remove(logo, do_unlink=True)

screen = objs["Object_123"]
screen.name = "Screen"
screen.data.materials[0].name = "ScreenMat"

ALU = {"bsEIHfblEXNcUMs", "CRQixVLpahJzhJc", "iyDJFXmHelnMTbD", "lmWQsEjxpsebDlK", "LpqXZqhaGCeSzdu",
       "RyKTMHTpkkwQkvB", "wjAYtisbflXilXi", "gMtYExgrEUqPfln", "YYwBgwvcyZVOOAA"}
for m in bpy.data.materials:
    if m.name in ALU and m.use_nodes:
        p = next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
        for inp in ("Base Color", "Metallic", "Roughness"):
            for l in list(p.inputs[inp].links):
                m.node_tree.links.remove(l)
        p.inputs["Base Color"].default_value = (0.86, 0.87, 0.885, 1)
        p.inputs["Metallic"].default_value = 1.0
        p.inputs["Roughness"].default_value = 0.24 if m.name != "gMtYExgrEUqPfln" else 0.42

# tiny (uniform) metal/roughness maps make the exporter write a 1-channel image that WebP
# can't store: replace them with constants
for m in bpy.data.materials:
    if not m.use_nodes:
        continue
    p = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if not p:
        continue
    for inp in ("Metallic", "Roughness"):
        for link in list(p.inputs[inp].links):
            src = link.from_node
            tex = src.inputs[0].links[0].from_node if src.type == "SEPARATE_COLOR" and src.inputs[0].links else None
            uniform = tex is not None and tex.type == "TEX_IMAGE" and tex.image and (
                max(tex.image.size) <= 16 or tex.image.name.startswith("SLGkCohDDelqXBu"))
            if uniform:
                m.node_tree.links.remove(link)
                p.inputs[inp].default_value = 0.0 if inp == "Metallic" else 0.5

# WebP can't hold 1-channel images: copy those into RGB images and relink
for img in list(bpy.data.images):
    if img.channels == 1 and img.size[0] > 0:
        rgb = bpy.data.images.new(img.name + "_rgb", img.size[0], img.size[1], alpha=False)
        rgb.pixels.foreach_set(list(img.pixels))  # Blender buffers are always RGBA
        rgb.colorspace_settings.name = img.colorspace_settings.name
        for m in bpy.data.materials:
            if m.use_nodes:
                for n in m.node_tree.nodes:
                    if n.type == "TEX_IMAGE" and n.image == img:
                        n.image = rgb

for img in bpy.data.images:
    if img.size[0] > 1024 or img.size[1] > 1024:
        f = 1024 / max(img.size)
        img.scale(max(1, int(img.size[0] * f)), max(1, int(img.size[1] * f)))

# closed-lid angle (same search as the render) so the page knows how far to rotate
lid_meshes = [c for c in lid_grp.children_recursive if c.type == "MESH"]
base_meshes = [o for o in top.children_recursive if o.type == "MESH" and o not in lid_meshes]
def wverts(o):
    return [o.matrix_world @ v.co for v in o.data.vertices]
base_top = max(v.z for o in base_meshes for v in wverts(o) if abs(v.y) < 10 * S)
def clearance(a):
    hinge.rotation_euler = (a, 0, 0); bpy.context.view_layer.update()
    zs = [v.z for o in lid_meshes for v in wverts(o) if v.y < 9 * S]
    return min(zs) - base_top
lo, hi = math.radians(80), math.radians(130)
for _ in range(30):
    mid = (lo + hi) / 2
    if clearance(mid) > 0.0004: lo = mid
    else: hi = mid
hinge.rotation_euler = (0, 0, 0)
root["closedAngle"] = lo
print("closedAngle", lo)

bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    export_yup=True,
    export_extras=True,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_image_format="WEBP",
    export_cameras=False,
    export_lights=False,
)
print("EXPORTED", OUT)
