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

// Load the shared guest community layer on pages using this shared visual effect.
(() => { const current = document.currentScript; const src = current && current.src ? new URL("community.js", current.src).href : new URL("community.js", location.href).href; if (!document.querySelector('script[src="' + src + '"]')) { const s = document.createElement("script"); s.src = src; s.defer = true; document.body.appendChild(s); } })();


/* Site-wide floating WhatsApp contact button */
(function(){
  if(window.__zhWhatsAppButton)return;window.__zhWhatsAppButton=true;
  function mount(){
    if(!document.body||document.querySelector(".zh-whatsapp"))return;
    if(!document.getElementById("zh-whatsapp-style")){
      const style=document.createElement("style");style.id="zh-whatsapp-style";
      style.textContent=".zh-whatsapp{position:fixed;left:18px;bottom:22px;z-index:2147483000;display:flex;align-items:center;gap:9px;padding:12px 16px;border-radius:999px;background:#25d366;color:#fff!important;text-decoration:none!important;font:600 14px/1.1 system-ui,sans-serif;box-shadow:0 6px 24px #0005;transition:transform .18s ease,box-shadow .18s ease}.zh-whatsapp:hover,.zh-whatsapp:focus-visible{transform:translateY(-3px);box-shadow:0 9px 28px #0007}.zh-whatsapp svg{width:24px;height:24px;fill:currentColor;flex:none}.zh-whatsapp-label{white-space:nowrap}@media(max-width:480px){.zh-whatsapp{left:12px;bottom:14px;padding:11px}.zh-whatsapp-label{display:none}}";
      document.head.appendChild(style);
    }
    const a=document.createElement("a");a.className="zh-whatsapp";a.href="https://wa.me/447552486027";a.target="_blank";a.rel="noopener noreferrer";a.setAttribute("aria-label","Chat with us on WhatsApp");a.title="Chat with us on WhatsApp";
    a.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 .8A15 15 0 0 0 3.1 23.5L1 31l7.7-2A15 15 0 1 0 16 .8zm0 27.3a12.2 12.2 0 0 1-6.2-1.7l-.5-.3-4.6 1.2 1.2-4.5-.3-.5A12.2 12.2 0 1 1 16 28.1zm6.7-9.1c-.4-.2-2.1-1-2.5-1.1-.3-.1-.6-.2-.8.2s-.9 1.1-1.1 1.3-.4.2-.8.1a10 10 0 0 1-3-1.8 11.2 11.2 0 0 1-2.1-2.6c-.2-.4 0-.6.2-.8l.6-.7c.2-.2.2-.4.4-.6.1-.2.1-.4 0-.6s-.8-2-1.1-2.7c-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.8 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 2.1-.9 2.4-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5z"/></svg><span class="zh-whatsapp-label">WhatsApp</span>';
    document.body.appendChild(a);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();
