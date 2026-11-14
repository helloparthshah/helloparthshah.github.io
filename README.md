# helloparthshah.github.io

A scroll-driven 3D tour of my projects, built with React, three.js and React Three Fiber.

- **Hero:** a breathing sphere of 60,000 particles.
- **Scroll:** the sphere explodes into a spiralling vortex and the camera flies down it past every project. Scroll speed blows the particles outward and warps the lens; the pointer pushes particles away.
- **Finale:** the particles collapse into my name.

All particle motion runs in a vertex shader, so the CPU only updates a few uniforms per frame. Project screenshots are decoded off the main thread and only loaded when the camera gets close.

## Content

Nothing is hard-coded. On load the site reads:

- `website.config.json` and `public/jsons/projects.json` from [modern-website](https://github.com/helloparthshah/modern-website) (featured projects, name, tagline, links), and
- every repo of mine with GitHub Pages enabled, most-starred first. A repo's screenshot is `image.png` on its `gh-pages` branch.

Sources are set in `src/site.config.js`.

## Accessibility and fallbacks

- **List view** button for a plain grid; used automatically when WebGL is unavailable.
- Respects `prefers-reduced-motion`.
- Project details open in a keyboard-accessible dialog (Esc closes it).

## Develop

```sh
npm install
npm run dev
npm run build   # outputs to dist/
```

Pushing to `master` builds the site and publishes `dist/` to the `gh-pages` branch (`.github/workflows/deploy.yml`).
