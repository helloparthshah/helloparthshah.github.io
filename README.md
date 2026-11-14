# helloparthshah.github.io

A scroll-driven 3D tour of my projects, built with React, three.js and React Three Fiber.

- **Hero:** a breathing sphere of 60,000 particles.
- **Scroll:** the sphere explodes into a spiralling vortex and the camera flies down it past every project. Scroll speed blows the particles outward and warps the lens; the pointer pushes particles away.
- **Years:** after the featured projects, the rest are grouped newest-first; the camera flies through a glowing year gate ("2026", "2023", …) into each group.
- **Stars:** each screen shows its GitHub star count, and gold sparkles orbit it (more stars, more sparkles, on a log scale).
- **Finale:** the particles collapse into my name.

All particle motion runs in a vertex shader, so the CPU only updates a few uniforms per frame. Project screenshots are decoded off the main thread and only loaded when the camera gets close.

## Content

Nothing is hard-coded. On load the site reads:

- `website.config.json` and `public/jsons/projects.json` from [modern-website](https://github.com/helloparthshah/modern-website) (featured projects, name, tagline, links), and
- every repo of mine with GitHub Pages enabled, newest first, then by stars within a year. A repo's screenshot is `image.png` on its `gh-pages` branch, or on its default branch for repos that deploy Pages from GitHub Actions.
- star counts for featured projects from the repo behind their GitHub link (an organization link is matched by the project's name).

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
