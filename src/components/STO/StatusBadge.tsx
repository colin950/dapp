'use client'

import { useAccount, useReadContract } from 'wagmi'
import { KYC_REGISTRY_ABI } from '@/config/sto/abi'
import { STO_REGISTRY_ADDRESS } from '@/config/sto/config'

export default function StatusBadge() {
  const { address } = useAccount()
  const { data: isWl } = useReadContract({
    address: STO_REGISTRY_ADDRESS ?? undefined,
    abi: KYC_REGISTRY_ABI,
    functionName: 'isWhitelisted',
    args: address && STO_REGISTRY_ADDRESS ? [address] : undefined,
    query: { enabled: !!address && !!STO_REGISTRY_ADDRESS }
  } as any)
  const { data: lu } = useReadContract({
    address: STO_REGISTRY_ADDRESS ?? undefined,
    abi: KYC_REGISTRY_ABI,
    functionName: 'lockupUntil',
    args: address && STO_REGISTRY_ADDRESS ? [address] : undefined,
    query: { enabled: !!address && !!STO_REGISTRY_ADDRESS }
  } as any)

  if (!address) return null
  return (
    <div className="text-xs text-gray-300">
      내 KYC: {String(isWl)} · lockupUntil: {lu ? String(lu) : '-'}
    </div>
  )
}
