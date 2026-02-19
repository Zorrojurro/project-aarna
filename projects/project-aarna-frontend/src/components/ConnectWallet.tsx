import { useWallet, Wallet, WalletId } from '@txnlab/use-wallet-react'

interface ConnectWalletInterface {
  openModal: boolean
  closeModal: () => void
}

const ConnectWallet = ({ openModal, closeModal }: ConnectWalletInterface) => {
  const { wallets, activeAddress } = useWallet()

  const isKmd = (wallet: Wallet) => wallet.id === WalletId.KMD

  if (!openModal) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0f1a2e] p-6 shadow-2xl shadow-ocean-600/10">
        <h3 className="font-display text-xl font-bold text-gray-200">
          {activeAddress ? 'Wallet Connected' : 'Connect Wallet'}
        </h3>

        <div className="mt-5 space-y-2">
          {activeAddress && (
            <div className="rounded-xl border border-seagrass-500/20 bg-seagrass-500/10 p-4 mb-4">
              <div className="text-xs text-gray-400 mb-1">Connected Address</div>
              <div className="font-mono text-sm text-seagrass-300 break-all">{activeAddress}</div>
            </div>
          )}

          {!activeAddress &&
            wallets?.map((wallet) => (
              <button
                key={`provider-${wallet.id}`}
                onClick={() => wallet.connect()}
                className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-200 hover:bg-white/10 hover:border-ocean-500/30 transition-all"
              >
                {!isKmd(wallet) && (
                  <img
                    alt={`${wallet.id}-icon`}
                    src={wallet.metadata.icon}
                    className="h-7 w-7 object-contain"
                  />
                )}
                <span>{isKmd(wallet) ? 'LocalNet Wallet' : wallet.metadata.name}</span>
              </button>
            ))}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={closeModal}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/10 transition-all"
          >
            Close
          </button>
          {activeAddress && (
            <button
              onClick={async () => {
                const activeWallet = wallets?.find((w) => w.isActive)
                if (activeWallet) {
                  await activeWallet.disconnect()
                } else {
                  localStorage.removeItem('@txnlab/use-wallet:v3')
                  window.location.reload()
                }
              }}
              className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
export default ConnectWallet
