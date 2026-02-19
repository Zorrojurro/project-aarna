import { useState } from 'react'
import { useAarnaContext } from '../context/AarnaContext'

interface ValidatorProps {
    demo: boolean
}

export default function Validator({ demo }: ValidatorProps) {
    const aarna = useAarnaContext()

    const [validatorAddr, setValidatorAddr] = useState('')
    const [creditAmounts, setCreditAmounts] = useState<Record<number, string>>({})

    const pendingProjects = aarna.projects.filter((p) => p.status === 'pending')
    const processedProjects = aarna.projects.filter((p) => p.status !== 'pending')

    const handleApprove = async (id: number) => {
        const credits = parseInt(creditAmounts[id] || '0')
        if (credits <= 0) return
        await aarna.approveProject(id, credits)
    }

    const handleReject = async (id: number) => {
        await aarna.rejectProject(id)
    }

    const handleIssue = async (id: number) => {
        await aarna.issueCredits(id)
    }

    return (
        <div className="page-enter pt-24 min-h-screen px-4 sm:px-6">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold">
                        ✅ Validator <span className="text-seagrass-400">Dashboard</span>
                    </h1>
                    <p className="mt-2 text-gray-400">
                        Review submitted projects, approve or reject, and issue AARNA carbon credits.
                    </p>
                </div>

                {/* Setup row */}
                <div className="glass-card p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-200 mb-4">🔧 Validator Setup</h2>
                    <div className="grid md:grid-cols-3 gap-3 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-400 mb-1">Validator Address</label>
                            <input
                                value={validatorAddr}
                                onChange={(e) => setValidatorAddr(e.target.value)}
                                placeholder="Enter Algorand address to set as validator"
                                className="w-full rounded-lg border border-white/10 bg-[#0b1222] px-4 py-2.5 text-sm font-mono text-gray-200 placeholder:text-gray-600 focus:border-seagrass-500 focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={() => aarna.setValidator(validatorAddr)}
                            disabled={aarna.busy || !validatorAddr}
                            className="rounded-xl bg-gradient-to-r from-seagrass-600 to-seagrass-700 px-4 py-2.5 font-semibold text-white shadow-lg shadow-seagrass-600/20 hover:shadow-seagrass-600/40 transition-all disabled:opacity-50"
                        >
                            Set Validator
                        </button>
                    </div>
                    <div className="mt-3 flex gap-3">
                        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm">
                            <span className="text-gray-500">App ID:</span>{' '}
                            <span className="text-ocean-300 font-mono">{aarna.appId?.toString() || '—'}</span>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm">
                            <span className="text-gray-500">AARNA ASA:</span>{' '}
                            <span className="text-seagrass-300 font-mono">{aarna.assetId?.toString() || '—'}</span>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm">
                            <span className="text-gray-500">Projects:</span>{' '}
                            <span className="text-ocean-300 font-mono">{aarna.projects.length}</span>
                        </div>
                    </div>
                </div>

                {/* Pending Projects */}
                <h2 className="text-xl font-bold text-gray-200 mb-4">📋 Pending Projects ({pendingProjects.length})</h2>
                {pendingProjects.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <span className="text-5xl mb-4 block">📭</span>
                        <p className="text-gray-400">No pending projects to review.</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Submit a project from the <span className="text-ocean-400">Developer</span> page first.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingProjects.map((project) => (
                            <div key={project.id} className="glass-card p-6">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-gray-200 text-lg">{project.name}</h3>
                                            <span className="badge-pending rounded-full px-3 py-1 text-xs font-semibold">Pending</span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mt-3">
                                            <div>
                                                <span className="text-gray-500">📍 Location:</span>
                                                <span className="ml-1 text-gray-300">{project.location}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">🌿 Ecosystem:</span>
                                                <span className="ml-1 text-gray-300">{project.ecosystem}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">👤 Submitter:</span>
                                                <span className="ml-1 text-gray-300 font-mono text-xs">
                                                    {project.submitter.slice(0, 6)}...{project.submitter.slice(-4)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-ocean-400 break-all">
                                            IPFS: {project.cid}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Carbon Credits</label>
                                            <input
                                                type="number"
                                                value={creditAmounts[project.id] || ''}
                                                onChange={(e) => setCreditAmounts({ ...creditAmounts, [project.id]: e.target.value })}
                                                placeholder="e.g. 1200"
                                                className="w-full rounded-lg border border-white/10 bg-[#0b1222] px-3 py-2 text-sm text-gray-200 focus:border-seagrass-500 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleApprove(project.id)}
                                            disabled={aarna.busy}
                                            className="rounded-lg bg-gradient-to-r from-seagrass-600 to-seagrass-700 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-seagrass-600/40 transition-all disabled:opacity-50"
                                        >
                                            ✅ Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(project.id)}
                                            disabled={aarna.busy}
                                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                        >
                                            ❌ Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Processed Projects */}
                {processedProjects.length > 0 && (
                    <>
                        <h2 className="text-xl font-bold text-gray-200 mb-4 mt-10">📦 Processed Projects</h2>
                        <div className="space-y-4">
                            {processedProjects.map((project) => (
                                <div key={project.id} className="glass-card p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-gray-200 text-lg">{project.name}</h3>
                                                {project.status === 'verified' && (
                                                    <span className="badge-verified rounded-full px-3 py-1 text-xs font-semibold">Verified</span>
                                                )}
                                                {project.status === 'rejected' && (
                                                    <span className="badge-rejected rounded-full px-3 py-1 text-xs font-semibold">Rejected</span>
                                                )}
                                                {project.status === 'issued' && (
                                                    <span className="rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 px-3 py-1 text-xs font-semibold">Credited</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-400">
                                                {project.location} · {project.ecosystem}
                                                {project.credits > 0 && <> · <span className="text-seagrass-400 font-semibold">{project.credits} credits</span></>}
                                            </div>
                                        </div>
                                        {project.status === 'verified' && (
                                            <button
                                                onClick={() => handleIssue(project.id)}
                                                disabled={aarna.busy}
                                                className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:shadow-purple-600/40 transition-all disabled:opacity-50"
                                            >
                                                🪙 Issue Credits
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
