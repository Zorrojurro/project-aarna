import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet-react'
import ConnectWallet from './ConnectWallet'

const NAV_LINKS = [
    { to: '/', label: 'Home', icon: '🌊' },
    { to: '/developer', label: 'Developer', icon: '🔬' },
    { to: '/validator', label: 'Validator', icon: '✅' },
    { to: '/registry', label: 'Registry', icon: '🌍' },
]

interface NavbarProps {
    demo: boolean
    onToggleDemo: () => void
}

export default function Navbar({ demo, onToggleDemo }: NavbarProps) {
    const { activeAddress } = useWallet()
    const [walletOpen, setWalletOpen] = useState(false)
    const location = useLocation()

    const shortAddr = activeAddress
        ? `${activeAddress.slice(0, 4)}...${activeAddress.slice(-4)}`
        : null

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0b1222]/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-600 to-seagrass-600 text-lg font-bold shadow-lg group-hover:shadow-ocean-600/30 transition-shadow">
                            A
                        </div>
                        <span className="font-display text-lg font-bold tracking-tight">
                            Project <span className="text-ocean-400">Aarna</span>
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => {
                            const active = location.pathname === link.to
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all
                    ${active
                                            ? 'bg-ocean-700/30 text-ocean-300'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                        }`}
                                >
                                    <span className="text-base">{link.icon}</span>
                                    {link.label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {/* Demo toggle */}
                        <button
                            onClick={onToggleDemo}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all
                ${demo
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-ocean-700/30 text-ocean-300 border border-ocean-500/30'
                                }`}
                        >
                            <span className={`h-2 w-2 rounded-full ${demo ? 'bg-emerald-400' : 'bg-ocean-400'}`} />
                            {demo ? 'Demo' : 'Live'}
                        </button>

                        {/* Wallet button */}
                        <button
                            onClick={() => setWalletOpen(true)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all
                ${activeAddress
                                    ? 'bg-seagrass-700/30 text-seagrass-400 border border-seagrass-500/20 hover:border-seagrass-500/40'
                                    : 'bg-gradient-to-r from-ocean-600 to-ocean-700 text-white hover:from-ocean-500 hover:to-ocean-600 shadow-lg shadow-ocean-600/20'
                                }`}
                        >
                            {shortAddr || 'Connect Wallet'}
                        </button>
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="flex md:hidden items-center justify-center gap-1 px-2 pb-2">
                    {NAV_LINKS.map((link) => {
                        const active = location.pathname === link.to
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all
                  ${active
                                        ? 'bg-ocean-700/30 text-ocean-300'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                <span className="text-lg">{link.icon}</span>
                                {link.label}
                            </Link>
                        )
                    })}
                </div>
            </nav>
            <ConnectWallet openModal={walletOpen} closeModal={() => setWalletOpen(false)} />
        </>
    )
}
