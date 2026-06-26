# Kye Beezy — Hero 3D Asset Guide

This guide walks you through creating the **hero 3D asset** for the homepage — the
big scroll-driven "Kye" that orbits as you scroll. You don't need to touch any
code. The scene (`components/three/HeroScene.tsx`) **auto-detects** whichever asset
you drop into `/public` and instantly upgrades the hero. No build flag, no config.

> **The subject:** Kye Beezy — a bearded man with glasses, wearing a **purple
> satin bonnet over a purple headband**, and a **red zip hoodie**. That bonnet +
> red hoodie combo is the whole brand identity ("Bonnet Gang"), so every asset
> must keep it crisp and recognizable. You have reference photos already:
> **front / 3‑4 (45°) / profile (side) / back**.

---

## Table of contents

1. [The 3 asset options (and where files go)](#1-the-3-asset-options)
2. [Option A — Image‑to‑3D `.glb` (best)](#2-option-a--imageto3d-glb-the-best-result)
3. [Option B — 360° turntable video (great middle ground)](#3-option-b--360-turntable-video)
4. [Option C — Multi‑angle cutouts (lightest)](#4-option-c--multiangle-cutouts-lightweight)
5. [Verify it worked](#5-verify-it-worked)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. The 3 asset options

The hero scene looks for files in **this exact priority order** and uses the first
one it finds. Better asset = drop it in, it auto-wins. No code change ever needed.

| Priority | Asset | What it does | Put the file here |
| :------: | ----- | ------------ | ----------------- |
| **1** | True 3D model | Real geometry, real orbit camera follows scroll | `public/models/kye.glb` |
| **2** | 360° turntable video | Pre-rendered spin, **scrubbed** frame-by-frame by scroll | `public/hero/turntable.mp4` (or `.webm`) |
| **3** | 2.5D cutout (already live) | Single PNG with parallax + tilt | `public/kye-cutout-new.png` ✅ *already exists* |

### Exact filenames & folders (copy these — they are case-sensitive)

```text
public/
├── models/
│   └── kye.glb              ← OPTION A  (priority 1, the dream)
├── hero/
│   ├── turntable.mp4        ← OPTION B  (priority 2, h264 preferred)
│   └── turntable.webm       ← OPTION B  (optional fallback codec)
└── kye-cutout-new.png       ← OPTION C  (priority 3, already working today)
```

**Notes**
- The `models/` and `hero/` folders may not exist yet — just create them.
- Filenames must match **exactly**: `kye.glb`, `turntable.mp4`, `turntable.webm`.
  No version suffixes, no spaces, all lowercase.
- You only need to win **one** tier. If you ship a great `kye.glb`, the video and
  PNG are simply ignored. Start with whichever option you can finish today.

#### Checklist — pick your path
- [ ] **Have 10 minutes and want it perfect?** → [Option A](#2-option-a--imageto3d-glb-the-best-result) (real 3D)
- [ ] **Image-to-3D looks weird on the face/bonnet?** → [Option B](#3-option-b--360-turntable-video) (AI turntable video)
- [ ] **Want something quick and bulletproof?** → [Option C](#4-option-c--multiangle-cutouts-lightweight) (cutout PNGs)

---

## 2. Option A — Image‑to‑3D `.glb` (the best result)

This generates an actual 3D model from your reference photos. The scene then
orbits a real camera around it as the visitor scrolls — the premium effect.

### Target spec (aim for all of these)

| Property | Target | Why |
| -------- | ------ | --- |
| Format | **single `.glb`** (binary glTF, textures embedded) | The loader reads one self-contained file |
| File size | **< ~8 MB** (smaller is better for first paint) | It's loaded on the homepage; keep it lean |
| Triangles | **~30k–80k** | Enough detail for the bonnet/face, still light |
| Textures | **baked PBR**, **≤ 2048×2048 (2k)** | 4k textures bloat the file with no visible gain at hero size |
| Facing | model faces **+Z (toward camera / "forward")** | Front photo = the money shot the camera opens on |
| Orientation | **standing upright** (head up, +Y) | The scene assumes Y-up |
| Origin / pivot | **near feet or body center**, model roughly centered | The scene auto-centers, but a sane pivot avoids surprises |
| Scale | **~real-world meters** (a person ≈ 1.7–1.8 units tall) | The scene rescales to ~3 units, but real scale imports cleanly |

> **Good news:** the scene **auto-centers and auto-scales** the model to a
> consistent height (~3 units) on load and adds a gentle idle sway. So perfect
> scale/centering is *nice-to-have*, not required. **Facing and upright
> orientation are the two that matter most** — see Troubleshooting if it loads
> sideways or backwards.

### What photos to upload

Upload the **multi-angle set** so the AI can solve the full head + bonnet:

- [ ] **Front** (straight on) — the most important; clear face, glasses, bonnet front
- [ ] **3‑4 / 45°** — shows the bonnet's volume and one ear of the headband
- [ ] **Profile / side** — defines the silhouette and bonnet depth
- [ ] **Back** — captures the back of the bonnet so the model isn't hollow behind

**Tips for better results**
- Make a single **contact sheet** (all 4 angles, evenly lit, plain background) if
  the tool accepts one image — many image-to-3D tools love a clean multi-view sheet.
- Crop tight to the subject; remove busy backgrounds first if you can.
- Consistent lighting across the 4 shots = consistent baked texture.
- Keep the **purple bonnet** and **red hoodie** clearly visible in every shot —
  these are the colors the model must nail.

### Tool 1 — Meshy.ai (recommended, easiest)

1. Go to **meshy.ai** → sign in → **Image to 3D**.
2. Upload your **front** photo as the primary. If it offers **Multi-Image / multi-view**, add the 45°, side, and back too.
3. Settings:
   - **Topology:** Quad or Triangle (either is fine; we just need a clean `.glb`).
   - **Polycount / Target:** **Medium** (~30k–60k tris). Avoid "High/Ultra" — it blows past 8 MB.
   - **Texture:** **PBR** + **enabled**. Texture resolution **2K** (not 4K).
   - **Symmetry:** **On** (helps a human head/torso).
   - **AI texture / "match input image":** On, so the purple + red read correctly.
4. Generate → preview → **remesh/decimate** if it gives you the option and the count is high.
5. **Download → glTF (.glb)**. Rename to `kye.glb`.
6. Drop into `public/models/kye.glb`.

### Tool 2 — Tripo3D (great alternative, fast)

1. Go to **tripo3d.ai** → **Image to 3D**.
2. Upload the **front** photo (Tripo supports **multiview** — add 45°/side/back if prompted).
3. Settings:
   - **Quality:** Standard/HD is plenty; skip the maxed setting to stay under 8 MB.
   - **Texture:** **On**, **PBR** if available, **2K**.
   - **Auto-rig:** **Off** (we don't need a skeleton; it just adds weight).
4. Generate → in the editor use **Decimate / Reduce faces** toward ~50k if it's heavy.
5. **Export → GLB** (textures embedded). Rename to `kye.glb` → `public/models/kye.glb`.

### Tool 3 — Luma AI / Rodin (alternatives)

- **Luma AI (Genie / "Capture"):** Use **Image to 3D**. Upload front (+ extra angles if
  supported). Export **GLB**. Luma tends toward higher polycounts — run it through a
  decimate step (see Troubleshooting) to hit ~30k–80k tris and < 8 MB.
- **Rodin (Hyper3D / hyperhuman.deemos.com):** Strong on **human heads/characters**, which
  suits the bearded-man-in-bonnet subject well. Upload the multi-angle set, enable
  **PBR texture @ 2K**, set a **medium** polygon budget, **export GLB**.

### Copy‑paste TEXT PROMPTS for image‑to‑3D tools

Many image-to-3D tools accept a text prompt alongside the photos to steer the
result. Paste one of these:

```text
A photoreal 3D character bust-to-waist of a bearded man wearing glasses, a shiny
purple satin bonnet over a purple headband, and a red zip-up hoodie. Accurate
likeness from the reference photos. Clean watertight mesh, upright, facing
forward (+Z). Baked PBR textures, 2K. Neutral pose, arms relaxed. No background,
no base, no props.
```

```text
Full-body 3D model of a man with a short beard and glasses. Headwear: a glossy
purple satin bonnet/durag worn over a purple headband. Outfit: a red zip hoodie,
casual streetwear. Standing upright, neutral A-pose, facing the camera. Crisp
purple and red colors matching the photos. Optimized real-time topology around
30–60k triangles, embedded 2K PBR textures, single GLB. Origin at the feet.
```

```text
Stylized-but-faithful 3D portrait character: bearded, glasses, purple satin
bonnet, red hoodie. Premium hip-hop artist look. Smooth even lighting baked into
texture (no harsh shadows), front-facing, upright, centered. Keep the bonnet
volume and hoodie folds. Game-ready, low-to-mid poly, 2K PBR, export GLB.
```

> If a tool only takes photos (no prompt field), skip the prompt — the multi-angle
> photos do the work.

---

## 3. Option B — 360° turntable video

If image-to-3D mangles the face or bonnet, a **360° turntable video** is the next
best thing. The scene **scrubs the video frame-by-frame as you scroll**, so it
reads like a real camera orbiting Kye.

### Why "seamless loop + consistent lighting" is critical

The scroll position maps **directly to a frame** of the video (scroll 0% = first
frame, 100% = last frame). So:

- **The loop must be seamless:** the **last frame must continue smoothly into the
  first** (a true 360° that ends where it began). A jump or stutter at the loop
  point will look like a glitch when the user scrolls back and forth.
- **Lighting must stay consistent** through the whole spin — no flicker, no
  brightening/darkening — or the subject will appear to pulse as you scroll.
- **Even rotation speed:** the spin should be **constant**, not ease-in/ease-out,
  so equal scrolling = equal rotation.

### Target spec

| Property | Target |
| -------- | ------ |
| Motion | Smooth **360° orbit**, **even/constant speed**, subject centered |
| Loop | **Seamless** (frame N → frame 0 with no jump) |
| Duration | **5–10 seconds** |
| Resolution | **1080×1080** (square) or **1080×1920** (vertical) |
| Background | **Transparent or solid black** (the scene composites over a dark canvas) |
| Lighting | **Constant**, even, no flicker; keep purple bonnet + red hoodie readable |
| Export | **MP4 (H.264)** → `public/hero/turntable.mp4` |

> **Background tip:** Transparent is ideal, but most AI video tools can't do
> alpha. **Solid black is the safe choice** — it blends into the dark hero. Avoid
> bright/white or busy backgrounds.

### Where to put it

```text
public/hero/turntable.mp4     ← required, H.264 MP4
public/hero/turntable.webm    ← optional extra codec (VP9), same clip
```

### Copy‑paste PROMPTS by tool

Use a reference image (your **front** photo) as the start frame **wherever the tool
supports image-to-video** — it keeps the likeness locked.

**Kling (image-to-video, recommended for character consistency):**
```text
A slow, smooth 360-degree turntable rotation of the same man, full subject in
frame, perfectly centered. He has a beard, glasses, a glossy purple satin bonnet
over a purple headband, and a red zip hoodie. Constant even rotation speed, one
full clean revolution, seamless loop. Studio lighting that stays perfectly
consistent the whole time, no flicker. Plain solid black background, no other
objects, no camera shake. 5 seconds.
```

**Runway Gen‑3 (image-to-video):**
```text
Orbit the camera a full 360 degrees around the subject at a slow constant speed,
one complete revolution, subject locked in the center of frame. Bearded man with
glasses, purple satin bonnet over a purple headband, red zip hoodie. Lighting
stays identical throughout, no flicker, no exposure change. Solid black
background. Smooth, loopable, no cuts. 5–8 seconds.
```

**Hailuo / MiniMax:**
```text
Slow turntable spin: the subject rotates a full 360 degrees in place at a steady,
even speed, centered in frame. A bearded man with glasses wearing a shiny purple
satin bonnet and a red hoodie. Consistent soft studio lighting throughout, plain
black background, no background motion, no camera shake. Clean seamless loop, ~6
seconds.
```

**Pika:**
```text
360 turntable rotation of a bearded man with glasses, purple satin bonnet, and
red hoodie. He spins slowly and evenly one full turn while staying centered.
Constant lighting, solid black background, no flicker, no extra objects. Smooth
loopable motion, 5 seconds.
```

**Sora:**
```text
A continuous, smooth 360-degree orbit around a single subject standing still in
the center of the frame: a bearded man with glasses, a glossy purple satin bonnet
worn over a purple headband, and a red zip-up hoodie. The camera circles at a
slow, perfectly constant speed for exactly one full revolution and returns to the
starting angle so the clip loops seamlessly. Lighting is even and unchanging
throughout, no flicker or exposure shifts. Plain solid black background, no other
people or objects, no camera shake. 8 seconds, square 1:1.
```

### After generating: make the loop clean (optional but recommended)

If the clip isn't perfectly seamless, trim it so the last frame matches the first.
With **FFmpeg** (free), to also force H.264 MP4 + square 1080:

```bash
# Trim to a clean loop window and re-encode to web-friendly H.264 MP4
ffmpeg -i raw_spin.mp4 -ss 0 -t 5 -vf "scale=1080:1080:force_original_aspect_ratio=increase,crop=1080:1080" \
  -c:v libx264 -pix_fmt yuv420p -an -movflags +faststart turntable.mp4
```

- `-an` drops audio (the scene doesn't use it — saves size).
- `+faststart` lets the browser begin decoding sooner.
- Then move `turntable.mp4` into `public/hero/`.

---

## 4. Option C — Multi‑angle cutouts (lightweight)

The simplest, most bulletproof option — and the **PNG fallback already works
today** (`public/kye-cutout-new.png`). If you only want to refresh that one cutout,
just export a clean transparent PNG and overwrite that file.

For best quality, export **four** transparent PNG cutouts from your reference
photos so the cutout reads well from multiple tilt angles:

- [ ] **Front** — `kye-cutout-new.png` (this is the one the scene actually loads)
- [ ] **45°** — keep as a source / for future use
- [ ] **Side (profile)**
- [ ] **Back**

**How to make them**
1. Open each reference photo in any background remover (Photoshop "Remove
   Background", **remove.bg**, Canva, Photopea — all fine).
2. Cut out **just the person** (transparent everywhere else).
3. Export as **PNG with transparency**. Trim empty margins so the subject fills the frame.
4. Save the **front** one as `kye-cutout-new.png` and drop it in `public/`
   (overwrite the existing file).

**Spec**
- Transparent PNG, subject tightly cropped.
- Tall portrait aspect works best (the scene sizes it to ~3.4 units tall and keeps your aspect ratio).
- Keep the purple bonnet + red hoodie sharp and well-lit.

> The scene already gives the cutout subtle parallax, tilt, and float, so even a
> single clean front PNG looks 2.5D rather than flat. The other three angles are
> just nice source material to have on hand.

---

## 5. Verify it worked

1. Drop your file into the exact path from the table above.
2. Run the site locally (or open the deployed homepage).
3. **Hard refresh** the homepage (Ctrl/Cmd + Shift + R) to bypass cache.
4. **Scroll** the page slowly top → bottom.

**What you should see, by tier:**

- **GLB present** → a real 3D Kye; the **camera orbits** around him through
  several angles (front → left → right → pull back → close → wide) as you scroll,
  with a gentle idle sway.
- **Video present (no GLB)** → the turntable **scrubs**: scrolling down rotates
  Kye; scrolling up rotates him back. Should feel like a live orbit.
- **Only the PNG** → the cutout with parallax/tilt (the current look).

**Confirm which asset loaded (DevTools):** open the browser **Network** tab,
refresh, and look at what was fetched. The scene HEAD-checks the candidates in
order; the **first one that returns OK and is not an HTML page** wins. If you see
`kye.glb` returning **200** with a binary content-type, the 3D model is live. If
`kye.glb` 404s but `turntable.mp4` is 200, the video tier is live, and so on.

> **Why HTML matters:** the detector specifically rejects responses whose
> content-type is `text/html`. On a static export, a missing file may resolve to
> an HTML 404 page — the scene treats that as "not found" and falls through to the
> next tier. So a wrong filename simply means your asset is silently skipped, not
> that the page breaks.

---

## 6. Troubleshooting

### GLB is too big (> 8 MB) or slow to load
- Re-export at a **lower polycount** (target ~30k–80k tris) and **2K textures** (not 4K).
- **Decimate / compress** it. Easiest free options:
  - **gltf.report** or **gltf-transform** (CLI): apply **Draco** geometry
    compression + **resize textures to 2048** + **WebP/KTX2**.
    ```bash
    # Squash a heavy GLB: resize textures to 2k, Draco-compress geometry
    npx @gltf-transform/cli resize kye.glb kye.glb --width 2048 --height 2048
    npx @gltf-transform/cli draco kye.glb kye.glb
    ```
  - In **Blender**: `Decimate` modifier (Ratio ~0.3–0.6) → re-export.
- Re-check the file size after; aim well under 8 MB.

### Model faces the wrong way / is sideways / upside down (rotate in Blender)
The scene assumes **Y-up** and the model **facing +Z (toward camera)**. If it
loads turned away, lying down, or rotated:
1. Open **Blender** → `File ▸ Import ▸ glTF 2.0` → select `kye.glb`.
2. Select the model. Press **`R`** then the axis + degrees, e.g.:
   - Turned around (showing his back): **`R Z 180`** then Enter.
   - Lying down / on its back: **`R X 90`** (or `-90`) then Enter.
   - Tilted sideways: **`R Y 90`** then Enter.
3. **Apply the rotation** so it bakes in: `Object ▸ Apply ▸ Rotation` (or
   **Ctrl + A → Rotation**). *This step is essential — without it the export keeps
   the old orientation.*
4. Optional: move the model so its **feet sit near the origin** and it stands at +Y.
5. `File ▸ Export ▸ glTF 2.0` → format **glTF Binary (.glb)** → **enable
   "Compression" (Draco)** and keep textures → save as `kye.glb` → put back in
   `public/models/`.

> Quick reference: **+Z = forward (toward viewer)**, **+Y = up**. You want the
> face pointing toward +Z and the head toward +Y.

### Turntable video isn't seamless (jumps when scrolling back and forth)
- The **first and last frames don't match.** Trim the clip so it ends exactly one
  full revolution from where it started (see the FFmpeg trim in
  [Option B](#after-generating-make-the-loop-clean-optional-but-recommended)).
- If the AI added **ease-in/ease-out**, the middle spins faster than the ends —
  regenerate asking for **constant/even rotation speed** (the prompts above say
  this explicitly).
- **Lighting flicker** between frames → regenerate with "consistent lighting, no
  flicker," and prefer **image-to-video** tools (Kling/Runway) that lock the
  subject from your front photo.

### Video doesn't show up at all
- Confirm the path is exactly `public/hero/turntable.mp4` (lowercase, no spaces).
- Make sure it's **H.264 MP4** (`-c:v libx264 -pix_fmt yuv420p`). Some exotic
  codecs won't decode in-browser. Re-encode with the FFmpeg command above.
- If a `kye.glb` also exists, **the GLB wins** — the video is intentionally
  ignored. Remove/rename the GLB to test the video tier.

### Nothing changed after I added the file
- **Hard refresh** (Ctrl/Cmd + Shift + R) — browsers cache aggressively.
- Double-check the **filename and folder** against the table in
  [section 1](#exact-filenames--folders-copy-these--they-are-casesensitive).
  `Kye.glb`, `turntable.MP4`, or `turntables.mp4` will all be silently skipped.
- Check the **Network tab**: a `404` (often served as an HTML page) means the path
  is wrong, so the scene fell through to the next tier.

### WebGL / 3D doesn't render at all (rare)
- On devices without WebGL, the 3D layer is skipped entirely and the page still
  works — the surrounding CSS/brand visuals carry the hero. Nothing for you to fix;
  this is expected graceful degradation.

---

**That's it.** Pick a tier, drop the file in the matching folder, hard-refresh,
and scroll. The hero upgrades itself. 💜 (Bonnet Gang.)
