import { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useAarnaContext } from '../context/AarnaContext'


function IconBeaker({ size = 20, color = '#006994' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 3h15" /><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3" /><path d="M6 14h12" />
        </svg>
    )
}
function IconZap({ size = 16, color = '#F59E0B' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    )
}
function IconRocket({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    )
}
function IconCoin({ size = 16, color = '#00E5CC' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" /><path d="M12 6v12M9 9h6M9 15h6" />
        </svg>
    )
}
function IconClipboard({ size = 16, color = '#006994' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
    )
}
function IconUpload({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    )
}
function IconDownload({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    )
}
function IconPackage({ size = 20, color = '#006994' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.5 9.4l-9-5.19" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
    )
}
function IconSprout({ size = 40, color = '#10B981' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 20h10" /><path d="M10 20c5.5-2.5.8-6.4 3-10" />
            <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
            <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
        </svg>
    )
}

export default function Developer() {
    const { activeAddress } = useWallet()
    const aarna = useAarnaContext()

    const [name, setName] = useState('')
    const [location, setLocation] = useState('')
    const [ecosystem, setEcosystem] = useState('Mangrove')
    const [cid, setCid] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !location || !cid) return
        const idx = await aarna.submitProject(name, location, ecosystem, cid)
        if (idx !== undefined) {
            setName('')
            setLocation('')
            setCid('')
        }
    }

    const myProjects = aarna.projects.filter(p => p.submitter === activeAddress)


    if (!activeAddress) {
        return (
            <div className="page-enter pt-24 min-h-screen px-4 sm:px-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="g-card" style={{ maxWidth: 420, textAlign: 'center', padding: '3rem 2rem' }}>
                    <IconSprout size={48} color="#10B981" />
                    <h2 style={{ color: 'white', fontSize: '1.5rem', marginTop: '1rem' }}>Connect Wallet</h2>
                    <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                        Connect your Algorand wallet to submit carbon credit projects.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="page-enter pt-24 min-h-screen px-4 sm:px-6">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
                        <IconBeaker size={28} color="#006994" />
                        Developer <span className="text-accent">Dashboard</span>
                    </h1>
                    <p className="mt-2 text-muted">
                        Submit blue carbon projects for on-chain verification and carbon credit issuance.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Setup + Submit */}
                    <div className="space-y-6">
                        {/* Deploy & Token Setup */}
                        <div className="g-card p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <IconZap size={18} color="#F59E0B" /> Setup
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={aarna.deploy}
                                    disabled={aarna.busy}
                                    className="btn-primary justify-center py-3 text-sm"
                                >
                                    <IconRocket size={16} />
                                    {aarna.busy ? 'Working…' : 'Deploy Contract'}
                                </button>
                                <button
                                    onClick={aarna.ensureToken}
                                    disabled={aarna.busy}
                                    className="rounded-xl px-4 py-3 font-semibold text-white text-sm shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #10B981, #0D6B4A)', boxShadow: '0 4px 20px rgba(16,185,129,0.2)' }}
                                >
                                    <IconCoin size={16} /> Create AARNA Token
                                </button>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm">
                                    <span className="text-muted">App ID:</span>{' '}
                                    <span className="text-accent font-mono">{aarna.appId?.toString() || '—'}</span>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm">
                                    <span className="text-muted">ASA:</span>{' '}
                                    <span className="text-seagrass font-mono">{aarna.assetId?.toString() || '—'}</span>
                                </div>
                            </div>

                            <button
                                onClick={aarna.optInToAsset}
                                disabled={aarna.busy}
                                className="btn-ghost w-full mt-3 justify-center py-2.5 text-sm"
                            >
                                <IconDownload size={16} /> Opt-in to AARNA Token (as receiver)
                            </button>
                        </div>


                        {/* Submit Form */}
                        <form onSubmit={handleSubmit} className="g-card p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <IconClipboard size={18} color="#006994" /> Submit New Project
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-muted mb-1">Project Name</label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Sundarbans Mangrove Restoration"
                                        className="w-full rounded-lg border border-white/10 bg-[#0b1222] px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-[#006994] focus:outline-none focus:ring-1 focus:ring-[#006994]/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted mb-1">Location</label>
                                    <input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. West Bengal, India"
                                        className="w-full rounded-lg border border-white/10 bg-[#0b1222] px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-[#006994] focus:outline-none focus:ring-1 focus:ring-[#006994]/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted mb-1">Ecosystem Type</label>
                                    <select
                                        value={ecosystem}
                                        onChange={(e) => setEcosystem(e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-[#0b1222] px-4 py-2.5 text-sm text-white focus:border-[#006994] focus:outline-none"
                                    >
                                        <option>Mangrove</option>
                                        <option>Seagrass</option>
                                        <option>Wetland</option>
                                        <option>Salt Marsh</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-muted mb-1">IPFS CID (evidence hash)</label>
                                    <input
                                        value={cid}
                                        onChange={(e) => setCid(e.target.value)}
                                        placeholder="bafy..."
                                        className="w-full rounded-lg border border-white/10 bg-[#0b1222] px-4 py-2.5 text-sm font-mono text-white placeholder:text-white/25 focus:border-[#006994] focus:outline-none focus:ring-1 focus:ring-[#006994]/30"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={aarna.busy || !name || !cid}
                                    className="btn-primary w-full justify-center py-3 text-sm"
                                >
                                    <IconUpload size={16} /> Submit Project On-Chain
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right: My Projects */}
                    <div className="g-card p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <IconPackage size={20} color="#006994" /> My Submitted Projects
                        </h2>
                        {myProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <IconSprout size={48} color="#10B981" />
                                <p className="text-muted mt-4">No projects submitted yet.</p>
                                <p className="text-sm text-muted mt-1" style={{ opacity: 0.7 }}>Fill out the form and submit your first blue carbon project!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myProjects.map((p) => (
                                    <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-white">{p.name}</div>
                                            {p.status === 'pending' && (
                                                <span className="badge-pending rounded-full px-3 py-1 text-xs font-semibold">Pending</span>
                                            )}
                                            {p.status === 'verified' && (
                                                <span className="badge-verified rounded-full px-3 py-1 text-xs font-semibold">Verified</span>
                                            )}
                                            {p.status === 'rejected' && (
                                                <span className="badge-rejected rounded-full px-3 py-1 text-xs font-semibold">Rejected</span>
                                            )}
                                            {p.status === 'issued' && (
                                                <span className="rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 text-xs font-semibold">Credited</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted">
                                            {p.location} · {p.ecosystem}
                                            {p.credits > 0 && <> · <span className="text-seagrass">{p.credits} credits</span></>}
                                        </div>
                                        <div className="mt-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono text-accent break-all" style={{ opacity: 0.8 }}>
                                            IPFS: {p.cid}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
