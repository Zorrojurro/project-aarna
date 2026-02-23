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
import { VALIDATOR_ADDRESS } from '../constants/roles'

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

const LS_APP_ID = 'aarna_app_id'
const LS_ASSET_ID = 'aarna_asset_id'

export function useAarna() {
    const { transactionSigner, activeAddress } = useWallet()
    const { enqueueSnackbar } = useSnackbar()

    const [appClient, setAppClient] = useState<any>(null)
    const [appId, setAppId] = useState<bigint | null>(() => {
        const env = import.meta.env.VITE_APP_ID
        if (env) return BigInt(env)
        const saved = localStorage.getItem(LS_APP_ID)
        return saved ? BigInt(saved) : null
    })
    const [assetId, setAssetId] = useState<bigint | null>(() => {
        const env = import.meta.env.VITE_ASSET_ID
        if (env) return BigInt(env)
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
        if (msg.includes('project not pending')) return 'Project is not in pending status'
        if (msg.includes('project not verified')) return 'Project must be verified before issuing credits'
        if (msg.includes('listing not active')) return 'This listing is no longer active'
        if (msg.includes('insufficient payment')) return 'Not enough ALGO sent for this purchase'
        if (msg.includes('only seller can cancel')) return 'Only the seller can cancel this listing'
        if (msg.includes('no AARNA token')) return 'Create the AARNA token first'
        if (msg.includes('assert failed') || msg.includes('Error resolving execution info via simulate')) {
            if (msg.includes('pc=4245') || msg.includes('pc=3507')) return 'Unauthorized: only the validator wallet can approve/reject projects'
            if (msg.includes('pc=3497') || msg.includes('pc=2757')) return 'Unauthorized: only the admin wallet can perform this action'
            return 'Transaction failed — the project may already be processed, or your wallet is not authorized'
        }
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

    // ─── Fetch from box storage — direct algod reads, no wallet needed ────────
    const fetchOnChainProjects = useCallback(async (client: any) => {
        try {
            // Global state for counters + asset ID
            const state = await client.state.global.getAll()
            const count = Number(state.projectCount ?? 0)
            const lCount = Number(state.listingCount ?? 0)
            setProjectCount(count)
            setListingCount(lCount)
            setTotalCreditsIssued(Number(state.totalCreditsIssued ?? 0))

            const onChainAssetId = state.aarnaAsset ? BigInt(Number(state.aarnaAsset)) : null
            if (onChainAssetId && onChainAssetId > 0n) {
                setAssetId(onChainAssetId)
                localStorage.setItem(LS_ASSET_ID, onChainAssetId.toString())
            }

            // Fetch projects — direct box reads (no signer required)
            const onChain: AarnaProject[] = []
            for (let i = 0; i < count; i++) {
                try {
                    const rec = await client.state.box.projects.value(i)
                    if (!rec) continue
                    const statusNum = Number(rec.status ?? 0)
                    onChain.push({
                        id: i,
                        name: rec.name ?? '',
                        location: rec.location ?? '',
                        ecosystem: rec.ecosystem ?? '',
                        cid: rec.cid ?? '',
                        status: STATUS_MAP[statusNum] ?? 'pending',
                        credits: Number(rec.credits ?? 0),
                        submitter: rec.submitter ?? '',
                    })
                } catch (e) {
                    console.warn(`Could not fetch project ${i}:`, e)
                }
            }
            setProjects(onChain)

            // Fetch listings — direct box reads (no signer required)
            const onChainListings: AarnaListing[] = []
            for (let i = 0; i < lCount; i++) {
                try {
                    const rec = await client.state.box.listings.value(i)
                    if (!rec) continue
                    onChainListings.push({
                        id: i,
                        seller: rec.seller ?? '',
                        amount: Number(rec.amount ?? 0),
                        pricePerToken: Number(rec.price ?? 0),
                        active: Number(rec.active ?? 0) === 1,
                    })
                } catch (e) {
                    console.warn(`Could not fetch listing ${i}:`, e)
                }
            }
            setListings(onChainListings)
        } catch (e) {
            console.warn('Could not fetch on-chain state:', e)
        }
    }, [])

    const refreshProjects = useCallback(async () => {
        if (!appClient) return
        await fetchOnChainProjects(appClient)
    }, [appClient, fetchOnChainProjects])

    // Read-only connect on mount if we have a stored appId
    useEffect(() => {
        if (!appId || appClient) return
        const connectReadOnly = async () => {
            try {
                const factory = new AarnaRegistryFactory({ algorand })
                const client = factory.getAppClientById({ appId })
                setAppClient(client)
                await fetchOnChainProjects(client)
            } catch (e) {
                console.warn('Read-only connect failed:', e)
            }
        }
        connectReadOnly()
    }, [appId, appClient, algorand, fetchOnChainProjects])

    // Reconnect with signer when wallet connects
    useEffect(() => {
        if (!activeAddress || !appId) return
        try {
            const factory = new AarnaRegistryFactory({
                algorand,
                defaultSender: activeAddress,
                defaultSigner: transactionSigner,
            })
            const client = factory.getAppClientById({ appId })
            setAppClient(client)
        } catch (e) {
            console.warn('Wallet reconnect failed:', e)
        }
    }, [activeAddress, appId, algorand, transactionSigner])

    // ─── Admin: Deploy ────────────────────────────────────────────────────────
    const deploy = useCallback(async () => {
        if (!ensureWallet()) return
        setBusy(true)
        try {
            const factory = new AarnaRegistryFactory({
                algorand,
                defaultSender: activeAddress!,
                defaultSigner: transactionSigner,
            })
            const { appClient: client } = await factory.send.create.init({ args: [], populateAppCallResources: true })
            setAppClient(client)
            setAppId(client.appId)
            localStorage.setItem(LS_APP_ID, client.appId.toString())
            await client.send.setValidator({ args: { addr: VALIDATOR_ADDRESS }, sender: activeAddress!, signer: transactionSigner, populateAppCallResources: true })
            await fetchOnChainProjects(client)
            enqueueSnackbar(`App deployed! ID: ${client.appId}`, { variant: 'success' })
        } catch (e: any) {
            enqueueSnackbar(parseError(e), { variant: 'error' })
        } finally {
            setBusy(false)
        }
    }, [ensureWallet, algorand, activeAddress, transactionSigner, enqueueSnackbar, fetchOnChainProjects, parseError])

    const setValidator = useCallback(async (addr: string) => {
        if (!ensureWallet() || !needClient()) return
        setBusy(true)
        try {
            await appClient.send.setValidator({ args: { addr }, sender: activeAddress!, signer: transactionSigner, populateAppCallResources: true })
            enqueueSnackbar('Validator set', { variant: 'success' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, activeAddress, transactionSigner, enqueueSnackbar, parseError])

    // ─── Token: Create AARNA ASA ──────────────────────────────────────────────
    const ensureToken = useCallback(async () => {
        if (!ensureWallet() || !needClient()) return
        setBusy(true)
        try {
            const appAddr = appClient.appAddress
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

    // ─── Project lifecycle ────────────────────────────────────────────────────
    const submitProject = useCallback(async (
        name: string, location: string, ecosystem: string, cid: string,
    ): Promise<number | undefined> => {
        if (!ensureWallet() || !needClient()) return undefined
        setBusy(true)
        try {
            // Fund MBR for new project box (~200+ bytes = ~106_300 µAlgo)
            const appAddr = appClient.appAddress
            await algorand.send.payment({
                sender: activeAddress!, receiver: appAddr,
                amount: AlgoAmount.MicroAlgo(106_300), signer: transactionSigner,
            })
            const r = await appClient.send.submitProject({
                args: { name, location, ecosystem, cid },
                sender: activeAddress!, signer: transactionSigner,
                populateAppCallResources: true,
            })
            const idx = Number(r?.return ?? 0)
            setProjects(prev => [...prev, { id: idx, name, location, ecosystem, cid, status: 'pending', credits: 0, submitter: activeAddress || '' }])
            setProjectCount(idx + 1)
            enqueueSnackbar(`Project #${idx} submitted on-chain!`, { variant: 'success' })
            return idx
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }); return undefined }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, algorand, activeAddress, transactionSigner, enqueueSnackbar, parseError])

    const approveProject = useCallback(async (projectId: number, credits: number) => {
        if (!ensureWallet() || !needClient()) return
        if (activeAddress !== VALIDATOR_ADDRESS) {
            enqueueSnackbar('Only the validator wallet can approve projects', { variant: 'error' })
            return
        }
        setBusy(true)
        try {
            try {
                await appClient.send.setValidator({
                    args: { addr: VALIDATOR_ADDRESS },
                    sender: activeAddress!,
                    signer: transactionSigner,
                })
            } catch (_) { /* not admin — skip */ }

            await appClient.send.approveProject({
                args: { projectId: BigInt(projectId), credits: BigInt(credits) },
                sender: activeAddress!,
                signer: transactionSigner,
                populateAppCallResources: true,
            })
            updateProjectStatus(projectId, 'verified', credits)
            await refreshProjects()
            enqueueSnackbar(`Project #${projectId} approved!`, { variant: 'success' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, activeAddress, transactionSigner, updateProjectStatus, refreshProjects, enqueueSnackbar, parseError])

    const rejectProject = useCallback(async (projectId: number) => {
        if (!ensureWallet() || !needClient()) return
        if (activeAddress !== VALIDATOR_ADDRESS) {
            enqueueSnackbar('Only the validator wallet can reject projects', { variant: 'error' })
            return
        }
        setBusy(true)
        try {
            try {
                await appClient.send.setValidator({
                    args: { addr: VALIDATOR_ADDRESS },
                    sender: activeAddress!,
                    signer: transactionSigner,
                })
            } catch (_) { /* not admin — skip */ }

            await appClient.send.rejectProject({
                args: { projectId: BigInt(projectId) },
                sender: activeAddress!,
                signer: transactionSigner,
                populateAppCallResources: true,
            })
            updateProjectStatus(projectId, 'rejected')
            await refreshProjects()
            enqueueSnackbar(`Project #${projectId} rejected`, { variant: 'info' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, activeAddress, transactionSigner, updateProjectStatus, refreshProjects, enqueueSnackbar, parseError])

    const issueCredits = useCallback(async (projectId: number) => {
        if (!ensureWallet() || !needClient()) return
        if (activeAddress !== VALIDATOR_ADDRESS) {
            enqueueSnackbar('Only the validator wallet can issue credits', { variant: 'error' })
            return
        }
        setBusy(true)
        try {
            const appAddr = appClient.appAddress
            await algorand.send.payment({
                sender: activeAddress!, receiver: appAddr,
                amount: AlgoAmount.MicroAlgo(200_000), signer: transactionSigner,
            })

            const project = projects.find(p => p.id === projectId)
            const submitter = project?.submitter || ''

            const r = await appClient.send.issueCredits({
                args: { projectId: BigInt(projectId) }, sender: activeAddress!, signer: transactionSigner,
                populateAppCallResources: true,
                extraFee: AlgoAmount.MicroAlgo(2_000),
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

    // ─── Asset opt-in ─────────────────────────────────────────────────────────
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

    // ─── Token balance ────────────────────────────────────────────────────────
    const [onChainBalance, setOnChainBalance] = useState<number>(0)
    const [balanceAdjustments, setBalanceAdjustments] = useState<Record<string, number>>({})

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

    // ─── Marketplace ──────────────────────────────────────────────────────────
    const listForSale = useCallback(async (amount: number, pricePerToken: number) => {
        if (!ensureWallet() || !needClient()) return
        setBusy(true)
        try {
            // Fund MBR for new listing box (~56 bytes = ~57_300 µAlgo)
            const appAddr = appClient.appAddress
            await algorand.send.payment({
                sender: activeAddress!, receiver: appAddr,
                amount: AlgoAmount.MicroAlgo(57_300), signer: transactionSigner,
            })
            const r = await appClient.send.listForSale({
                args: { amount: BigInt(amount), pricePerToken: BigInt(pricePerToken) },
                sender: activeAddress!, signer: transactionSigner,
                populateAppCallResources: true,
                extraFee: AlgoAmount.MicroAlgo(2_000),
            })
            const idx = Number(r?.return ?? listingCount)
            setListings(prev => [...prev, { id: idx, seller: activeAddress || '', amount, pricePerToken, active: true }])
            setListingCount(idx + 1)
            enqueueSnackbar(`Listed ${amount} AARNA tokens at ${pricePerToken} µALGO each!`, { variant: 'success' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, algorand, activeAddress, transactionSigner, listingCount, enqueueSnackbar, parseError])

    const buyListing = useCallback(async (listingId: number) => {
        if (!ensureWallet() || !needClient()) return
        const listing = listings.find(l => l.id === listingId)
        if (!listing || !listing.active) {
            enqueueSnackbar('Listing not available', { variant: 'warning' })
            return
        }
        setBusy(true)
        try {
            const totalCost = BigInt(listing.amount) * BigInt(listing.pricePerToken)
            await appClient.send.buyListing({
                args: { listingId: BigInt(listingId), payment: totalCost },
                sender: activeAddress!, signer: transactionSigner,
                populateAppCallResources: true,
                extraFee: AlgoAmount.MicroAlgo(4_000),
            })
            setListings(prev => prev.map(l => l.id === listingId ? { ...l, active: false } : l))
            setBalanceAdjustments(prev => ({
                ...prev,
                [listing.seller]: (prev[listing.seller] || 0) - listing.amount,
                [activeAddress!]: (prev[activeAddress!] || 0) + listing.amount,
            }))
            enqueueSnackbar(`Bought ${listing.amount} AARNA tokens!`, { variant: 'success' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, activeAddress, transactionSigner, listings, enqueueSnackbar, parseError])

    const cancelListing = useCallback(async (listingId: number) => {
        if (!ensureWallet() || !needClient()) return
        setBusy(true)
        try {
            await appClient.send.cancelListing({
                args: { listingId: BigInt(listingId) },
                sender: activeAddress!, signer: transactionSigner,
                populateAppCallResources: true,
                extraFee: AlgoAmount.MicroAlgo(2_000),
            })
            setListings(prev => prev.map(l => l.id === listingId ? { ...l, active: false } : l))
            enqueueSnackbar('Listing cancelled', { variant: 'info' })
        } catch (e: any) { enqueueSnackbar(parseError(e), { variant: 'error' }) }
        finally { setBusy(false) }
    }, [ensureWallet, needClient, appClient, activeAddress, transactionSigner, enqueueSnackbar, parseError])

    return {
        appId, assetId, busy, projectCount, projects, totalCreditsIssued,
        listings, listingCount, tokenBalance,
        deploy, setValidator, ensureToken, submitProject,
        approveProject, rejectProject, issueCredits, optInToAsset,
        listForSale, buyListing, cancelListing, refreshProjects, fetchTokenBalance,
    }
}
