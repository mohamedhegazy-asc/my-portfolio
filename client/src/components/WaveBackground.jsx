import { useEffect, useRef } from "react";

/**
 * خلفية موجات خطوط للهيرو.
 * بتتحط جوه سكشن عليه position: relative; overflow: hidden
 * Props:
 *  - color:  لون الخطوط كـ "r,g,b" (الافتراضي أخضر فاتح زي موقعك)
 *  - lines:  عدد الخطوط
 *  - amp:    ارتفاع الموجة
 *  - speed:  سرعة الحركة
 */
export default function WaveBackground({
  color = "181,217,156",
  lines = 9,
  amp = 22,
  speed = 0.8,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: -9999, y: -9999 };
    let w = 0, h = 0, raf;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = mouse.y = -9999; };

    const draw = (ms) => {
      const t = reduce ? 0 : ms / 1000;
      ctx.clearRect(0, 0, w, h);
      const step = w < 600 ? 12 : 8; // نقط أقل على الموبايل

      for (let i = 0; i < lines; i++) {
        ctx.strokeStyle = `rgba(${color},${0.12 + i * 0.04})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        const base = h * (0.25 + i * 0.07);

        for (let x = 0; x <= w; x += step) {
          const dm = x - mouse.x;
          // الموجة بتنحني ناحية الماوس
          const bump = mouse.x < 0 ? 0 : Math.exp(-(dm * dm) / 20000) * (mouse.y - base) * 0.35;
          const y =
            base +
            Math.sin(x * 0.008 + t * speed + i * 0.5) * amp +
            Math.sin(x * 0.015 - t * speed * 0.6) * (amp * 0.36) +
            bump;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    const ro = new ResizeObserver(() => { resize(); if (reduce) draw(0); });
    ro.observe(parent);
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, [color, lines, amp, speed]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        // الخلفية تتلاشى قبل الخط اللي عند Specializations
        WebkitMaskImage: "linear-gradient(to bottom, #000 75%, transparent)",
        maskImage: "linear-gradient(to bottom, #000 75%, transparent)",
      }}
    />
  );
}

/* الاستخدام في سكشن الهيرو:

import WaveBackground from "./WaveBackground";

<section style={{ position: "relative", overflow: "hidden" }}>
  <WaveBackground />
  <div style={{ position: "relative", zIndex: 1 }}>
    ... محتوى الهيرو (الاسم، الصورة، الكروت) ...
  </div>
</section>
*/
