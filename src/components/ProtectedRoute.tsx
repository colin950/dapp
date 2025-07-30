import { ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: ReactNode
}

// 지갑 연결 상태를 체크해서
// 연결 안 되어 있으면 "/"(랜딩)로 리다이렉트
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isConnected } = useAccount()

  if (!isConnected) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
