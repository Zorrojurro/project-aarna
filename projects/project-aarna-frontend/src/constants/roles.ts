/**
 * Role-based access constants for Project Aarna.
 * The validator address is fixed — only this wallet sees the Validator dashboard.
 * All other wallets see the Developer dashboard.
 */

/** The fixed validator wallet address (Algorand Testnet) */
export const VALIDATOR_ADDRESS = 'CAVWL5TGO4XTTNAMPYRFSY7ZQ73H7YDWE5UP5DGD26DLI5MEL2FCMIZAYM'

/** Check if a wallet address is the validator */
export const isValidator = (address: string | null | undefined): boolean =>
    !!address && address === VALIDATOR_ADDRESS
