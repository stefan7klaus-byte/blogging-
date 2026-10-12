(() => {
  "use strict";
  if (document.getElementById("zenith-binary-effect")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "zenith-binary-effect";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("role", "presentation");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100%",
    height: "100%",
    zIndex: "-1",
    pointerEvents: "none",
    opacity: "0.62",
    mixBlendMode: "screen",
    display: "block"
  });
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const colors = ["#16e5ff", "#a855f7", "#39ff88", "#ff4fa3", "#398bff", "#ffd166"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0, height = 0, dpr = 1, streams = [], frame = 0, raf = 0;
  const rand = (min, max) => Math.random() * (max - min) + min;
  const choose = items => items[Math.floor(Math.random() * items.length)];
  const angles = [
    Math.PI / 2, -Math.PI / 2,
    Math.PI / 4, -Math.PI / 4,
    (3 * Math.PI) / 4, -(3 * Math.PI) / 4,
    rand(-0.28, 0.28), Math.PI + rand(-0.28, 0.28),
    rand(0.35, 1.25), rand(-1.25, -0.35),
    rand(1.9, 2.8), rand(-2.8, -1.9)
  ];

  function makeStream(randomStart = true) {
    const angle = choose(angles) + rand(-0.12, 0.12);
    const length = Math.floor(rand(8, 25));
    const speed = Math.random() < 0.28 ? rand(2.5, 4.5) : (Math.random() < 0.42 ? rand(0.22, 0.72) : rand(0.9, 2.2));
    const glyphs = Array.from({ length }, () => Math.random() < 0.5 ? "0" : "1");
    if (Math.random() < 0.16 && glyphs.length > 10) glyphs[Math.floor(rand(3, glyphs.length - 2))] = "ZENITH";
    return {
      x: randomStart ? rand(-width * 0.1, width * 1.1) : (Math.cos(angle) > 0 ? -80 : width + 80),
      y: randomStart ? rand(-height * 0.1, height * 1.1) : (Math.sin(angle) > 0 ? -80 : height + 80),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      angle,
      speed,
      length,
      spacing: rand(13, 23),
      font: rand(11, 17),
      color: choose(colors),
      alpha: rand(0.32, 0.86),
      glyphs,
      phase: rand(0, Math.PI * 2)
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = width < 640 ? 22 : width < 1000 ? 30 : 42;
    streams = Array.from({ length: count }, () => makeStream(true));
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.textBaseline = "middle";
    for (const s of streams) {
      const ux = Math.cos(s.angle), uy = Math.sin(s.angle);
      for (let i = 0; i < s.glyphs.length; i++) {
        const x = s.x - ux * i * s.spacing;
        const y = s.y - uy * i * s.spacing;
        if (x < -100 || x > width + 100 || y < -100 || y > height + 100) continue;
        const isWord = s.glyphs[i] === "ZENITH";
        const fade = 1 - i / s.length;
        ctx.globalAlpha = s.alpha * (0.24 + fade * 0.76) * (0.82 + Math.sin(frame * 0.025 + s.phase + i) * 0.18);
        ctx.fillStyle = s.color;
        ctx.font = isWord ? "700 " + (s.font + 1) + "px monospace" : "600 " + s.font + "px monospace";
        ctx.shadowColor = s.color;
        ctx.shadowBlur = i < 3 ? 8 : 2;
        ctx.fillText(s.glyphs[i], x, y);
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function tick() {
    if (document.hidden) { raf = 0; return; }
    frame++;
    for (let i = 0; i < streams.length; i++) {
      const s = streams[i];
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < -180 || s.x > width + 180 || s.y < -180 || s.y > height + 180) streams[i] = makeStream(false);
    }
    draw();
    raf = window.requestAnimationFrame(tick);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !reducedMotion && !raf) raf = window.requestAnimationFrame(tick);
  });
  window.addEventListener("resize", resize, { passive: true });
  resize();
  if (!reducedMotion) raf = window.requestAnimationFrame(tick);
})();
