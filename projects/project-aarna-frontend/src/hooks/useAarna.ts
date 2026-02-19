import { useState, useMemo, useCallback } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { AlgoAmount } from '@algorandfoundation/algokit-utils/types/amount'
import {
    getAlgodConfigFromViteEnvironment,
    getIndexerConfigFromViteEnvironment,
} from '../utils/network/getAlgoClientConfigs'
import { AarnaRegistryFactory } from '../contracts/AarnaRegistry'
import algosdk, { AtomicTransactionComposer } from 'algosdk'

/* ───────────────── Shared Project Type ───────────────── */
export interface AarnaProject {
    /** On-chain index (0..3) */
    id: number
    name: string
    location: string
    ecosystem: string
    cid: string
    /** 0=Pending, 1=Verified, 2=Rejected, 3=Credits Issued */
    status: 'pending' | 'verified' | 'rejected' | 'issued'
    credits: number
    submitter: string
}

/**
 * useAarna — central hook for all AarnaRegistry contract interactions.
 *
 * Supports both Live (Testnet) and Demo modes.
 * In Demo mode, all calls return mock responses without touching the chain.
 */
export function useAarna(demo: boolean) {
    const { transactionSigner, activeAddress } = useWallet()
    const { enqueueSnackbar } = useSnackbar()

    const [appClient, setAppClient] = useState<any>(null)
    const [appId, setAppId] = useState<bigint | null>(null)
    const [assetId, setAssetId] = useState<bigint | null>(null)
    const [busy, setBusy] = useState(false)
    const [projectCount, setProjectCount] = useState(0)
    const [projects, setProjects] = useState<AarnaProject[]>([])

    const algorand = useMemo(() => {
        const algodConfig = getAlgodConfigFromViteEnvironment()
        const indexerConfig = getIndexerConfigFromViteEnvironment()
        const a = AlgorandClient.fromConfig({ algodConfig, indexerConfig })
        a.setDefaultSigner(transactionSigner)
        return a
    }, [transactionSigner])

    const ensureWallet = useCallback(() => {
        if (demo) return true
        if (!activeAddress) {
            enqueueSnackbar('Connect a wallet first', { variant: 'warning' })
            return false
        }
        return true
    }, [demo, activeAddress, enqueueSnackbar])

    const needClient = useCallback(() => {
        if (demo) return true
        if (!appClient) {
            enqueueSnackbar('Deploy the app first', { variant: 'warning' })
            return false
        }
        return true
    }, [demo, appClient, enqueueSnackbar])

    /* ── Helper: update a single project's status in local state ── */
    const updateProjectStatus = useCallback((id: number, status: AarnaProject['status'], credits?: number) => {
        setProjects(prev => prev.map(p =>
            p.id === id ? { ...p, status, credits: credits ?? p.credits } : p
        ))
    }, [])

    /* ── Helper: fetch projects from on-chain global state ── */
    const fetchOnChainProjects = useCallback(async (client: any) => {
        try {
            const state = await client.state.global.getAll()
            const count = Number(state.projectCount ?? 0)
            const statusMap: Record<number, AarnaProject['status']> = {
                0: 'pending', 1: 'verified', 2: 'rejected', 3: 'issued',
            }
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
                        status: statusMap[statusNum] ?? 'pending',
                        credits,
                        submitter: typeof submitter === 'string' ? submitter : String(submitter),
                    })
                }
            }
            setProjects(onChain)
            setProjectCount(count)
        } catch (e) {
            console.warn('Could not fetch on-chain projects:', e)
        }
    }, [])

    // ─── Deploy ───
    const deploy = useCallback(async () => {
        if (!ensureWallet()) return
        if (demo) {
            setAppId(BigInt(999_001))
            enqueueSnackbar('Demo: App deployed (ID: 999001)', { variant: 'success' })
            return
        }
        setBusy(true)
        try {
            const factory = new AarnaRegistryFactory({
                algorand,
                defaultSender: activeAddress!,
                defaultSigner: transactionSigner,
            })
            const { appClient: client } = await factory.deploy({
                createParams: {
                    method: 'init',
                    args: [],
                    maxFee: AlgoAmount.MicroAlgo(20_000),
                },
                populateAppCallResources: true,
            })
            setAppClient(client)
            setAppId(client.appId)
            // Fetch any existing on-chain projects (if redeployed)
            await fetchOnChainProjects(client)
            enqueueSnackbar(`App deployed! ID: ${client.appId}`, { variant: 'success' })
        } catch (e: any) {
            console.error('Deploy error:', e)
            enqueueSnackbar(e?.message || 'Deploy failed', { variant: 'error' })
        } finally {
            setBusy(false)
        }
    }, [demo, ensureWallet, algorand, activeAddress, transactionSigner, enqueueSnackbar, fetchOnChainProjects])

    // ─── Set Validator ───
    const setValidator = useCallback(async (addr: string) => {
        if (!ensureWallet() || !needClient()) return
        if (demo) {
            enqueueSnackbar('Demo: Validator set', { variant: 'success' })
            return
        }
        setBusy(true)
        try {
            await appClient.send.setValidator({
                args: { addr },
                populateAppCallResources: true,
            })
            enqueueSnackbar('Validator set', { variant: 'success' })
        } catch (e: any) {
            console.error('Set validator error:', e)
            enqueueSnackbar(e?.message || 'Set validator failed', { variant: 'error' })
        } finally {
            setBusy(false)
        }
    }, [demo, ensureWallet, needClient, appClient, enqueueSnackbar])

    // ─── Ensure Token ───
    const ensureToken = useCallback(async () => {
        if (!ensureWallet() || !needClient()) return
        if (demo) {
            const fakeId = BigInt(999_002)
            setAssetId(fakeId)
            enqueueSnackbar(`Demo: AARNA token ready (ASA ${fakeId})`, { variant: 'success' })
            return
        }
        setBusy(true)
        try {
            // Fund the app account so it can hold the ASA (min balance requirement)
            const appAddr = appClient.appAddress
            await algorand.send.payment({
                sender: activeAddress!,
                receiver: appAddr,
                amount: AlgoAmount.Algo(1),
                signer: transactionSigner,
            })
            const r = await appClient.send.ensureToken({
                args: [],
                populateAppCallResources: true,
                coverAppCallInnerTransactionFees: true,
                maxFee: AlgoAmount.MicroAlgo(20_000),
            })
            const id = r?.return as bigint | undefined
            if (id) setAssetId(id)
            enqueueSnackbar(`AARNA token ready: ASA ${id?.toString()}`, { variant: 'success' })
        } catch (e: any) {
            console.error('Ensure token error:', e)
            enqueueSnackbar(e?.message || 'Ensure token failed', { variant: 'error' })
        } finally {
            setBusy(false)
        }
    }, [demo, ensureWallet, needClient, appClient, algorand, activeAddress, transactionSigner, enqueueSnackbar])

    // ─── Submit Project ───
    const submitProject = useCallback(async (
        name: string,
        location: string,
        ecosystem: string,
        cid: string,
    ) => {
        if (!ensureWallet() || !needClient()) return
        if (demo) {
            const idx = projectCount
            const newProject: AarnaProject = {
                id: idx,
                name,
                location,
                ecosystem,
                cid,
                status: 'pending',
                credits: 0,
                submitter: activeAddress || 'demo-address',
            }
            setProjects(prev => [...prev, newProject])
            setProjectCount(idx + 1)
            enqueueSnackbar(`Demo: Project #${idx} submitted`, { variant: 'success' })
            return idx
        }
        setBusy(true)
        try {
            const r = await appClient.send.submitProject({
                args: { name, location, ecosystem, cid },
                populateAppCallResources: true,
            })
            const idx = r?.return as bigint | undefined
            const projectIdx = Number(idx ?? 0)
            const newProject: AarnaProject = {
                id: projectIdx,
                name,
                location,
                ecosystem,
                cid,
                status: 'pending',
                credits: 0,
                submitter: activeAddress || '',
            }
            setProjects(prev => [...prev, newProject])
            setProjectCount(projectIdx + 1)
            enqueueSnackbar(`Project #${projectIdx} submitted on-chain!`, { variant: 'success' })
            return projectIdx
        } catch (e: any) {
            console.error('Submit error:', e)
            enqueueSnackbar(e?.message || 'Submit failed', { variant: 'error' })
        } finally {
            setBusy(false)
        }
    }, [demo, ensureWallet, needClient, appClient, activeAddress, projectCount, enqueueSnackbar])

    // ─── Approve Project ───
    const approveProject = useCallback(async (projectId: number, credits: number) => {
        if (!ensureWallet() || !needClient()) return
        if (demo) {
            updateProjectStatus(projectId, 'verified', credits)
            enqueueSnackbar(`Demo: Project #${projectId} approved (${credits} credits)`, { variant: 'success' })
            return
        }
        setBusy(true)
        try {
            await appClient.send.approveProject({
                args: { projectId: BigInt(projectId), credits: BigInt(credits) },
                populateAppCallResources: true,
            })
            // Verify on-chain status updated
            const statusResult = await appClient.send.getProjectStatus({ args: { projectId: BigInt(projectId) } })
            const onChainStatus = Number(statusResult?.return ?? 0)
            if (onChainStatus === 2) {
                updateProjectStatus(projectId, 'verified', credits)
                enqueueSnackbar(`Project #${projectId} approved on-chain! Status verified ✅`, { variant: 'success' })
            } else {
                enqueueSnackbar(`Approve sent but on-chain status is ${onChainStatus} (expected 2). Try again.`, { variant: 'warning' })
            }
        } catch (e: any) {
            console.error('Approve error:', e)
            enqueueSnackbar(e?.message || 'Approve failed', { variant: 'error' })
        } finally {
            setBusy(false)
        }
    }, [demo, ensureWallet, needClient, appClient, updateProjectStatus, enqueueSnackbar])

    // ─── Reject Project ───
    const rejectProject = useCallback(async (projectId: number) => {
        if (!ensureWallet() || !needClient()) return
        if (demo) {
            updateProjectStatus(projectId, 'rejected')
            enqueueSnackbar(`Demo: Project #${projectId} rejected`, { variant: 'info' })
            return
        }
        setBusy(true)
        try {
            await appClient.send.rejectProject({
                args: { projectId: BigInt(projectId) },
                populateAppCallResources: true,
            })
            updateProjectStatus(projectId, 'rejected')
            enqueueSnackbar(`Project #${projectId} rejected`, { variant: 'info' })
        } catch (e: any) {
            console.error('Reject error:', e)
            enqueueSnackbar(e?.message || 'Reject failed', { variant: 'error' })
        } finally {
            setBusy(false)
        }
    }, [demo, ensureWallet, needClient, appClient, updateProjectStatus, enqueueSnackbar])

    // ─── Issue Credits ───
    const issueCredits = useCallback(async (projectId: number) => {
        if (!ensureWallet() || !needClient()) return
        if (demo) {
            updateProjectStatus(projectId, 'issued')
            enqueueSnackbar(`Demo: Credits issued for Project #${projectId}`, { variant: 'success' })
            return
        }
        setBusy(true)
        try {
            // First, verify on-chain that the project is actually approved (status=2)
            const statusResult = await appClient.send.getProjectStatus({ args: { projectId: BigInt(projectId) } })
            const onChainStatus = Number(statusResult?.return ?? 0)
            if (onChainStatus !== 2) {
                const statusNames: Record<number, string> = { 0: 'None', 1: 'Pending', 2: 'Verified', 3: 'Rejected' }
                enqueueSnackbar(
                    `Cannot issue credits — project on-chain status is "${statusNames[onChainStatus] ?? onChainStatus}" (must be "Verified"). Please approve the project first.`,
                    { variant: 'warning' }
                )
                setBusy(false)
                return
            }
            // Fund the app account for inner asset transfer fees
            const appAddr = appClient.appAddress
            await algorand.send.payment({
                sender: activeAddress!,
                receiver: appAddr,
                amount: AlgoAmount.MicroAlgo(200_000),
                signer: transactionSigner,
            })
            await appClient.send.issueCredits({
                args: { projectId: BigInt(projectId) },
                populateAppCallResources: true,
                coverAppCallInnerTransactionFees: true,
                maxFee: AlgoAmount.MicroAlgo(20_000),
            })
            updateProjectStatus(projectId, 'issued')
            enqueueSnackbar(`Credits issued for Project #${projectId}! 🎉`, { variant: 'success' })
        } catch (e: any) {
            console.error('Issue credits error:', e)
            enqueueSnackbar(e?.message || 'Issue failed', { variant: 'error' })
        } finally {
            setBusy(false)
        }
    }, [demo, ensureWallet, needClient, appClient, algorand, activeAddress, transactionSigner, updateProjectStatus, enqueueSnackbar])

    // ─── Opt-In to AARNA ASA ───
    const optInToAsset = useCallback(async () => {
        if (!ensureWallet()) return
        if (demo) {
            enqueueSnackbar('Demo: Opted in to AARNA token', { variant: 'success' })
            return
        }
        if (!activeAddress) {
            enqueueSnackbar('Connect a wallet first', { variant: 'warning' })
            return
        }
        setBusy(true)
        try {
            let id = assetId
            if (!id && appClient) {
                const r = await appClient.send.getAssetId({ args: [] })
                id = r?.return as bigint | undefined
                if (id) setAssetId(id)
            }
            if (!id) {
                enqueueSnackbar('No AARNA token yet — click "Create Token" first', { variant: 'warning' })
                setBusy(false)
                return
            }
            await algorand.send.assetOptIn({
                sender: activeAddress,
                assetId: BigInt(id),
                signer: transactionSigner,
            })
            enqueueSnackbar('Opted in to AARNA token!', { variant: 'success' })
        } catch (e: any) {
            console.error('Opt-in error:', e)
            enqueueSnackbar(e?.message || 'Opt-in failed', { variant: 'error' })
        } finally {
            setBusy(false)
        }
    }, [demo, ensureWallet, appClient, assetId, algorand, activeAddress, transactionSigner, enqueueSnackbar])

    return {
        // State
        appId,
        assetId,
        busy,
        projectCount,
        projects,
        // Actions
        deploy,
        setValidator,
        ensureToken,
        submitProject,
        approveProject,
        rejectProject,
        issueCredits,
        optInToAsset,
    }
}
