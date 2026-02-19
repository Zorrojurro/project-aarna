import { useState } from 'react'
import { useAarnaContext } from '../context/AarnaContext'

interface DeveloperProps {
    demo: boolean
}

export default function Developer({ demo }: DeveloperProps) {
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

    const myProjects = aarna.projects

    return (
        <div className="page-enter pt-24 min-h-screen px-4 sm:px-6">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold">
                        🔬 Developer <span className="text-ocean-400">Dashboard</span>
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Submit blue carbon projects for on-chain verification and carbon credit issuance.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* ── Left: Setup + Submit ── */}
                    <div className="space-y-6">
                        {/* Deploy & Token Setup */}
                        <div className="glass-card p-6">
                            <h2 className="text-lg font-bold text-gray-200 mb-4">⚡ Setup</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={aarna.deploy}
                                    disabled={aarna.busy}
                                    className="rounded-xl bg-gradient-to-r from-ocean-600 to-ocean-700 px-4 py-3 font-semibold text-white shadow-lg shadow-ocean-600/20 hover:shadow-ocean-600/40 transition-all disabled:opacity-50"
                                >
                                    {aarna.busy ? 'Working…' : '🚀 Deploy Contract'}
                                </button>
                                <button
                                    onClick={aarna.ensureToken}
                                    disabled={aarna.busy}
                                    className="rounded-xl bg-gradient-to-r from-seagrass-600 to-seagrass-700 px-4 py-3 font-semibold text-white shadow-lg shadow-seagrass-600/20 hover:shadow-seagrass-600/40 transition-all disabled:opacity-50"
                                >
                                    🪙 Create AARNA Token
                                </button>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm">
                                    <span className="text-gray-500">App ID:</span>{' '}
                                    <span className="text-ocean-300 font-mono">{aarna.appId?.toString() || '—'}</span>
                                </div>
                                <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm">
                                    <span className="text-gray-500">ASA:</span>{' '}
                                    <span className="text-seagrass-300 font-mono">{aarna.assetId?.toString() || '—'}</span>
                                </div>
                            </div>

                            <button
                                onClick={aarna.optInToAsset}
                                disabled={aarna.busy}
                                className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 transition-all disabled:opacity-50"
                            >
                                📥 Opt-in to AARNA Token (as receiver)
                            </button>
                        </div>

                        {/* Submit Form */}
                        <form onSubmit={handleSubmit} className="glass-card p-6">
                            <h2 className="text-lg font-bold text-gray-200 mb-4">📋 Submit New Project</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Project Name</label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Sundarbans Mangrove Restoration"
                                        className="w-full rounded-lg border border-white/10 bg-[#0b1222] px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-ocean-500 focus:outline-none focus:ring-1 focus:ring-ocean-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Location</label>
                                    <input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="e.g. West Bengal, India"
                                        className="w-full rounded-lg border border-white/10 bg-[#0b1222] px-4 py-2.5 text-sm text-gray-200 placeholder:text-gray-600 focus:border-ocean-500 focus:outline-none focus:ring-1 focus:ring-ocean-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Ecosystem Type</label>
                                    <select
                                        value={ecosystem}
                                        onChange={(e) => setEcosystem(e.target.value)}
                                        className="w-full rounded-lg border border-white/10 bg-[#0b1222] px-4 py-2.5 text-sm text-gray-200 focus:border-ocean-500 focus:outline-none"
                                    >
                                        <option>Mangrove</option>
                                        <option>Seagrass</option>
                                        <option>Wetland</option>
                                        <option>Salt Marsh</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">IPFS CID (evidence hash)</label>
                                    <input
                                        value={cid}
                                        onChange={(e) => setCid(e.target.value)}
                                        placeholder="bafy..."
                                        className="w-full rounded-lg border border-white/10 bg-[#0b1222] px-4 py-2.5 text-sm font-mono text-gray-200 placeholder:text-gray-600 focus:border-ocean-500 focus:outline-none focus:ring-1 focus:ring-ocean-500/30"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={aarna.busy || !name || !cid}
                                    className="w-full rounded-xl bg-gradient-to-r from-ocean-600 to-seagrass-600 px-4 py-3 font-semibold text-white shadow-lg shadow-ocean-600/20 hover:shadow-ocean-600/40 transition-all disabled:opacity-40"
                                >
                                    📤 Submit Project On-Chain
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ── Right: My Projects ── */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-bold text-gray-200 mb-4">📦 My Submitted Projects</h2>
                        {myProjects.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <span className="text-5xl mb-4">🌱</span>
                                <p className="text-gray-400">No projects submitted yet.</p>
                                <p className="text-sm text-gray-500 mt-1">Fill out the form and submit your first blue carbon project!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myProjects.map((p) => (
                                    <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-medium text-gray-200">{p.name}</div>
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
                                        <div className="text-xs text-gray-500">
                                            {p.location} · {p.ecosystem}
                                            {p.credits > 0 && <> · <span className="text-seagrass-400">{p.credits} credits</span></>}
                                        </div>
                                        <div className="mt-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono text-ocean-400 break-all">
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
