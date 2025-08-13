'use client'

import { useMemo, useState } from 'react'
import { isAddress } from 'viem'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { SECURITY_TOKEN_1400_MODULAR_ABI } from '@/config/sto/abi'
import { STO_TOKEN_ADDRESS, PARTITION_FREETRADE, PARTITION_LOCKED } from '@/config/sto/config'

type Partition = 'FREETRADE' | 'LOCKED'

function toBytes32Label(label: Partition): `0x${string}` {
  return (label === 'FREETRADE' ? PARTITION_FREETRADE : PARTITION_LOCKED) as `0x${string}`
}

export default function PartitionedTransfer() {
  const { address, isConnected } = useAccount()
  const { writeContractAsync, isPending } = useWriteContract()

  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [partition, setPartition] = useState<Partition>('FREETRADE')
  const [precheck, setPrecheck] = useState<{ ok: boolean, code?: string, info?: string } | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const isValidAddr = isAddress(to)
  const contract = useMemo(() => STO_TOKEN_ADDRESS ? { address: STO_TOKEN_ADDRESS, abi: SECURITY_TOKEN_1400_MODULAR_ABI } : null, [])

  const { refetch: refetchCan, isFetching } = useReadContract({
    ...(contract ?? {}),
    functionName: 'canTransfer',
    args: address && isValidAddr && contract
      ? [address, to as `0x${string}`, BigInt(Number(amount || '0')), toBytes32Label(partition)]
      : undefined,
    query: { enabled: false },
  } as any)

  async function onPrecheck() {
    setErr(null); setPrecheck(null); setTxHash(null)
    if (!contract) { setErr('컨트랙트 주소를 .env(VITE_STO_ADDRESS)에 설정하세요'); return }
    if (!isConnected || !address) { setErr('지갑을 연결하세요'); return }
    if (!isValidAddr) { setErr('받는 주소가 올바르지 않습니다'); return }
    const { data } = await refetchCan()
    if (!data) { setErr('사전검증 실패'); return }
    const [ok, code, info] = data as any
    setPrecheck({ ok, code, info: typeof info === 'string' ? info : undefined })
  }

  async function onTransfer() {
    setErr(null); setTxHash(null)
    if (!contract) { setErr('컨트랙트 주소가 없습니다'); return }
    try {
      const hash = await writeContractAsync({
        ...(contract as any),
        functionName: 'transferByPartition',
        args: [toBytes32Label(partition), to as `0x${string}`, BigInt(Number(amount || '0')), '0x']
      })
      setTxHash(hash as string)
    } catch (e: any) {
      setErr(e?.shortMessage || e?.message || '전송 실패')
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex gap-2">
        <button
          className={`px-3 py-1 rounded-xl ${partition === 'FREETRADE' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
          onClick={() => setPartition('FREETRADE')}
        >FREETRADE</button>
        <button
          className={`px-3 py-1 rounded-xl ${partition === 'LOCKED' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
          onClick={() => setPartition('LOCKED')}
        >LOCKED</button>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">받는 주소</label>
        <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white outline-none border border-gray-700 focus:border-gray-500"
               value={to} onChange={e => setTo(e.target.value.trim())} placeholder="0x..." />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">수량 (데모: 정수)</label>
        <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white outline-none border border-gray-700 focus:border-gray-500"
               value={amount} onChange={e => setAmount(e.target.value)} inputMode="numeric" placeholder="100" />
      </div>

      <div className="flex gap-2">
        <button onClick={onPrecheck} className="px-3 py-2 rounded-xl bg-blue-500 text-black disabled:opacity-50" disabled={isFetching}>
          사전검증(canTransfer)
        </button>
        <button onClick={onTransfer} className="px-3 py-2 rounded-xl bg-emerald-500 text-black disabled:opacity-50" disabled={isPending}>
          전송하기
        </button>
      </div>

      {precheck && (
        <div className={`p-3 rounded-xl ${precheck.ok ? 'bg-emerald-900/40' : 'bg-rose-900/40'}`}>
          <div className="text-sm">{precheck.ok ? '전송 가능' : '전송 불가'}</div>
          {!precheck.ok && <div className="text-xs text-gray-300 mt-1">이유: {precheck.info} (코드: {precheck.code})</div>}
        </div>
      )}

      {txHash && <div className="text-sm text-gray-300 break-all">tx: {txHash}</div>}
      {(!STO_TOKEN_ADDRESS) && <div className="text-amber-400 text-sm">.env 에 VITE_STO_ADDRESS 를 설정하세요</div>}
      {err && <div className="text-rose-400 text-sm">{err}</div>}
    </div>
  )
}
