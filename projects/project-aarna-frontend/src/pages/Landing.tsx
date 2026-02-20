import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useMotionValue, useMotionTemplate, motion } from 'framer-motion'
import { generateRandomString } from '@/components/ui/evervault-card'

/* ─── D-MRV Step Card with EvervaultCard hover effect ─── */
function DmrvStepCard({ step, title, desc, color }: { step: string; title: string; desc: string; color: string }) {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const [randomString, setRandomString] = useState('')
    const [hovered, setHovered] = useState(false)

    useEffect(() => {
        setRandomString(generateRandomString(800))
    }, [])

    const onMouseMove = useCallback(({ currentTarget, clientX, clientY }: React.MouseEvent) => {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
        setRandomString(generateRandomString(800))
    }, [mouseX, mouseY])

    const maskImage = useMotionTemplate`radial-gradient(200px at ${mouseX}px ${mouseY}px, white, transparent)`
    const maskStyle = { maskImage, WebkitMaskImage: maskImage }

    return (
        <div
            className="g-card p-5 text-center flex-1 relative overflow-hidden cursor-default group/step"
            onMouseMove={onMouseMove}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* EvervaultCard-style hover pattern layer */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl">
                <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover/step:opacity-100 backdrop-blur-xl transition duration-500"
                    style={{
                        ...maskStyle,
                        background: `linear-gradient(135deg, ${color}40, ${color}15)`,
                    }}
                />
                <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay group-hover/step:opacity-100"
                    style={maskStyle}
                >
                    <p className="absolute inset-x-0 text-[10px] h-full break-words whitespace-pre-wrap font-mono font-bold transition duration-500"
                        style={{ color: `${color}60` }}>
                        {randomString}
                    </p>
                </motion.div>
            </div>

            {/* Card content — always on top */}
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-sm font-bold mb-3"
                    style={{ background: `${color}15`, border: `1.5px solid ${color}40`, color }}>
                    {step}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-muted text-xs leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

/* ─── Inline SVG components for marine life ─── */

/** Hokusai wave art — uses the actual Great Wave illustration */
function WaveArt() {
    return (
        <div className="wave-art" style={{ top: 0 }}>
            <div className="wl-1" style={{ position: 'relative' }}>
                <img
                    src="/hokusai-wave.jpg"
                    alt=""
                    aria-hidden="true"
                    style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        opacity: 0.75,
                        mixBlendMode: 'multiply',
                        filter: 'contrast(1.2) saturate(1.3) brightness(0.9)',
                        maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
                    }}
                />
            </div>
        </div>
    )
}

/** Tropical fish silhouette SVG */
function FishSvg({ size = 48, className = '' }: { size?: number; className?: string }) {
    return (
        <svg width={size} height={size * 0.5} viewBox="0 0 60 30" className={className}>
            <path d="M5,15 C10,5 25,2 38,8 C42,10 48,12 55,15 C48,18 42,20 38,22 C25,28 10,25 5,15 Z M42,15 L50,10 L50,20 Z" />
            <circle cx="15" cy="14" r="1.5" fill="rgba(255,255,255,0.3)" />
        </svg>
    )
}

/** Sea turtle silhouette */
function TurtleSvg({ size = 100, className = '' }: { size?: number; className?: string }) {
    return (
        <svg width={size} height={size * 0.65} viewBox="0 0 120 78" className={className}>
            {/* shell */}
            <ellipse cx="60" cy="40" rx="30" ry="22" />
            {/* head */}
            <ellipse cx="95" cy="36" rx="10" ry="7" />
            <circle cx="100" cy="34" r="1.5" fill="rgba(255,255,255,0.2)" />
            {/* flippers */}
            <path d="M40,25 C30,10 20,12 18,18 C16,24 30,28 40,25 Z" />
            <path d="M40,55 C30,68 20,66 18,60 C16,54 30,50 40,55 Z" />
            <path d="M80,25 C88,14 95,16 96,22 C97,28 85,28 80,25 Z" />
            <path d="M80,55 C88,64 95,62 96,56 C97,50 85,50 80,55 Z" />
            {/* tail */}
            <path d="M30,40 C22,40 18,38 16,40 C18,42 22,40 30,40 Z" />
            {/* shell pattern */}
            <path d="M50,25 L55,38 L50,55" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
            <path d="M65,24 L62,38 L65,55" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
        </svg>
    )
}

/** Jellyfish silhouette */
function JellySvg({ size = 60, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
    return (
        <svg width={size} height={size * 1.4} viewBox="0 0 50 70" className={className} style={style}>
            {/* bell */}
            <path d="M5,30 C5,10 15,2 25,2 C35,2 45,10 45,30 C40,33 35,32 30,33 C25,34 20,33 15,32 C10,31 5,33 5,30 Z" />
            {/* tentacles */}
            <path d="M12,33 C14,42 10,52 12,62" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
            <path d="M20,34 C22,45 18,55 20,65" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <path d="M28,34 C26,46 30,56 28,66" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
            <path d="M36,33 C34,43 38,53 36,63" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        </svg>
    )
}

/** Kelp/seaweed frond */
function KelpSvg({ height = 200, className = '', style }: { height?: number; className?: string; style?: React.CSSProperties }) {
    return (
        <svg width={height * 0.15} height={height} viewBox="0 0 30 200" className={className} style={style}>
            <path
                d="M15,200 C15,180 10,160 14,140 C18,120 8,100 13,80 C18,60 10,40 14,20 C16,10 15,5 15,0"
                fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            />
            {/* leaves */}
            <path d="M14,140 C8,135 4,125 8,120 C10,118 12,130 14,140 Z" fill="currentColor" opacity="0.6" />
            <path d="M14,100 C20,95 24,85 20,80 C18,78 16,90 14,100 Z" fill="currentColor" opacity="0.5" />
            <path d="M13,60 C7,55 5,45 9,42 C11,40 12,52 13,60 Z" fill="currentColor" opacity="0.4" />
        </svg>
    )
}

/** Thin-line icon components (Lucide-style) */
function IconShield() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    )
}
function IconCoin() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00E5CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 6v12M9 9h6M9 15h6" />
        </svg>
    )
}
function IconLeaf() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L12 14" />
            <path d="M21 3c-4 0-8.5 2-12 5 2 4 6.5 7.3 12 5 1-4 0-7.5-0-10z" />
        </svg>
    )
}
function IconGlobe() {
    return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006994" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    )
}

/* ─── Main Landing Component ─── */
export default function Landing() {
    useEffect(() => {
        const obs = new IntersectionObserver(
            (es) => es.forEach((e) => { if (e.isIntersecting) e.target.classList.add('vis') }),
            { threshold: 0.12 }
        )
        document.querySelectorAll('.reveal-up, .stagger-kids').forEach((el) => obs.observe(el))
        return () => obs.disconnect()
    }, [])

    return (
        <div style={{ overflowX: 'hidden' }}>
            {/* ═══ Fixed bubbles ═══ */}
            <div className="bubbles-bg">
                {[12, 20, 8, 16, 24, 10, 18, 6, 14, 22].map((s, i) => (
                    <div key={i} className="bub" style={{
                        left: `${5 + i * 9.5}%`, width: s, height: s,
                        animationDuration: `${8 + i * 1.8}s`, animationDelay: `${i * 1.2}s`
                    }} />
                ))}
            </div>


            {/* ─────────────────────────────────────────────
          ZONE 1 · SURFACE — Hokusai Wave Hero
      ───────────────────────────────────────────── */}
            <section className="z-surface relative" style={{ minHeight: '100vh' }}>
                {/* Japanese wave art */}
                <WaveArt />

                {/* Marine creatures appear BELOW the wave art */}

                {/* Sun glow — larger and warmer */}
                <div className="absolute" style={{
                    top: '-12%', left: '50%', transform: 'translateX(-50%)',
                    width: 900, height: 900, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,233,170,0.18) 0%, rgba(255,220,130,0.06) 40%, transparent 70%)',
                    pointerEvents: 'none', zIndex: 0
                }} />

                {/* Hero content */}
                <div className="relative flex flex-col items-center justify-center text-center px-6" style={{ minHeight: '100vh', zIndex: 10 }}>
                    <div className="reveal-up">
                        <span className="pill-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            Decentralized MRV on Algorand
                        </span>
                    </div>

                    <h1 className="reveal-up font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mt-8 leading-tight" style={{ letterSpacing: '-0.03em', textShadow: '0 2px 30px rgba(0,0,0,0.5), 0 0 60px rgba(0,105,148,0.3)' }}>
                        <span className="sheen-text-hero">Blue Carbon,</span>
                        <br />
                        <span className="text-accent" style={{ textShadow: '0 0 40px rgba(0,229,204,0.5)' }}>Verified On-Chain</span>
                    </h1>

                    <p className="reveal-up mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium" style={{ color: '#ffffff', textShadow: '0 1px 20px rgba(0,0,0,0.6)' }}>
                        India's first decentralized MRV platform — monitoring, reporting, and verifying coastal ecosystem restoration on Algorand.
                    </p>

                    <div className="reveal-up flex flex-wrap gap-4 mt-10 justify-center">
                        <Link to="/registry" className="btn-primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /></svg>
                            Explore the Registry
                        </Link>
                        <Link to="/developer" className="btn-ghost">
                            For Developers
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </Link>
                    </div>

                    <div className="reveal-up mt-20 flex flex-col items-center text-sm" style={{ color: '#7A9AB0', animation: 'scrollHint 2s ease-in-out infinite' }}>
                        <span>Scroll to explore</span>
                        <svg width="16" height="16" className="mt-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                    </div>
                </div>

                {/* Underwater transition — wave meets ocean */}
                <div className="absolute bottom-0 left-0 w-full" style={{ zIndex: 5 }}>
                    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 100 }}>
                        <path fill="#005A7E" fillOpacity="0.2" d="M0,40 C240,80 480,20 720,55 C960,85 1200,30 1440,50 L1440,120 L0,120 Z" />
                        <path fill="#005A7E" fillOpacity="0.5" d="M0,60 C360,90 720,40 1080,65 C1260,80 1380,55 1440,62 L1440,120 L0,120 Z" />
                        <path fill="#005A7E" d="M0,80 C360,95 720,72 1080,88 C1320,96 1400,82 1440,86 L1440,120 L0,120 Z" />
                    </svg>
                    {/* Fish swimming at the waterline */}
                    <div className="marine-layer" style={{ top: '-60px', height: '80px' }}>
                        <FishSvg size={55} className="svg-fish fish-a" />
                        <FishSvg size={40} className="svg-fish fish-d" />
                    </div>
                </div>
            </section>


            {/* ─────────────────────────────────────────────
          ZONE 2 · SHALLOW WATERS — Impact Stats
      ───────────────────────────────────────────── */}
            <section className="z-shallow relative" style={{ padding: '100px 0 120px' }}>
                {/* Sun rays */}
                <div className="sun-rays">
                    {[10, 28, 52, 72, 88].map((l, i) => (
                        <div key={i} className="ray" style={{ left: `${l}%`, width: 60 + i * 15, animationDelay: `${i * 0.8}s` }} />
                    ))}
                </div>

                {/* ── Fish BEHIND cards ── */}
                <div className="marine-layer" style={{ zIndex: 1 }}>
                    <FishSvg size={70} className="svg-fish fish-a" />
                    <FishSvg size={55} className="svg-fish fish-c" />
                </div>

                {/* Content (z-index: 10) */}
                <div className="relative max-w-6xl mx-auto px-6" style={{ zIndex: 10 }}>
                    <div className="reveal-up text-center mb-14">
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                            Problems We <span className="text-accent">Solve</span>
                        </h2>
                        <p className="mt-3 text-muted text-base sm:text-lg">
                            India's blue carbon ecosystems face critical threats — Aarna brings transparency and accountability
                        </p>
                    </div>

                    <div className="stagger-kids grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[
                            {
                                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>,
                                title: 'Opaque Carbon Markets',
                                desc: 'Carbon credits are traded without verifiable proof of ecosystem impact — leading to fraud and greenwashing.',
                                color: '#FF6B6B',
                            },
                            {
                                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD93D" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
                                title: 'Slow Manual MRV',
                                desc: 'Traditional MRV takes months of paperwork — Aarna automates verification with blockchain-backed transparency.',
                                color: '#FFD93D',
                            },
                            {
                                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00E5CC" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>,
                                title: 'Communities Left Out',
                                desc: 'Coastal communities doing restoration work rarely see fair compensation — Aarna ensures direct, traceable credit issuance.',
                                color: '#00E5CC',
                            },
                            {
                                icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9F7AEA" strokeWidth="1.5" strokeLinecap="round"><path d="M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /></svg>,
                                title: 'Zero Accountability',
                                desc: 'No public audit trail means bad actors go unchecked — every Aarna action is permanently recorded on Algorand.',
                                color: '#9F7AEA',
                            },
                        ].map((s, i) => (
                            <div key={i} className="g-card hover-card p-6 text-center">
                                <div className="w-14 h-14 rounded-xl mx-auto flex items-center justify-center mb-4" style={{ background: `${s.color}12`, border: `1px solid ${s.color}30` }}>
                                    {s.icon}
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                                <p className="text-muted text-xs leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Fish IN FRONT of cards (overlapping, 3D effect) ── */}
                <div className="marine-layer fish-front">
                    <FishSvg size={60} className="svg-fish fish-b" />
                    <FishSvg size={45} className="svg-fish fish-d" />
                </div>
            </section>


            {/* ─────────────────────────────────────────────
          ZONE 3 · MID OCEAN — Blue Carbon Explainer
      ───────────────────────────────────────────── */}
            <section className="z-mid relative" style={{ padding: '100px 0 140px' }}>
                {/* Bio-luminescent dots */}
                <div className="marine-layer">
                    {[
                        { t: '8%', l: '12%', d: 0, s: 5 }, { t: '22%', l: '45%', d: 1.2, s: 4 },
                        { t: '38%', l: '78%', d: 0.6, s: 6 }, { t: '55%', l: '20%', d: 2, s: 3 },
                        { t: '70%', l: '65%', d: 1.5, s: 5 }, { t: '82%', l: '90%', d: 0.3, s: 4 },
                        { t: '15%', l: '88%', d: 2.5, s: 3 }, { t: '60%', l: '8%', d: 1.8, s: 4 },
                    ].map((d, i) => (
                        <div key={i} className="bio-dot" style={{
                            top: d.t, left: d.l, width: d.s, height: d.s,
                            animationDelay: `${d.d}s`, animationDuration: `${3 + i * 0.5}s`
                        }} />
                    ))}
                </div>

                {/* ── Turtle BEHIND cards ── */}
                <div className="marine-layer" style={{ zIndex: 1 }}>
                    <TurtleSvg size={110} className="svg-turtle" />
                </div>

                {/* ── Jellyfish at various z-indices ── */}
                <div className="marine-layer" style={{ zIndex: 1 }}>
                    <JellySvg size={50} className="svg-jelly" style={{ top: '18%', right: '15%', animationDelay: '0s' }} />
                </div>

                {/* Content (z-index: 10) */}
                <div className="relative max-w-6xl mx-auto px-6" style={{ zIndex: 10 }}>
                    <div className="reveal-up text-center mb-14">
                        <h2 className="font-display text-3xl sm:text-5xl font-bold text-white">
                            What is <span className="text-accent">Blue Carbon</span>?
                        </h2>
                        <p className="mt-4 text-muted text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
                            Coastal and marine ecosystems — mangroves, seagrass, and wetlands — capture carbon <strong style={{ color: '#10B981' }}>up to 10× faster</strong> than terrestrial forests.
                            They cover less than 2% of total ocean area but store <strong style={{ color: '#00E5CC' }}>over 50%</strong> of all marine carbon. Protecting them is humanity's most powerful climate lever.
                        </p>
                    </div>

                    {/* Key stat banner */}
                    <div className="reveal-up mb-10">
                        <div className="g-card p-6 md:p-8" style={{ background: 'linear-gradient(135deg, rgba(0,229,204,0.08), rgba(16,185,129,0.05), rgba(0,105,148,0.08))' }}>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl sm:text-4xl font-bold font-display text-accent">83%</div>
                                    <div className="text-xs sm:text-sm text-muted mt-1">of global carbon cycle passes through oceans</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-4xl font-bold font-display text-seagrass">4×</div>
                                    <div className="text-xs sm:text-sm text-muted mt-1">faster carbon capture than rainforests</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-4xl font-bold font-display" style={{ color: '#9F7AEA' }}>$150B</div>
                                    <div className="text-xs sm:text-sm text-muted mt-1">projected blue carbon market by 2030</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="stagger-kids grid md:grid-cols-3 gap-6">
                        {[
                            {
                                title: 'Mangroves',
                                stat: '4× faster carbon sequestration',
                                desc: 'Coastal forests with dense root systems that act as natural storm barriers while capturing CO₂ at rates far exceeding tropical rainforests. India has 4,975 km² of mangrove cover.',
                                color: '#10B981',
                                icon: (
                                    <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="#10B981" strokeWidth="1.3">
                                        <path d="M20,38 L20,15" />
                                        <path d="M20,15 C15,10 8,8 5,12 C3,14 8,18 15,15 C12,10 10,5 14,3 C17,1 19,8 20,15 Z" />
                                        <path d="M20,15 C25,10 32,8 35,12 C37,14 32,18 25,15 C28,10 30,5 26,3 C23,1 21,8 20,15 Z" />
                                        <path d="M17,38 C14,36 10,35 8,36" /><path d="M23,38 C26,36 30,35 32,36" />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Seagrass Meadows',
                                stat: '10% of ocean carbon storage',
                                desc: 'Underwater grasslands covering less than 0.2% of the ocean floor yet responsible for a significant fraction of total marine carbon sequestration.',
                                color: '#00E5CC',
                                icon: (
                                    <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="#00E5CC" strokeWidth="1.3">
                                        <path d="M10,38 C12,28 8,18 12,8" /><path d="M18,38 C16,25 20,15 17,5" />
                                        <path d="M25,38 C27,26 23,16 26,6" /><path d="M32,38 C30,30 34,20 31,10" />
                                    </svg>
                                ),
                            },
                            {
                                title: 'Coastal Wetlands',
                                stat: 'Natural coastal protection',
                                desc: 'Tidal marshes that filter water, protect shorelines from erosion and storms while storing massive quantities of CO₂ in nutrient-rich soils.',
                                color: '#006994',
                                icon: (
                                    <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="#006994" strokeWidth="1.3">
                                        <path d="M5,25 C10,23 15,20 20,22 C25,24 30,20 35,22" />
                                        <path d="M5,30 C12,28 18,25 25,28 C30,30 35,27 38,28" />
                                        <path d="M8,35 C15,33 22,30 30,33 C35,34 38,32 40,33" />
                                        <path d="M15,22 L15,10 M15,10 C12,8 10,5 13,4 C15,3 16,7 15,10 Z" />
                                        <path d="M28,20 L28,8 M28,8 C25,6 24,3 27,2 C29,1 30,5 28,8 Z" />
                                    </svg>
                                ),
                            },
                        ].map((item, i) => (
                            <div key={i} className="g-card hover-card p-7 group cursor-default">
                                <div className="mb-5 flex justify-center transition-transform duration-500 group-hover:scale-110">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg font-bold text-white text-center mb-2">{item.title}</h3>
                                <p className="text-muted text-sm text-center leading-relaxed">{item.desc}</p>
                                <div className="mt-5 rounded-lg p-3 text-center" style={{ background: `${item.color}08`, border: `1px solid ${item.color}15` }}>
                                    <div className="text-sm font-semibold" style={{ color: item.color }}>{item.stat}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Turtle + jellyfish IN FRONT (overlapping cards → 3D) ── */}
                <div className="marine-layer turtle-front">
                    <JellySvg size={55} className="svg-jelly" style={{ top: '40%', left: '5%', animationDelay: '2s' }} />
                    <JellySvg size={45} className="svg-jelly" style={{ top: '65%', right: '8%', animationDelay: '3s' }} />
                    <TurtleSvg size={120} className="svg-turtle" />
                </div>
            </section>


            {/* ─────────────────────────────────────────────
          ZONE 4 · DEEP OCEAN — D-MRV Workflow
      ───────────────────────────────────────────── */}
            <section className="z-deep relative" style={{ padding: '100px 0 120px' }}>
                {/* Deep glow spots */}
                <div className="marine-layer">
                    {[
                        { t: '10%', l: '20%', d: 0, s: 4 }, { t: '30%', l: '70%', d: 1.5, s: 5 },
                        { t: '50%', l: '40%', d: 0.8, s: 3 }, { t: '75%', l: '85%', d: 2.2, s: 4 },
                        { t: '20%', l: '90%', d: 1, s: 3 }, { t: '65%', l: '15%', d: 2.8, s: 5 },
                    ].map((d, i) => (
                        <div key={i} className="bio-dot" style={{
                            top: d.t, left: d.l, width: d.s, height: d.s,
                            animationDelay: `${d.d}s`, animationDuration: `${4 + i * 0.6}s`
                        }} />
                    ))}
                </div>

                <div className="relative max-w-6xl mx-auto px-6" style={{ zIndex: 10 }}>
                    <div className="reveal-up text-center mb-14">
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
                            How D-MRV Works <span className="text-accent">on Algorand</span>
                        </h2>
                        <p className="mt-3 text-muted text-base sm:text-lg">
                            Decentralized Measurement, Reporting & Verification — fully transparent and immutable
                        </p>
                    </div>

                    {/* Zigzag timeline layout */}
                    <div className="relative stagger-kids">
                        {/* Central timeline line — desktop only */}
                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px" style={{
                            background: 'linear-gradient(to bottom, transparent, rgba(0,229,204,0.25) 10%, rgba(0,229,204,0.25) 90%, transparent)',
                        }} />

                        {[
                            {
                                step: '01', title: 'Submit Data', color: '#006994',
                                desc: 'Project developers upload evidence — satellite imagery, field reports, ecological surveys — to IPFS. The content hash (CID) is registered on-chain as a tamper-proof reference.',
                                icon: (
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#006994" strokeWidth="1.5" strokeLinecap="round">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                                    </svg>
                                ),
                            },
                            {
                                step: '02', title: 'Validator Review', color: '#9F7AEA',
                                desc: 'Authorized validators independently cross-reference the submitted evidence with satellite imagery. They verify carbon sequestration claims before casting their on-chain vote.',
                                icon: (
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#9F7AEA" strokeWidth="1.5" strokeLinecap="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                    </svg>
                                ),
                            },
                            {
                                step: '03', title: 'On-Chain Verification', color: '#10B981',
                                desc: 'The smart contract records approval immutably on Algorand. Project status transitions from "pending" to "verified" — publicly auditable by anyone, forever.',
                                icon: (
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
                                    </svg>
                                ),
                            },
                            {
                                step: '04', title: 'Issue Credits', color: '#00E5CC',
                                desc: 'AARNA tokens (ASA) are minted and transferred to the project developer — each token representing a verified, traceable blue carbon credit backed by real ecosystem data.',
                                icon: (
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00E5CC" strokeWidth="1.5" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="8" /><path d="M12 6v12M9 9h6M9 15h6" />
                                    </svg>
                                ),
                            },
                        ].map((s, i) => {
                            const isLeft = i % 2 === 0
                            return (
                                <div key={i} className={`flex flex-col md:flex-row items-center gap-6 md:gap-0 mb-14 last:mb-0 ${isLeft ? '' : 'md:flex-row-reverse'}`}>
                                    {/* Card side */}
                                    <div className={`w-full md:w-[46%] ${isLeft ? 'md:pr-12' : 'md:pl-12'}`}>
                                        <DmrvStepCard step={s.step} title={s.title} desc={s.desc} color={s.color} />
                                    </div>

                                    {/* Center dot on timeline */}
                                    <div className="hidden md:flex w-[8%] justify-center relative">
                                        <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{
                                            background: `${s.color}20`,
                                            border: `2px solid ${s.color}`,
                                            boxShadow: `0 0 20px ${s.color}30`,
                                        }}>
                                            <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                                        </div>
                                    </div>

                                    {/* Icon + mini label side */}
                                    <div className={`w-full md:w-[46%] ${isLeft ? 'md:pl-12' : 'md:pr-12'}`}>
                                        <div className={`flex items-center gap-5 ${isLeft ? '' : 'md:flex-row-reverse md:text-right'}`}>
                                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{
                                                background: `${s.color}08`,
                                                border: `1px solid ${s.color}20`,
                                            }}>
                                                {s.icon}
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: s.color }}>
                                                    Step {s.step}
                                                </div>
                                                <div className="text-sm text-muted leading-relaxed hidden md:block">
                                                    {s.desc.split('.')[0]}.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Trust badge with lock icon */}
                    <div className="reveal-up mt-14 text-center">
                        <div className="flex flex-col items-center gap-3">
                            {/* Lock icon */}
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,229,204,0.1)', border: '1px solid rgba(0,229,204,0.25)' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E5CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                            </div>
                            <div className="trust-pill inline-flex">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E5CC" strokeWidth="1.5">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                                <div className="text-left">
                                    <div className="text-white text-sm font-semibold">Powered by Algorand</div>
                                    <div className="text-muted text-xs">Carbon-negative Layer 1 · Instant finality · Low fees</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ─────────────────────────────────────────────
          ZONE 5 · OCEAN FLOOR — Footer with Kelp
      ───────────────────────────────────────────── */}
            <section className="z-floor relative" style={{ padding: '60px 0 40px' }}>
                {/* Sea plants / kelp behind footer */}
                <div className="marine-layer" style={{ zIndex: 1 }}>
                    {[
                        { l: '3%', h: 180, d: 0 }, { l: '10%', h: 240, d: 0.4 },
                        { l: '85%', h: 200, d: 0.8 }, { l: '92%', h: 260, d: 0.2 },
                        { l: '45%', h: 160, d: 1.2 },
                    ].map((k, i) => (
                        <KelpSvg key={i} height={k.h} className="svg-kelp" style={{
                            left: k.l, animationDelay: `${k.d}s`, animationDuration: `${4 + i * 0.8}s`, color: '#0D6B4A'
                        }} />
                    ))}
                </div>

                {/* Content */}
                <div className="relative max-w-6xl mx-auto px-6" style={{ zIndex: 10 }}>
                    <div className="grid md:grid-cols-4 gap-10">
                        <div className="md:col-span-2">
                            <h3 className="font-display text-xl font-bold text-white mb-3">
                                Project <span className="text-accent">Aarna</span>
                            </h3>
                            <p className="text-sm leading-relaxed" style={{ color: '#4A6070', maxWidth: 360 }}>
                                Decentralized MRV platform for India's blue carbon ecosystems.
                                Bringing transparency and accountability to carbon credit markets through blockchain technology.
                            </p>
                        </div>
                        <div>
                            <div className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: '#5A7080' }}>Platform</div>
                            <div className="flex flex-col gap-2">
                                <Link to="/" className="footer-link">Home</Link>
                                <Link to="/registry" className="footer-link">Registry</Link>
                                <Link to="/marketplace" className="footer-link">Marketplace</Link>
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: '#5A7080' }}>Resources</div>
                            <div className="flex flex-col gap-2">
                                <a href="https://algorand.co" target="_blank" rel="noopener noreferrer" className="footer-link">Algorand</a>
                                <a href="https://testnet.explorer.perawallet.app/" target="_blank" rel="noopener noreferrer" className="footer-link">Testnet Explorer</a>
                                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-link">Documentation</a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-10 pt-5 flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <span className="text-xs" style={{ color: '#3A4A55' }}>© 2026 Project Aarna</span>
                        <span className="text-xs" style={{ color: '#3A4A55' }}>Protecting India's Blue Carbon</span>
                    </div>
                </div>

                {/* Kelp fronds IN FRONT of footer (3D depth) */}
                <div className="marine-layer kelp-front">
                    <KelpSvg height={150} className="svg-kelp" style={{ left: '18%', animationDelay: '0.6s', color: '#0A5A3E' }} />
                    <KelpSvg height={130} className="svg-kelp" style={{ left: '75%', animationDelay: '1s', color: '#0A5A3E' }} />
                </div>

                {/* Sandy bottom */}
                <div className="absolute bottom-0 left-0 w-full" style={{ height: 30, background: 'linear-gradient(180deg, transparent, rgba(180,150,100,0.03))' }} />
            </section>
        </div>
    )
}
