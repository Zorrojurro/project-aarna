import { useAarnaContext } from '../context/AarnaContext'

export default function Registry() {
    const aarna = useAarnaContext()
    const all = aarna.projects
    const verified = all.filter((p) => p.status === 'verified' || p.status === 'issued')
    const totalCredits = all.reduce((sum, p) => sum + p.credits, 0)

    return (
        <div className="page-enter pt-24 min-h-screen px-4 sm:px-6">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold">
                        🌍 Public <span className="text-ocean-400">Registry</span>
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Browse all blue carbon projects and their impact on the Indian coast.
                    </p>
                </div>

                {/* ── Impact Summary ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="glass-card stat-glow-blue p-5 text-center">
                        <div className="text-2xl font-bold text-ocean-300 font-display">{verified.length}</div>
                        <div className="text-xs text-gray-400 mt-1">Verified Projects</div>
                    </div>
                    <div className="glass-card stat-glow-green p-5 text-center">
                        <div className="text-2xl font-bold text-seagrass-300 font-display">{totalCredits.toLocaleString()}</div>
                        <div className="text-xs text-gray-400 mt-1">AARNA Credits</div>
                    </div>
                    <div className="glass-card stat-glow-orange p-5 text-center">
                        <div className="text-2xl font-bold text-coral-300 font-display">{all.length}</div>
                        <div className="text-xs text-gray-400 mt-1">Total Projects</div>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <div className="text-2xl font-bold text-gray-200 font-display">
                            {new Set(all.map(p => p.ecosystem)).size}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Ecosystems Tracked</div>
                    </div>
                </div>

                {/* ── All Projects ── */}
                <h2 className="text-xl font-bold text-gray-200 mb-4">All Projects ({all.length})</h2>
                {all.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <span className="text-5xl mb-4 block">🌊</span>
                        <p className="text-gray-400">No projects have been submitted yet.</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Deploy the contract and submit a project from the <span className="text-ocean-400">Developer</span> page.
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-5">
                        {all.map((project) => (
                            <div key={project.id} className="glass-card overflow-hidden group">
                                {/* Color band top */}
                                <div
                                    className={`h-1.5 w-full ${project.status === 'verified' || project.status === 'issued'
                                            ? 'bg-gradient-to-r from-seagrass-500 to-ocean-500'
                                            : project.status === 'rejected'
                                                ? 'bg-gradient-to-r from-red-500 to-coral-500'
                                                : 'bg-gradient-to-r from-amber-500 to-orange-500'
                                        }`}
                                />

                                <div className="p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-bold text-gray-200 text-lg group-hover:text-ocean-300 transition-colors">
                                            {project.name}
                                        </h3>
                                        <span
                                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${project.status === 'verified'
                                                    ? 'badge-verified'
                                                    : project.status === 'issued'
                                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                        : project.status === 'rejected'
                                                            ? 'badge-rejected'
                                                            : 'badge-pending'
                                                }`}
                                        >
                                            {project.status === 'issued' ? 'Credited' : project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                        </span>
                                    </div>

                                    {/* Details grid */}
                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                                            <span className="text-gray-500">📍</span>
                                            <span className="ml-1 text-gray-300">{project.location}</span>
                                        </div>
                                        <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                                            <span className="text-gray-500">🌿</span>
                                            <span className="ml-1 text-gray-300">{project.ecosystem}</span>
                                        </div>
                                        <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                                            <span className="text-gray-500">👤</span>
                                            <span className="ml-1 text-gray-300 font-mono text-xs">
                                                {project.submitter.slice(0, 8)}...{project.submitter.slice(-4)}
                                            </span>
                                        </div>
                                        <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                                            <span className="text-gray-500">🔢</span>
                                            <span className="ml-1 text-gray-300">Project #{project.id}</span>
                                        </div>
                                    </div>

                                    {/* Carbon stats for verified/issued */}
                                    {(project.status === 'verified' || project.status === 'issued') && project.credits > 0 && (
                                        <div className="mt-4 flex gap-4">
                                            <div className="flex-1 rounded-xl bg-seagrass-600/10 border border-seagrass-500/20 p-3 text-center">
                                                <div className="text-xl font-bold text-seagrass-300 font-display">
                                                    {project.credits.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-400">AARNA Credits</div>
                                            </div>
                                        </div>
                                    )}

                                    {/* IPFS CID */}
                                    <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs font-mono text-ocean-400/80 truncate">
                                        CID: {project.cid}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Explorer link ── */}
                <div className="mt-12 mb-12 text-center">
                    <a
                        href="https://testnet.explorer.perawallet.app/"
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-gray-300 hover:bg-white/10 transition-all"
                    >
                        🔗 View on Algorand Testnet Explorer
                    </a>
                </div>
            </div>
        </div>
    )
}
