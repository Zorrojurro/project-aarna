import { useState, useMemo, useCallback, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import {
    getAlgodConfigFromViteEnvironment,
    getIndexerConfigFromViteEnvironment,
} from '../utils/network/getAlgoClientConfigs'
import { AarnaRegistryFactory } from '../contracts/AarnaRegistry'

/* ───────────────── Types ───────────────── */
export interface AarnaProject {
    id: number
    name: string
    location: string
    ecosystem: string
    cid: string
    status: 'pending' | 'verified' | 'rejected' | 'issued'
    credits: number
    submitter: string
}

export interface AarnaListing {
    id: number
    seller: string
    amount: number
    pricePerToken: number
    active: boolean
}

/* ───────────────── LocalStorage keys ───────────────── */
const LS_APP_ID = 'aarna_app_id'
const LS_ASSET_ID = 'aarna_asset_id'

/**
 * useAarna — central hook for all AarnaRegistry contract interactions (live mode).
 */
export function useAarna() {
    const { transactionSigner, activeAddress } = useWallet()
    const { enqueueSnackbar } = useSnackbar()

    const [appClient, setAppClient] = useState<any>(null)
    const [appId, setAppId] = useState<bigint | null>(() => {
        const saved = localStorage.getItem(LS_APP_ID)
        return saved ? BigInt(saved) : null
    })
    const [assetId, setAssetId] = useState<bigint | null>(() => {
        const saved = localStorage.getItem(LS_ASSET_ID)
        return saved ? BigInt(saved) : null
    })
    const [busy, setBusy] = useState(false)
    const [projectCount, setProjectCount] = useState(0)
    const [projects, setProjects] = useState<AarnaProject[]>([])
    const [totalCreditsIssued, setTotalCreditsIssued] = useState(0)
    const [listings, setListings] = useState<AarnaListing[]>([])
    const [listingCount, setListingCount] = useState(0)

    const algorand = useMemo(() => {
        const algodConfig = getAlgodConfigFromViteEnvironment()
        const indexerConfig = getIndexerConfigFromViteEnvironment()
        const a = AlgorandClient.fromConfig({ algodConfig, indexerConfig })
        a.setDefaultSigner(transactionSigner)
        return a
    }, [transactionSigner])

    const ensureWallet = useCallback(() => {
        if (!activeAddress) {
            enqueueSnackbar('Connect a wallet first', { variant: 'warning' })
            return false
        }
        return true
    }, [activeAddress, enqueueSnackbar])

    const needClient = useCallback(() => {
        if (!appClient) {
            enqueueSnackbar('Deploy the app first', { variant: 'warning' })
            return false
        }
        return true
    }, [appClient, enqueueSnackbar])

    const parseError = useCallback((e: any): string => {
        const msg = e?.message || String(e)
        if (msg.includes('unauthorized: admin only')) return 'Only the admin can perform this action'
        if (msg.includes('unauthorized: validator only')) return 'Only the validator can perform this action'
        if (msg.includes('max projects reached')) return 'Maximum of 4 projects reached'
        if (msg.includes('max listings reached')) return 'Maximum of 4 listings reached'
        if (msg.includes('project not pending')) return 'Project is not in pending status'
        if (msg.includes('project not verified')) return 'Project must be verified before issuing credits'
        if (msg.includes('listing not active')) return 'This listing is no longer active'
        if (msg.includes('insufficient payment')) return 'Not enough ALGO sent for this purchase'
        if (msg.includes('only seller can cancel')) return 'Only the seller can cancel this listing'
        if (msg.includes('no AARNA token')) return 'Create the AARNA token first'
        return msg.length > 120 ? msg.slice(0, 120) + '…' : msg
    }, [])

    const updateProjectStatus = useCallback((id: number, status: AarnaProject['status'], credits?: number) => {
        setProjects(prev => prev.map(p =>
            p.id === id ? { ...p, status, credits: credits ?? p.credits } : p
        ))
    }, [])

    const STATUS_MAP: Record<number, AarnaProject['status']> = {
        0: 'pending', 1: 'pending', 2: 'verified', 3: 'rejected', 4: 'issued',
    }

    const fetchOnChainProjects = useCallback(async (client: any) => {
        try {
            const state = await client.state.global.getAll()
            const count = Number(state.projectCount ?? 0)
            const onChain: AarnaProject[] = []
            for (let i = 0; i < Math.min(count, 4); i++) {
                const name = state[`p${i}Name`]?.asString?.() ?? state[`p${i}Name`] ?? ''
                const location = state[`p${i}Location`]?.asString?.() ?? state[`p${i}Location`] ?? ''
                const ecosystem = state[`p${i}Ecosystem`]?.asString?.() ?? state[`p${i}Ecosystem`] ?? ''
                const cid = state[`p${i}Cid`]?.asString?.() ?? state[`p${i}Cid`] ?? ''
                const statusNum = Number(state[`p${i}Status`] ?? 0)
                const credits = Number(state[`p${i}Credits`] ?? 0)
                const submitter = state[`p${i}Submitter`] ?? ''
                if (name) {
                    onChain.push({
                        id: i,
                        name: typeof name === 'string' ? name : String(name),
                        location: typeof location === 'string' ? location : String(location),
                        ecosystem: typeof ecosystem === 'string' ? ecosystem : String(ecosystem),
                        cid: typeof cid === 'string' ? cid : String(cid),
                        status: STATUS_MAP[statusNum] ?? 'pending',
                        credits,
                        submitter: typeof submitter === 'string' ? submitter : String(submitter),
                    })
                }
            }
            setProjects(onChain)
            setProjectCount(count)
            setTotalCreditsIssued(Number(state.totalCreditsIssued ?? 0))

            // Fetch asset ID from on-chain state if we don't have it
            const onChainAssetId = state.aarnaAsset ? BigInt(Number(state.aarnaAsset)) : null
            if (onChainAssetId && onChainAssetId > 0n) {
                setAssetId(onChainAssetId)
                localStorage.setItem(LS_ASSET_ID, onChainAssetId.toString())
            }

            // Fetch listings
            const lCount = Number(state.listingCount ?? 0)
            const onChainListings: AarnaListing[] = []
            for (let i = 0; i < Math.min(lCount, 4); i++) {
                const seller = state[`l${i}Seller`] ?? ''
                const amount = Number(state[`l${i}Amount`] ?? 0)
                const price = Number(state[`l${i}Price`] ?? 0)
                const active = Number(state[`l${i}Active`] ?? 0) === 1
                onChainListings.push({
                    id: i,
                    seller: typeof seller === 'string' ? seller : String(seller),
                    amount,
                    pricePerToken: price,
                    active,
                })
            }
            setListings(onChainListings)
            setListingCount(lCount)
        } catch (e) {
            console.warn('Could not fetch on-chain state:', e)
        }
    }, [])

    const refreshProjects = useCallback(async () => {
        if (!appClient) return
        await fetchOnChainProjects(appClient)
    }, [appClient, fetchOnChainProjects])

    // ═══════════════════════════════════════════════════
    //  Auto-reconnect to existing contract on page load
    // ═══════════════════════════════════════════════════
    useEffect(() => {
        if (!activeAddress || !appId || appClient) return
        const reconnect = async () => {
            try {
                const factory = new AarnaRegistryFactory({
                    algorand,
                    defaultSender: activeAddress,
                    defaultSigner: transactionSigner,
                })
                const client = factory.getAppClientById({ appId })
                setAppClient(client)
                await fetchOnChainProjects(client)
                enqueueSnackbar(`Reconnected to app ${appId}`, { variant: 'info' })
            } catch (e) {
                console.warn('Auto-reconnect failed:', e)
            }
        }
        reconnect()
    }, [activeAddress, appId, appClient, algorand, transactionSigner, fetchOnChainProjects, enqueueSnackbar])

    // ─── Deploy ───
    const deploy = useCallback(async () => {
        if (!ensureWallet()) return
        setBusy(true)
        try {
            const factory = new AarnaRegistryFactory({
                algorand,
                defaultSender: activeAddress!,
                defaultSigner: transactionSigner,
            })
            const { appClient: client } = await factory.send.create.init({ args: [], populateAppCallResources: false })
            setAppClient(client)
            setAppId(client.appId)
            localStorage.setItem(LS_APP_ID, client.appId.toString())
            await fetchOnChainProjects(client)
            enqueueSnackbar(`App deployed! ID: ${client.appId}`, { variant: 'success' })
        } catch (e: any) {
            enqueueSnackbar(parseError(e), { variant: 'error' })
        } finally {
            setBusy(false)
        }
    }, [ensureWallet, algorand, activeAddress, transactionSigner, enqueueSnackbar, fetchOnChainProjects, parseError])

    // ─── Set Validator ───
    const setValidator = useCallback(async (addr: string) => {
        if (!ensureWallet() || !needClient()) return
        setBusy(true)
        try {
            await appClient.send.setValidator({ args: { addr }, sender: activeAddress!, signer: transactionSigner, populateAppCallResources: false })
            enqueueSnackbar('Validator set', { variant: 'success' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, enqueueSnackbar, parseError])

    // ─── Ensure Token ───
    const ensureToken = useCallback(async () => {
        if (!ensureWallet() || !needClient()) return
        setBusy(true)
        try {
            const appAddr = appClient.appAddress
            // Fund app for MBR + inner txn fees
            await algorand.send.payment({
                sender: activeAddress!, receiver: appAddr,
                amount: AlgoAmount.Algo(1), signer: transactionSigner,
            })
            const r = await appClient.send.ensureToken({
                args: [], sender: activeAddress!, signer: transactionSigner,
                populateAppCallResources: false,
                extraFee: AlgoAmount.MicroAlgo(2_000),
            })
            const id = r?.return as bigint | undefined
            if (id) {
                setAssetId(id)
                localStorage.setItem(LS_ASSET_ID, id.toString())
            }
            enqueueSnackbar(`AARNA token ready: ASA ${id?.toString()}`, { variant: 'success' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, algorand, activeAddress, transactionSigner, enqueueSnackbar, parseError])

    // ─── Submit Project ───
    const submitProject = useCallback(async (
        name: string, location: string, ecosystem: string, cid: string,
    ): Promise<number | undefined> => {
        if (!ensureWallet() || !needClient()) return undefined
        setBusy(true)
        try {
            const r = await appClient.send.submitProject({ args: { name, location, ecosystem, cid }, sender: activeAddress!, signer: transactionSigner, populateAppCallResources: false })
            const idx = Number(r?.return ?? 0)
            setProjects(prev => [...prev, { id: idx, name, location, ecosystem, cid, status: 'pending', credits: 0, submitter: activeAddress || '' }])
            setProjectCount(idx + 1)
            enqueueSnackbar(`Project #${idx} submitted on-chain!`, { variant: 'success' })
            return idx
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }); return undefined }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, activeAddress, enqueueSnackbar, parseError])

    // ─── Approve Project ───
    const approveProject = useCallback(async (projectId: number, credits: number) => {
        if (!ensureWallet() || !needClient()) return
        setBusy(true)
        try {
            await appClient.send.approveProject({ args: { projectId: BigInt(projectId), credits: BigInt(credits) }, sender: activeAddress!, signer: transactionSigner, populateAppCallResources: false })
            updateProjectStatus(projectId, 'verified', credits)
            enqueueSnackbar(`Project #${projectId} approved!`, { variant: 'success' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, updateProjectStatus, enqueueSnackbar, parseError])

    // ─── Reject Project ───
    const rejectProject = useCallback(async (projectId: number) => {
        if (!ensureWallet() || !needClient()) return
        setBusy(true)
        try {
            await appClient.send.rejectProject({ args: { projectId: BigInt(projectId) }, sender: activeAddress!, signer: transactionSigner, populateAppCallResources: false })
            updateProjectStatus(projectId, 'rejected')
            enqueueSnackbar(`Project #${projectId} rejected`, { variant: 'info' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, updateProjectStatus, enqueueSnackbar, parseError])

    // ─── Issue Credits ───
    const issueCredits = useCallback(async (projectId: number) => {
        if (!ensureWallet() || !needClient()) return
        setBusy(true)
        try {
            const appAddr = appClient.appAddress
            // Fund app for inner txn fees
            await algorand.send.payment({
                sender: activeAddress!, receiver: appAddr,
                amount: AlgoAmount.MicroAlgo(200_000), signer: transactionSigner,
            })

            // Look up submitter from our projects state
            const project = projects.find(p => p.id === projectId)
            const submitter = project?.submitter || ''

            const r = await appClient.send.issueCredits({
                args: { projectId: BigInt(projectId) }, sender: activeAddress!, signer: transactionSigner,
                populateAppCallResources: false,
                extraFee: AlgoAmount.MicroAlgo(2_000),
                // Manually pass foreign references the contract needs
                accountReferences: submitter ? [submitter] : [],
                assetReferences: assetId ? [BigInt(assetId)] : [],
            })
            const creds = Number(r?.return ?? 0)
            updateProjectStatus(projectId, 'issued')
            setTotalCreditsIssued(prev => prev + creds)
            enqueueSnackbar(`Credits issued! (${creds} AARNA tokens)`, { variant: 'success' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, algorand, activeAddress, transactionSigner, projects, assetId, updateProjectStatus, enqueueSnackbar, parseError])

    // ─── Opt-In to AARNA ASA ───
    const optInToAsset = useCallback(async () => {
        if (!ensureWallet()) return
        if (!activeAddress) return
        setBusy(true)
        try {
            let id = assetId
            if (!id && appClient) {
                const r = await appClient.send.getAssetId({ args: [] })
                id = (r?.return as bigint | undefined) ?? null
                if (id) setAssetId(id)
            }
            if (!id) { enqueueSnackbar('No AARNA token yet', { variant: 'warning' }); setBusy(false); return }
            await algorand.send.assetOptIn({ sender: activeAddress, assetId: BigInt(id), signer: transactionSigner })
            enqueueSnackbar('Opted in to AARNA!', { variant: 'success' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, appClient, assetId, algorand, activeAddress, transactionSigner, enqueueSnackbar, parseError])

    // ═══════════════════════════════════════════════════
    //  Token Balance (on-chain + simulated marketplace adjustments)
    // ═══════════════════════════════════════════════════

    const [onChainBalance, setOnChainBalance] = useState<number>(0)
    const [balanceAdjustments, setBalanceAdjustments] = useState<Record<string, number>>({})

    // Displayed balance = on-chain + marketplace adjustments for active wallet
    const tokenBalance = onChainBalance + (activeAddress ? (balanceAdjustments[activeAddress] || 0) : 0)

    const fetchTokenBalance = useCallback(async () => {
        if (!activeAddress || !assetId) { setOnChainBalance(0); return }
        try {
            const algodConfig = getAlgodConfigFromViteEnvironment()
            const baseUrl = `${algodConfig.server}${algodConfig.port ? ':' + algodConfig.port : ''}`
            const resp = await fetch(`${baseUrl}/v2/accounts/${activeAddress}`, {
                headers: algodConfig.token ? { 'X-Algo-API-Token': String(algodConfig.token) } : {},
            })
            if (!resp.ok) { setOnChainBalance(0); return }
            const data = await resp.json()
            const assets = data?.assets || data?.account?.assets || []
            const asset = assets.find((a: any) => BigInt(a['asset-id']) === BigInt(assetId))
            setOnChainBalance(asset ? Number(asset.amount) : 0)
        } catch {
            setOnChainBalance(0)
        }
    }, [activeAddress, assetId])

    // ═══════════════════════════════════════════════════
    //  Marketplace Methods (in-memory simulation)
    //  Listing = no balance change
    //  Buying  = seller balance ↓, buyer balance ↑
    //  Cancel  = no balance change
    // ═══════════════════════════════════════════════════

    // ─── List For Sale (no balance change — tokens stay in wallet until sold) ───
    const listForSale = useCallback(async (amount: number, pricePerToken: number) => {
        if (!ensureWallet()) return
        setBusy(true)
        try {
            await new Promise(r => setTimeout(r, 600))
            const idx = listingCount
            setListings(prev => [...prev, { id: idx, seller: activeAddress || '', amount, pricePerToken, active: true }])
            setListingCount(idx + 1)
            enqueueSnackbar(`Listed ${amount} AARNA tokens at ${pricePerToken} µALGO each!`, { variant: 'success' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, activeAddress, listingCount, enqueueSnackbar, parseError])

    // ─── Buy Listing (seller loses tokens, buyer gains tokens) ───
    const buyListing = useCallback(async (listingId: number) => {
        if (!ensureWallet()) return
        const listing = listings.find(l => l.id === listingId)
        if (!listing || !listing.active) {
            enqueueSnackbar('Listing not available', { variant: 'warning' })
            return
        }
        setBusy(true)
        try {
            await new Promise(r => setTimeout(r, 600))
            setListings(prev => prev.map(l => l.id === listingId ? { ...l, active: false } : l))
            // Adjust balances: seller loses, buyer gains
            setBalanceAdjustments(prev => ({
                ...prev,
                [listing.seller]: (prev[listing.seller] || 0) - listing.amount,
                [activeAddress!]: (prev[activeAddress!] || 0) + listing.amount,
            }))
            enqueueSnackbar(`Bought ${listing.amount} AARNA tokens from ${listing.seller.slice(0, 6)}…!`, { variant: 'success' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, activeAddress, listings, enqueueSnackbar, parseError])

    // ─── Cancel Listing (no balance change — tokens were never moved) ───
    const cancelListing = useCallback(async (listingId: number) => {
        if (!ensureWallet()) return
        setBusy(true)
        try {
            await new Promise(r => setTimeout(r, 400))
            setListings(prev => prev.map(l => l.id === listingId ? { ...l, active: false } : l))
            enqueueSnackbar('Listing cancelled', { variant: 'info' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, enqueueSnackbar, parseError])

    return {
        appId, assetId, busy, projectCount, projects, totalCreditsIssued,
        listings, listingCount, tokenBalance,
        deploy, setValidator, ensureToken, submitProject,
        approveProject, rejectProject, issueCredits, optInToAsset,
        listForSale, buyListing, cancelListing, refreshProjects, fetchTokenBalance,
    }
}
