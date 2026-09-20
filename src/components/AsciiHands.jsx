import { useEffect, useRef } from 'react';

// Ported from GitAscii's ascii-hands.tsx. The source image is converted to
// ASCII on a canvas; on top of that a soft light-sweep + "breathing" shimmer
// animates the characters. Respects prefers-reduced-motion (renders one frame).

const ASCII_RAMP = ' .`\'^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
const HANDS_SRC = '/ascii-hands.webp';
const FPS = 24;
const A_LEVELS = 8; // alpha buckets
const C_LEVELS = 5; // color buckets

export default function AsciiHands({ className = '', style }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return undefined;

    let active = true;
    let raf = 0;
    let cells = [];
    let W = 0;
    let H = 0;
    let fontSize = 8;
    let imgInfo = null;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const colorFor = (level) => {
      const b = (level + 0.5) / C_LEVELS;
      const k = Math.pow(b, 0.8);
      return [
        Math.round(197 * k + 200 * (1 - k)),
        Math.round(255 * k + 200 * (1 - k)),
        Math.round(74 * k + 200 * (1 - k)),
      ];
    };
    const COLORS = Array.from({ length: C_LEVELS }, (_, i) => colorFor(i));

    const buildCells = () => {
      const parent = canvas.parentElement;
      if (!parent || !imgInfo) return;
      const rect = parent.getBoundingClientRect();
      W = Math.round(rect.width);
      H = Math.round(rect.height);
      if (!W || !H) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fontSize = Math.max(5, Math.min(10, W / 180));
      const charW = fontSize * 0.62;
      const charH = fontSize * 1.15;
      const scale = 1.35;
      const areaW = W * scale;
      const areaH = H * scale;
      const startX = (W - areaW) / 2;
      const startY = (H - areaH) / 2;
      const cols = Math.floor(areaW / charW);
      const rows = Math.floor(areaH / charH);
      const stepX = imgInfo.width / cols;
      const stepY = imgInfo.height / rows;

      cells = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ix = Math.floor(col * stepX);
          const iy = Math.floor(row * stepY);
          const idx = (iy * imgInfo.width + ix) * 4;
          const br = (0.299 * imgInfo.data[idx] + 0.587 * imgInfo.data[idx + 1] + 0.114 * imgInfo.data[idx + 2]) / 255;
          if (br < 0.06) continue;
          const ci = Math.floor(br * (ASCII_RAMP.length - 1));
          if (ASCII_RAMP[ci] === ' ') continue;
          cells.push({
            ch: ASCII_RAMP[ci],
            x: Math.round(startX + col * charW),
            y: Math.round(startY + row * charH),
            br,
            cLevel: Math.min(C_LEVELS - 1, Math.floor(br * C_LEVELS)),
            phase: (col * 0.13 + row * 0.21) % (Math.PI * 2),
          });
        }
      }
    };

    const draw = (t) => {
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);
      ctx.font = `${fontSize}px "JetBrains Mono", "Courier New", monospace`;
      ctx.textBaseline = 'top';

      // diagonal light band travelling across the canvas
      const period = 7;
      const sweepPos = ((t / 1000) % period) / period; // 0..1
      const sweepX = (sweepPos * 1.6 - 0.3) * W;

      const buckets = new Map();
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        const breathe = reduced ? 1 : 0.82 + 0.18 * Math.sin(t / 900 + c.phase);
        const d = Math.abs(c.x + c.y * 0.35 - sweepX) / (W * 0.12);
        const sweep = reduced ? 0 : Math.max(0, 1 - d) * 0.55;
        const alpha = Math.min(1, c.br * 0.85 * breathe + sweep * c.br);
        const aLevel = Math.min(A_LEVELS - 1, Math.floor(alpha * A_LEVELS));
        const cLevel = sweep > 0.25 ? C_LEVELS - 1 : c.cLevel;
        const key = aLevel * C_LEVELS + cLevel;
        let arr = buckets.get(key);
        if (!arr) { arr = []; buckets.set(key, arr); }
        arr.push(c);
      }

      buckets.forEach((arr, key) => {
        const aLevel = Math.floor(key / C_LEVELS);
        const cLevel = key % C_LEVELS;
        const [r, g, b] = COLORS[cLevel];
        ctx.fillStyle = `rgba(${r},${g},${b},${((aLevel + 1) / A_LEVELS).toFixed(2)})`;
        for (let i = 0; i < arr.length; i++) ctx.fillText(arr[i].ch, arr[i].x, arr[i].y);
      });
    };

    let last = 0;
    const loop = (t) => {
      if (!active) return;
      raf = requestAnimationFrame(loop);
      if (t - last < 1000 / FPS) return;
      last = t;
      draw(t);
    };

    const onResize = () => {
      buildCells();
      if (reduced) draw(0);
    };

    const img = new Image();
    img.onload = () => {
      if (!active) return;
      const off = document.createElement('canvas');
      off.width = img.naturalWidth;
      off.height = img.naturalHeight;
      const octx = off.getContext('2d', { willReadFrequently: true });
      octx.drawImage(img, 0, 0);
      const d = octx.getImageData(0, 0, off.width, off.height);
      imgInfo = { data: d.data, width: off.width, height: off.height };
      buildCells();
      if (reduced) draw(0);
      else raf = requestAnimationFrame(loop);
    };
    img.src = HANDS_SRC;

    window.addEventListener('resize', onResize);
    return () => {
      active = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      className={className}
      style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', pointerEvents: 'none', userSelect: 'none', ...style,
      }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} aria-hidden="true" style={{ opacity: 0.9 }} />
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.7,
          background: 'radial-gradient(ellipse 55% 55% at 50% 50%, rgba(197,255,74,0.12) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
