"""Render a scroll-scrub MacBook sequence.

Usage: blender -b --factory-startup --python render_seq.py -- <gltf> <hdri> <outdir> <frames> <width> <height> <samples> [only_corners | only=1,5,9]
Writes <outdir>/f_0001.webp ... and <outdir>/screen.json (screen corners per frame, in 0..1 image coords, origin top-left).
Env: HDRI_STRENGTH (default 0.15), GRAD_W (default 6).
"""
import bpy, sys, json, math, os
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:]
GLTF, HDRI, OUT = argv[0], argv[1], argv[2]
FRAMES, W, H, SAMPLES = int(argv[3]), int(argv[4]), int(argv[5]), int(argv[6])
ONLY_CORNERS = len(argv) > 7 and argv[7] == "only_corners"
ONLY = set(int(x) for x in argv[7][5:].split(",")) if len(argv) > 7 and argv[7].startswith("only=") else None
S = 0.01  # model is in cm -> metres
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLTF)
scene = bpy.context.scene

objs = {o.name: o for o in bpy.data.objects}
top = objs["Sketchfab_model"]
lid_grp = objs["VCQqxpxkUlzqcJI_62"]
screen = objs["Object_123"]
logo = objs["Object_125"]

# --- scale to metres and bake transforms into a clean rig -------------------
top.scale = (S, S, S)
bpy.context.view_layer.update()

rig = bpy.data.objects.new("Rig", None); scene.collection.objects.link(rig)
hinge = Vector((0, 11.46 * S, -0.28 * S))
pivot = bpy.data.objects.new("LidPivot", None); scene.collection.objects.link(pivot)
pivot.location = hinge
pivot.parent = rig
top.parent = rig
bpy.context.view_layer.update()
mw = lid_grp.matrix_world.copy()
lid_grp.parent = pivot
lid_grp.matrix_world = mw
bpy.context.view_layer.update()

# hide the Apple logo on the back of the lid
logo.hide_render = True; logo.hide_viewport = True

lid_meshes = [c for c in lid_grp.children_recursive if c.type == "MESH"]
base_meshes = [o for o in top.children_recursive if o.type == "MESH" and o not in lid_meshes]

def world_verts(o):
    m = o.matrix_world
    return [m @ v.co for v in o.data.vertices]

base_top = max(v.z for o in base_meshes for v in world_verts(o) if abs(v.y) < 10 * S)

def lid_clearance(angle):
    pivot.rotation_euler = (angle, 0, 0)
    bpy.context.view_layer.update()
    zs = [v.z for o in lid_meshes for v in world_verts(o) if v.y < 9 * S]
    return (min(zs) if zs else 1.0) - base_top

lo, hi = math.radians(80), math.radians(130)
for _ in range(30):
    mid = (lo + hi) / 2
    if lid_clearance(mid) > 0.0004:
        lo = mid
    else:
        hi = mid
CLOSED = lo
print("closed angle deg", math.degrees(CLOSED), "base_top", base_top)
pivot.rotation_euler = (0, 0, 0)
bpy.context.view_layer.update()

# --- aluminium: real metal (the export came through as dielectric) ------------
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
        if "Anisotropic" in p.inputs:
            p.inputs["Anisotropic"].default_value = 0.25

# --- screen: dark glossy glass so the live HTML can be blended on top ------
glass = bpy.data.materials.new("ScreenGlass"); glass.use_nodes = True
b = glass.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value = (0.004, 0.004, 0.005, 1)
b.inputs["Roughness"].default_value = 0.14
b.inputs["Metallic"].default_value = 0.0
b.inputs["Specular IOR Level"].default_value = 0.07
screen.data.materials.clear(); screen.data.materials.append(glass)

# screen corners in lid space: extremes along X and along the lid's up direction
sv = [v.co.copy() for v in screen.data.vertices]
sm = screen.matrix_world
wv = [sm @ v for v in sv]
up = Vector((0, 7.603, 20.915)).normalized()
us = [v.x for v in wv]; vs = [v.dot(up) for v in wv]
umin, umax, vmin, vmax = min(us), max(us), min(vs), max(vs)
# point on plane: average depth along normal
normal = Vector((1, 0, 0)).cross(up).normalized()  # points toward the viewer side (-y,+z)
if normal.y > 0: normal = -normal
d = sum(v.dot(normal) for v in wv) / len(wv)
def plane_pt(u, v):
    return Vector((u, 0, 0)) + up * v + normal * (d + 0.0002)
corner_world = [plane_pt(umin, vmax), plane_pt(umax, vmax), plane_pt(umax, vmin), plane_pt(umin, vmin)]  # TL TR BR BL
corner_empties = []
for i, p in enumerate(corner_world):
    e = bpy.data.objects.new(f"Corner{i}", None); scene.collection.objects.link(e)
    e.location = p
    e.parent = pivot
    e.matrix_parent_inverse = pivot.matrix_world.inverted()
    corner_empties.append(e)
screen_center = sum(corner_world, Vector()) / 4
screen_w = umax - umin
print("screen center", screen_center, "width", screen_w, "normal", normal)

# --- shadow catcher ground ----------------------------------------------------
bpy.ops.mesh.primitive_plane_add(size=4, location=(0, 0, -1.075 * S))
ground = bpy.context.object; ground.is_shadow_catcher = True

# --- lighting: HDRI + softboxes -----------------------------------------------
world = bpy.data.worlds.new("W"); scene.world = world; world.use_nodes = True
nt = world.node_tree; nt.nodes.clear()
env = nt.nodes.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(HDRI)
mapn = nt.nodes.new("ShaderNodeMapping"); tc = nt.nodes.new("ShaderNodeTexCoord")
mapn.inputs["Rotation"].default_value = (0, 0, math.radians(110))
bg = nt.nodes.new("ShaderNodeBackground"); bg.inputs["Strength"].default_value = float(os.environ.get("HDRI_STRENGTH", "0.15"))
outn = nt.nodes.new("ShaderNodeOutputWorld")
nt.links.new(tc.outputs["Generated"], mapn.inputs["Vector"]); nt.links.new(mapn.outputs["Vector"], env.inputs["Vector"])
nt.links.new(env.outputs["Color"], bg.inputs["Color"]); nt.links.new(bg.outputs["Background"], outn.inputs["Surface"])

def area(name, loc, size, power, size_y=None, target=(0, 0.04, 0.06)):
    ld = bpy.data.lights.new(name, "AREA"); ld.energy = power
    if size_y: ld.shape = "RECTANGLE"; ld.size = size; ld.size_y = size_y
    else: ld.size = size
    o = bpy.data.objects.new(name, ld); scene.collection.objects.link(o); o.location = loc
    direction = Vector(target) - Vector(loc)
    o.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return o

area("Key", (-0.8, -0.55, 0.7), 0.6, 30)
area("Fill", (0.85, -0.45, 0.3), 0.5, 6)
area("Rim", (0.75, 0.55, 0.1), 0.9, 30, size_y=0.06, target=(0, 0.05, 0.02))
area("RimL", (-0.75, 0.55, 0.08), 0.9, 18, size_y=0.06, target=(0, 0.05, 0.02))
# big, dim gradient panel at the mirror angle: gives the lid/palmrest a soft sweep instead of a blown highlight
grad = area("Grad", (0.0, 1.1, 0.75), 1.6, float(os.environ.get("GRAD_W", "6")), size_y=0.5)

# --- camera -------------------------------------------------------------------
cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 50; cam_data.sensor_width = 36
cam = bpy.data.objects.new("Cam", cam_data); scene.collection.objects.link(cam); scene.camera = cam
target = bpy.data.objects.new("Target", None); scene.collection.objects.link(target)
con = cam.constraints.new("TRACK_TO"); con.target = target; con.track_axis = "TRACK_NEGATIVE_Z"; con.up_axis = "UP_Y"

scene.frame_start, scene.frame_end = 1, FRAMES
def kf(frac):
    return 1 + round(frac * (FRAMES - 1))

def sph(tgt, dist, yaw_deg, elev_deg):
    yaw, el = math.radians(yaw_deg), math.radians(elev_deg)
    return Vector(tgt) + Vector((math.sin(yaw) * math.cos(el), -math.cos(yaw) * math.cos(el), math.sin(el))) * dist

mid_tgt = (0, 0.03, 0.07)
# final: camera on the screen normal, close enough that the screen fills the 16:10 frame
fill_dist = (screen_w / 2) / math.tan(math.atan(18 / 50)) * 0.985
final_cam = screen_center + normal * fill_dist

keys = [
    # frac, cam_pos, target, rig_yaw_deg, lid (0=open,1=closed), shift_x
    (0.00, sph(mid_tgt, 1.05, -8, 30), mid_tgt, -32, 1.0, -0.16),
    (0.14, sph(mid_tgt, 1.02, -6, 27), mid_tgt, -30, 1.0, -0.16),
    (0.45, sph(mid_tgt, 0.95, -2, 18), mid_tgt, -16, 0.0, -0.10),
    (0.70, sph((0, 0.05, 0.09), 0.86, 0, 12), (0, 0.05, 0.09), 0, 0.0, 0.0),
    (1.00, final_cam, tuple(screen_center), 0, 0.0, 0.0),
]
for frac, cpos, tpos, yaw, lid, shift in keys:
    f = kf(frac)
    cam.location = cpos; cam.keyframe_insert("location", frame=f)
    target.location = tpos; target.keyframe_insert("location", frame=f)
    rig.rotation_euler = (0, 0, math.radians(yaw)); rig.keyframe_insert("rotation_euler", frame=f)
    pivot.rotation_euler = (CLOSED * lid, 0, 0); pivot.keyframe_insert("rotation_euler", frame=f)
    cam_data.shift_x = shift; cam_data.keyframe_insert("shift_x", frame=f)

def all_fcurves(idblock):
    ad = idblock.animation_data
    if not ad or not ad.action: return []
    act = ad.action
    if hasattr(act, "fcurves"):
        return list(act.fcurves)
    out = []  # layered actions (Blender 4.4+)
    for layer in act.layers:
        for strip in layer.strips:
            for cb in strip.channelbags:
                out += list(cb.fcurves)
    return out

for idb in (cam, target, rig, pivot, cam_data):
    for fc in all_fcurves(idb):
        for k in fc.keyframe_points:
            k.interpolation = "BEZIER"; k.easing = "AUTO"
            k.handle_left_type = k.handle_right_type = "AUTO_CLAMPED"

# --- render settings ----------------------------------------------------------
scene.render.engine = "CYCLES"
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.cycles.use_adaptive_sampling = True
scene.render.film_transparent = True
scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = W, H, 100
scene.view_settings.view_transform = "AgX"
scene.view_settings.exposure = -0.6
try:
    scene.view_settings.look = "AgX - Medium High Contrast"
except TypeError:
    pass
scene.render.image_settings.file_format = "WEBP"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.quality = 86

prefs = bpy.context.preferences.addons["cycles"].preferences
for dev_type in ("OPTIX", "CUDA"):
    try:
        prefs.compute_device_type = dev_type
        prefs.get_devices()
        gpus = [d for d in prefs.devices if d.type == dev_type]
        if gpus:
            for d in prefs.devices: d.use = d.type == dev_type
            scene.cycles.device = "GPU"
            print("Using", dev_type, [d.name for d in gpus])
            break
    except TypeError:
        continue

# --- corners + render ---------------------------------------------------------
corners = []
for f in range(1, FRAMES + 1):
    scene.frame_set(f)
    pts = []
    for e in corner_empties:
        c = world_to_camera_view(scene, cam, e.matrix_world.translation)
        pts.append([round(c.x, 5), round(1 - c.y, 5)])
    lid_open = 1 - pivot.rotation_euler.x / CLOSED
    corners.append({"c": pts, "open": round(lid_open, 4)})
    if not ONLY_CORNERS and (ONLY is None or f in ONLY):
        scene.render.filepath = os.path.join(OUT, f"f_{f:04d}")
        bpy.ops.render.render(write_still=True)
        print(f"frame {f}/{FRAMES}", flush=True)

with open(os.path.join(OUT, "screen.json"), "w") as fh:
    json.dump({"frames": FRAMES, "width": W, "height": H, "corners": corners}, fh)
print("DONE")
