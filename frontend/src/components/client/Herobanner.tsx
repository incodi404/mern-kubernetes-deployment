"use client"; // needed for Next.js App Router, safe to keep elsewhere

import { useState } from "react";

/* ---------- Edit your slides here ---------- */
const SLIDES = [
  {
    badge: "Up to 50% off",
    lines: ["Gifts that say", "what words can't"],
    text: "Handpicked showpieces, mugs and keepsakes for birthdays, weddings and every in-between.",
    cta: { label: "Shop gifts", href: "/products?category=gifts" },
    alt: { label: "Gift by occasion", href: "/occasions" },
    image:
      "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Wrapped gift boxes tied with ribbon",
  },
  {
    badge: "New arrivals",
    lines: ["Write something", "worth keeping"],
    text: "Notebooks, fountain pens and desk favourites that make studying and planning a pleasure.",
    cta: { label: "Shop stationery", href: "/products?category=stationery" },
    alt: { label: "Best sellers", href: "/best-sellers" },
    image:
      "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Notebook and pens on a desk",
  },
  {
    badge: "Toy sale",
    lines: ["Playtime picks", "for every age"],
    text: "Board games, plushies and indoor games the whole family can enjoy together.",
    cta: { label: "Order now", href: "/products?category=games" },
    alt: { label: "View all games", href: "/products?category=games" },
    image:
      "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=1000&q=80",
    imageAlt: "Teddy bear surrounded by colourful toys",
  },
];

const AUTOPLAY_MS = 6500;

export default function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [broken, setBroken] = useState<Record<number, boolean>>({});

  const count = SLIDES.length;
  const go = (i:any) => setIndex((i + count) % count);
  const slide = SLIDES[index];

  return (
    <section
      className="hb"
      aria-roledescription="carousel"
      aria-label="Featured offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <style>{css}</style>

      <div className="hb-card">
        {/* floating confetti, decorative only */}
        <span className="hb-dot hb-dot--1" aria-hidden="true" />
        <span className="hb-dot hb-dot--2" aria-hidden="true" />
        <span className="hb-dot hb-dot--3" aria-hidden="true" />
        <span className="hb-ring" aria-hidden="true" />

        {/* key makes every animation replay when the slide changes */}
        <div className="hb-slide" key={index} aria-live="polite">
          <div className="hb-copy">
            <p className="hb-badge">{slide.badge}</p>

            <h1 className="hb-title">
              {slide.lines.map((line, i) => (
                <span className="hb-mask" key={line}>
                  <span className="hb-line" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p className="hb-text">{slide.text}</p>

            <div className="hb-actions">
              <a className="hb-btn hb-btn--primary" href={slide.cta.href}>
                {slide.cta.label}
              </a>
              <a className="hb-btn hb-btn--ghost" href={slide.alt.href}>
                {slide.alt.label}
              </a>
            </div>
          </div>

          <div className="hb-visual">
            <div className="hb-frame">
              {!broken[index] && (
                <img
                  className="hb-img"
                  src={slide.image}
                  alt={slide.imageAlt}
                  onError={() => setBroken((b) => ({ ...b, [index]: true }))}
                />
              )}
            </div>
            <div className="hb-sticker" aria-hidden="true">
              <span>{slide.badge}</span>
            </div>
          </div>
        </div>

        {/* controls */}
        <div className="hb-controls">
          <button className="hb-arrow" onClick={() => go(index - 1)} aria-label="Previous slide">
            ‹
          </button>

          <div className="hb-dots" role="tablist" aria-label="Choose slide">
            {SLIDES.map((s, i) => (
              <button
                key={s.badge}
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}: ${s.badge}`}
                className={`hb-pip${i === index ? " is-active" : ""}`}
                onClick={() => go(i)}
              >
                {i === index && (
                  <span
                    className="hb-fill"
                    style={{
                      animationDuration: `${AUTOPLAY_MS}ms`,
                      animationPlayState: paused ? "paused" : "running",
                    }}
                    onAnimationEnd={() => go(index + 1)}
                  />
                )}
              </button>
            ))}
          </div>

          <button className="hb-arrow" onClick={() => go(index + 1)} aria-label="Next slide">
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------- Styles (self-contained, no Tailwind needed) ---------- */
const css = `
.hb{
  --hb-purple:#4a148c;
  --hb-purple-deep:#2e0a5e;
  --hb-yellow:#ffc107;
  --hb-lavender:#f1e8fb;
  padding:20px 16px 8px;
  font-family:inherit;
}
.hb *{box-sizing:border-box}
.hb-card{
  position:relative;
  max-width:1280px;
  margin:0 auto;
  min-height:480px;
  border-radius:32px;
  overflow:hidden;
  color:#fff;
  background:
    radial-gradient(900px 500px at 85% 20%, #7b2fc9 0%, transparent 60%),
    linear-gradient(135deg,var(--hb-purple) 0%,var(--hb-purple-deep) 100%);
  box-shadow:0 30px 60px -30px rgba(46,10,94,.7);
}

/* layout */
.hb-slide{
  position:relative;
  z-index:2;
  display:grid;
  grid-template-columns:1.05fr .95fr;
  align-items:center;
  gap:32px;
  padding:56px 64px 88px;
  min-height:480px;
}
.hb-copy{max-width:560px}

/* badge */
.hb-badge{
  display:inline-block;
  margin:0 0 18px;
  padding:6px 14px;
  border-radius:999px;
  background:rgba(255,193,7,.16);
  border:1px solid rgba(255,193,7,.55);
  color:var(--hb-yellow);
  font-size:14px;
  font-weight:600;
  animation:hb-pop .6s cubic-bezier(.2,1.4,.4,1) both;
}

/* headline: lines slide up from behind a mask (the main entrance) */
.hb-title{
  margin:0 0 18px;
  font-family:"Fraunces","Playfair Display",Georgia,serif;
  font-weight:700;
  font-size:clamp(34px,5vw,60px);
  line-height:1.05;
  letter-spacing:-.01em;
}
.hb-mask{display:block;overflow:hidden;padding-bottom:.08em}
.hb-line{display:block;transform:translateY(110%);animation:hb-rise .85s cubic-bezier(.2,.8,.2,1) forwards}
.hb-mask:last-child .hb-line{color:var(--hb-yellow)}

.hb-text{
  margin:0 0 28px;
  max-width:46ch;
  font-size:17px;
  line-height:1.6;
  color:rgba(255,255,255,.86);
  opacity:0;
  animation:hb-fade .7s .55s ease forwards;
}
.hb-actions{display:flex;flex-wrap:wrap;gap:12px;opacity:0;animation:hb-fade .7s .7s ease forwards}

/* buttons */
.hb-btn{
  display:inline-flex;align-items:center;justify-content:center;
  padding:14px 26px;border-radius:999px;
  font-weight:700;font-size:15px;text-decoration:none;
  transition:transform .2s ease, box-shadow .2s ease, background .2s ease;
}
.hb-btn--primary{background:var(--hb-yellow);color:#2b1700;box-shadow:0 10px 24px -10px rgba(255,193,7,.9)}
.hb-btn--primary:hover{transform:translateY(-2px);box-shadow:0 16px 28px -10px rgba(255,193,7,1)}
.hb-btn--ghost{color:#fff;border:1.5px solid rgba(255,255,255,.5)}
.hb-btn--ghost:hover{background:rgba(255,255,255,.12)}
.hb-btn:focus-visible,.hb-arrow:focus-visible,.hb-pip:focus-visible{outline:3px solid #fff;outline-offset:3px}

/* image: arch frame, slow zoom, floating sticker */
.hb-visual{position:relative;display:flex;justify-content:center}
.hb-frame{
  position:relative;
  width:min(100%,380px);
  aspect-ratio:4/5;
  border-radius:999px 999px 28px 28px;
  overflow:hidden;
  background:linear-gradient(160deg,#8e44d6,#5b1a9b);
  border:6px solid rgba(255,255,255,.92);
  box-shadow:0 30px 50px -25px rgba(0,0,0,.6);
  animation:hb-arch .9s cubic-bezier(.2,.8,.2,1) both, hb-bob 6s 1s ease-in-out infinite;
}
.hb-img{width:100%;height:100%;object-fit:cover;display:block;animation:hb-zoom 8s ease-out both}

.hb-sticker{
  position:absolute;
  right:2%;bottom:10%;
  width:104px;height:104px;
  display:grid;place-items:center;
  text-align:center;
  padding:12px;
  border-radius:50%;
  background:var(--hb-yellow);
  color:#2b1700;
  font-weight:800;
  font-size:15px;
  line-height:1.15;
  box-shadow:0 12px 24px -8px rgba(0,0,0,.5);
  animation:hb-stick .7s .6s cubic-bezier(.2,1.5,.4,1) both, hb-wobble 5s 1.4s ease-in-out infinite;
}

/* decorative background shapes */
.hb-dot,.hb-ring{position:absolute;z-index:1;pointer-events:none}
.hb-dot{border-radius:50%;background:var(--hb-yellow);opacity:.9}
.hb-dot--1{width:14px;height:14px;top:14%;left:46%;animation:hb-float 7s ease-in-out infinite}
.hb-dot--2{width:9px;height:9px;bottom:22%;left:52%;background:#fff;opacity:.6;animation:hb-float 9s 1s ease-in-out infinite}
.hb-dot--3{width:18px;height:18px;top:10%;right:6%;background:#ff7eb6;animation:hb-float 8s .5s ease-in-out infinite}
.hb-ring{width:260px;height:260px;left:-80px;bottom:-90px;border-radius:50%;border:34px solid rgba(255,193,7,.14);animation:hb-spin 40s linear infinite}

/* controls */
.hb-controls{
  position:absolute;z-index:3;left:0;right:0;bottom:24px;
  display:flex;align-items:center;justify-content:center;gap:16px;
}
.hb-arrow{
  width:42px;height:42px;border-radius:50%;
  border:1.5px solid rgba(255,255,255,.45);
  background:rgba(255,255,255,.1);
  color:#fff;font-size:24px;line-height:1;cursor:pointer;
  transition:background .2s ease, transform .2s ease;
}
.hb-arrow:hover{background:var(--hb-yellow);color:#2b1700;transform:scale(1.08)}
.hb-dots{display:flex;gap:8px;align-items:center}
.hb-pip{
  position:relative;width:12px;height:12px;padding:0;border:0;border-radius:999px;
  background:rgba(255,255,255,.4);cursor:pointer;overflow:hidden;
  transition:width .35s ease;
}
.hb-pip.is-active{width:56px}
.hb-fill{position:absolute;inset:0;background:var(--hb-yellow);transform-origin:left;transform:scaleX(0);animation:hb-progress linear forwards}

/* keyframes */
@keyframes hb-rise{to{transform:translateY(0)}}
@keyframes hb-fade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes hb-pop{from{opacity:0;transform:scale(.7)}to{opacity:1;transform:none}}
@keyframes hb-arch{from{opacity:0;transform:translateY(40px) scale(.94)}to{opacity:1;transform:none}}
@keyframes hb-zoom{from{transform:scale(1.18)}to{transform:scale(1)}}
@keyframes hb-bob{0%,100%{translate:0 0}50%{translate:0 -10px}}
@keyframes hb-stick{from{opacity:0;transform:scale(0) rotate(-40deg)}to{opacity:1;transform:scale(1) rotate(-10deg)}}
@keyframes hb-wobble{0%,100%{rotate:0deg}50%{rotate:8deg}}
@keyframes hb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
@keyframes hb-spin{to{transform:rotate(360deg)}}
@keyframes hb-progress{to{transform:scaleX(1)}}

/* tablet and mobile */
@media (max-width:900px){
  .hb-card{border-radius:24px}
  .hb-slide{grid-template-columns:1fr;gap:20px;padding:32px 24px 92px;text-align:center}
  .hb-copy{max-width:none;display:flex;flex-direction:column;align-items:center}
  .hb-visual{order:-1}
  .hb-frame{width:min(70%,260px)}
  .hb-sticker{width:84px;height:84px;font-size:12px;right:12%}
  .hb-text{font-size:15px}
  .hb-dot--1{left:12%}
}

/* respect reduced motion: no autoplay, no movement */
@media (prefers-reduced-motion:reduce){
  .hb *{animation:none !important;transition:none !important}
  .hb-line,.hb-text,.hb-actions{transform:none !important;opacity:1 !important}
  .hb-fill{transform:scaleX(1)}
}
`;