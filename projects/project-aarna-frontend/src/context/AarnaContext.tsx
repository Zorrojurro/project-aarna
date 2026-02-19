import { createContext, useContext } from 'react'
import type { AarnaProject } from '../hooks/useAarna'

/**
 * AarnaContext — shares a single useAarna() instance across all pages
 * so that deploying on /developer makes the client available on /validator, etc.
 */
export interface AarnaContextValue {
    appId: bigint | null
    assetId: bigint | null
    busy: boolean
    projectCount: number
    projects: AarnaProject[]
    deploy: () => Promise<void>
    setValidator: (addr: string) => Promise<void>
    ensureToken: () => Promise<void>
    submitProject: (name: string, location: string, ecosystem: string, cid: string) => Promise<number | undefined>
    approveProject: (projectId: number, credits: number) => Promise<void>
    rejectProject: (projectId: number) => Promise<void>
    issueCredits: (projectId: number) => Promise<void>
    optInToAsset: () => Promise<void>
}

const AarnaContext = createContext<AarnaContextValue | null>(null)

export function AarnaProvider({
    value,
    children,
}: {
    value: AarnaContextValue
    children: React.ReactNode
}) {
    return <AarnaContext.Provider value={value}>{children}</AarnaContext.Provider>
}

export function useAarnaContext(): AarnaContextValue {
    const ctx = useContext(AarnaContext)
    if (!ctx) throw new Error('useAarnaContext must be used inside <AarnaProvider>')
    return ctx
}
