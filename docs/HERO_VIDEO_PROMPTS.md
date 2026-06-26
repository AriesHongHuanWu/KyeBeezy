# Hero Video — Scroll-Scrubbed Performance (copy-paste prompts)

The homepage 3D scene maps **scroll progress → video time**. So the hero video
should be **one smooth, continuous performance** that reads well both forward
(scrolling down) and reverse (scrolling up). Think *"getting ready to
broadcast"*: he puts the headphones on, nods to the beat, glances at the
stream, picks up the mic, and locks eyes with the camera.

Drop the final file at: **`public/hero/turntable.mp4`** (the scene auto-detects
it; the black background is keyed out automatically so he floats over the aurora).

---

## Golden rules (these make or break the scrub)

- **Locked-off camera** (no orbit, no shake; a *very* slow push-in at most). Subject **centered**, medium shot (waist up).
- **Continuous, even-paced motion, NO cuts / scene changes** — the user can scroll backwards, so it must look good reversed too.
- **Plain solid BLACK background** (auto-keyed by the scene).
- **Consistent lighting**, face stays identical (no warping), subject never leaves frame.
- Aspect **9:16 (1080×1920)** or **1:1**; length = the longest the tool allows (ideally 10s); 24–30 fps; export **MP4 (H.264)**.

## Action storyboard (maps top→bottom of the site)

| Scroll | Section | Action |
| --- | --- | --- |
| 0% | Hero | Hands holding over-ear headphones **raised above the bonnet**, looking at camera |
| ~20% | About | Slowly **lowers and puts the headphones on**, slight head tilt |
| ~40% | Music | Headphones on, **nods to a beat**, adjusts an earcup |
| ~60% | Stream | **Glances to the side** (checking the stream), confident smirk, fixes the bonnet |
| ~80% | Dubby/Schedule | **Reaches forward and picks up** a mic / energy-drink tub / controller |
| 100% | Contact | Holds it / points at camera, or arms-crossed close, eyes on camera |

---

## Option A — one continuous 10s shot (Kling / Runway Gen-4 / Veo 3 / Sora)

Use **Image-to-Video**, upload the clearest **front** photo, then paste:

```
A single continuous 10-second shot, locked-off camera at eye level, medium
shot (waist up), the SAME man stays centered the whole time on a plain solid
BLACK background, even studio lighting, photorealistic, his face stays
identical with no warping.
Action, smooth and continuous: he starts holding large over-ear headphones
raised above his head, then slowly lowers them and puts them on over his
purple satin bonnet, nods his head to a beat while adjusting one earcup,
glances confidently to the side, then reaches forward and picks up a
microphone and raises it toward the camera, ending looking straight at the
camera. Slow, deliberate, hypnotic motion the whole time, no cuts.
Subject: bearded man with round glasses, glossy deep-purple satin bonnet
over a purple headband, red zip-up hoodie.
```

**Negative prompt:**

```
camera shake, fast cuts, scene change, multiple people, extra hands, extra
fingers, warped face, morphing, melting, text, watermark, logo, blurry,
flicker, subject leaving frame, background objects
```

## Option B — 3 clips, then stitch (more stable / higher quality)

Most tools are steadiest at ~5s. Shoot three clips; use the **last frame of each
clip as the input image of the next** so they connect seamlessly.

```
CLIP 1 (Hero→About): Locked camera, black bg, centered. He holds over-ear
headphones above his bonnet, then slowly lowers and puts them on over his
ears, slight head tilt. Slow continuous motion, no cuts.

CLIP 2 (Music→Stream): Headphones already on. He nods to a beat, adjusts an
earcup with one hand, then turns his head to glance confidently to the side
with a slight smirk. Slow continuous motion, no cuts.

CLIP 3 (Dubby→Contact): He reaches forward, picks up a microphone, raises it
toward camera, then settles looking straight into the lens, calm and
confident. Slow continuous motion, no cuts.
```

Swap `microphone` for `a Dubby energy-drink tub` or `a game controller` if you
prefer. Add the same negative prompt to every clip.

## Tool-specific notes

- **Kling AI** — Image to Video → Professional → 10s → Camera Movement: **Static/None**.
- **Runway Gen-4** — Image to Video; do **not** enable orbit/camera-control; 10s.
- **Google Veo 3 / Sora** — paste the whole prompt; 8–10s.
- **Hailuo (MiniMax) / Pika** — 5s; use Option B (3 clips).

## After you generate

1. Put the final file at `public/hero/turntable.mp4`.
2. (Optional, smoother scrubbing) re-encode with frequent keyframes:
   `ffmpeg -i in.mp4 -an -g 1 -c:v libx264 -crf 18 -pix_fmt yuv420p public/hero/turntable.mp4`
3. Reload the homepage — the scene picks it up automatically and keys out the black.

> Prefer a true 3D model instead? Generate a GLB (Meshy / Tripo) and drop it at
> `public/models/kye.glb` — see `docs/3D_ASSET_GUIDE.md`. GLB wins over video if both exist.
