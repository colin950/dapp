import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import '@rainbow-me/rainbowkit/styles.css'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'

const Layout = () => {
  const { isConnected } = useAccount()
  const navigate = useNavigate()

  useEffect(() => {
    if (isConnected) {
      // 지갑 연결되면 대시보드로 이동
      if (window.location.pathname === '/') {
        navigate('/dashboard')
      }
    } else {
      // 지갑 연결 해제되면 랜딩 페이지로 이동
      if (window.location.pathname !== '/') {
        navigate('/')
      }
    }
  }, [isConnected, navigate])

  return (
    <div className="min-h-screen bg-[#111827] text-white font-sans flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          🪙 Colin DApp
        </Link>
        <div className="z-50">
          <ConnectButton
            chainStatus="name"
            showBalance={false}
            accountStatus="address"
            label="Connect Wallet"
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-start p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
