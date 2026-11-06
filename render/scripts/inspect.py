import bpy, sys
from mathutils import Vector

path = sys.argv[sys.argv.index("--") + 1]
out = open(sys.argv[sys.argv.index("--") + 2], "w", encoding="utf-8")
_print = print
def print(*a):
    out.write(" ".join(str(x) for x in a) + "\n")
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=path)

def world_bbox(o):
    pts = [o.matrix_world @ Vector(c) for c in o.bound_box]
    mn = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    mx = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    return mn, mx

def tree(o, d=0):
    info = ""
    if o.type == "MESH":
        mn, mx = world_bbox(o)
        mats = [s.material.name for s in o.material_slots if s.material]
        info = f" verts={len(o.data.vertices)} min={tuple(round(v,3) for v in mn)} max={tuple(round(v,3) for v in mx)} mats={mats}"
    print("  " * d + f"- {o.name} [{o.type}] loc={tuple(round(v,3) for v in o.location)} rot={tuple(round(v,3) for v in o.rotation_euler)}{info}")
    for c in o.children:
        tree(c, d + 1)

print("==== HIERARCHY")
for o in bpy.data.objects:
    if o.parent is None:
        tree(o)

print("==== MATERIALS")
for m in bpy.data.materials:
    texs = []
    if m.use_nodes:
        for n in m.node_tree.nodes:
            if n.type == "TEX_IMAGE" and n.image:
                texs.append(n.image.name)
        bsdf = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if bsdf:
            bc = bsdf.inputs["Base Color"].default_value
            print(f"{m.name}: base={tuple(round(x,3) for x in bc)} metal={round(bsdf.inputs['Metallic'].default_value,2)} rough={round(bsdf.inputs['Roughness'].default_value,2)} texs={texs}")
            continue
    print(f"{m.name}: texs={texs}")
print("==== ANIMATIONS", [a.name for a in bpy.data.actions])
print("==== GROUPS (empties with >1 mesh descendant)")
for o in bpy.data.objects:
    if o.type == "EMPTY":
        ms = [c for c in o.children_recursive if c.type == "MESH"]
        if len(ms) > 1:
            pts = []
            for m in ms:
                pts += [m.matrix_world @ Vector(c) for c in m.bound_box]
            mn = tuple(round(min(p[i] for p in pts), 2) for i in range(3))
            mx = tuple(round(max(p[i] for p in pts), 2) for i in range(3))
            print(f"{o.name} parent={o.parent.name if o.parent else None} meshes={len(ms)} min={mn} max={mx} rot={tuple(round(v,3) for v in o.rotation_euler)} loc={tuple(round(v,3) for v in o.location)}")
out.close()
