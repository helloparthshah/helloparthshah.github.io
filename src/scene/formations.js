// Target positions for each particle in every formation. The shader morphs
// between them, so these are computed once and never touched again.

// Points sampled from text rendered to a canvas.
function sampleText(text, count, width, font = "Fira Sans") {
  const c = document.createElement("canvas");
  c.width = 1400; c.height = 360;
  const g = c.getContext("2d");
  g.fillStyle = "#fff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  let size = 260;
  g.font = `600 ${size}px "${font}", Arial, sans-serif`;
  while (g.measureText(text).width > c.width * 0.92 && size > 40) {
    size -= 10;
    g.font = `600 ${size}px "${font}", Arial, sans-serif`;
  }
  g.fillText(text, c.width / 2, c.height / 2);
  const data = g.getImageData(0, 0, c.width, c.height).data;
  const hits = [];
  for (let y = 0; y < c.height; y += 2) {
    for (let x = 0; x < c.width; x += 2) if (data[(y * c.width + x) * 4 + 3] > 128) hits.push([x, y]);
  }
  const scale = width / c.width;
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const [x, y] = hits.length ? hits[Math.floor(Math.random() * hits.length)] : [c.width / 2, c.height / 2];
    out[i * 3] = (x - c.width / 2) * scale + (Math.random() - 0.5) * 0.02;
    out[i * 3 + 1] = -(y - c.height / 2) * scale + (Math.random() - 0.5) * 0.02;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
  }
  return out;
}

export function buildFormations({ count, tunnelStart, tunnelEnd, finaleZ, name, compact }) {
  const sphere = new Float32Array(count * 3);
  const tunnel = new Float32Array(count * 3);
  const rand = new Float32Array(count);
  const arms = 9;
  const radius = compact ? 2.6 : 4.2;

  for (let i = 0; i < count; i++) {
    const r = Math.random();
    rand[i] = r;

    // Sphere: points on a shell with a little depth, denser toward the surface.
    const u = Math.random() * 2 - 1;
    const t = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const rad = (compact ? 1.6 : 2.1) * (0.92 + Math.pow(Math.random(), 3) * 0.16);
    sphere[i * 3] = s * Math.cos(t) * rad;
    sphere[i * 3 + 1] = s * Math.sin(t) * rad + 0.3;
    sphere[i * 3 + 2] = u * rad;

    // Vortex: spiral arms that twist along the corridor.
    const z = tunnelStart - Math.random() * (tunnelStart - tunnelEnd);
    const arm = Math.floor(Math.random() * arms);
    const angle = (arm / arms) * Math.PI * 2 + z * 0.22 + (Math.random() - 0.5) * 0.45;
    const rr = radius * (0.8 + Math.random() * 0.5) + Math.pow(Math.random(), 4) * 3;
    tunnel[i * 3] = Math.cos(angle) * rr;
    tunnel[i * 3 + 1] = Math.sin(angle) * rr * 0.8 + 0.3;
    tunnel[i * 3 + 2] = z;
  }

  const text = sampleText(name.toUpperCase(), count, compact ? 4.2 : 7.5);
  for (let i = 0; i < count; i++) {
    text[i * 3 + 1] += 0.5;
    text[i * 3 + 2] += finaleZ;
  }

  return { sphere, tunnel, text, rand };
}
