'use client'

import { useMemo, useState } from 'react'
import { isAddress } from 'viem'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { SECURITY_TOKEN_1400_MODULAR_ABI } from '@/config/sto/abi'
import { STO_TOKEN_ADDRESS, PARTITION_FREETRADE, PARTITION_LOCKED } from '@/config/sto/config'

export default function ControllerTransfer() {
  const { address } = useAccount()
  const { writeContractAsync, isPending } = useWriteContract()

  const token = useMemo(() => STO_TOKEN_ADDRESS ? { address: STO_TOKEN_ADDRESS, abi: SECURITY_TOKEN_1400_MODULAR_ABI } : null, [])

  const { data: roleId } = useReadContract({
    ...(token ?? {}),
    functionName: 'CONTROLLER_ROLE',
    query: { enabled: !!token }
  } as any)
  const { data: isController } = useReadContract({
    ...(token ?? {}),
    functionName: 'hasRole',
    args: roleId && address && token ? [roleId as `0x${string}`, address] : undefined,
    query: { enabled: !!token && !!roleId && !!address }
  } as any)

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [partition, setPartition] = useState<'FREETRADE'|'LOCKED'>('FREETRADE')
  const [dataHex, setDataHex] = useState<'0x' | `0x${string}`>('0x')

  const canSend = !!token && isController && isAddress(from) && isAddress(to) && !!amount && !isPending

  async function send() {
    if (!token) return
    try {
      const tx = await writeContractAsync({
        ...(token as any),
        functionName: 'controllerTransfer',
        args: [
          partition === 'FREETRADE' ? PARTITION_FREETRADE : PARTITION_LOCKED,
          from as `0x${string}`,
          to as `0x${string}`,
          BigInt(amount),
          dataHex as `0x${string}`,
        ]
      })
      console.log('controllerTransfer tx', tx)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="p-4 rounded-2xl border border-gray-700 space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold">관리자 강제이전 (ERC-1644)</h3>
        <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-white">
          권한: {String(Boolean(isController))}
        </span>
      </div>
      <p className="text-xs text-amber-400">⚠️ 규제/오류 복구 목적. 프로덕션에선 멀티시그/타임락으로 보호하세요.</p>

      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <label className="text-xs text-gray-400">From</label>
          <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                 placeholder="0x..." value={from} onChange={e => setFrom(e.target.value.trim())} />
        </div>
        <div>
          <label className="text-xs text-gray-400">To</label>
          <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                 placeholder="0x..." value={to} onChange={e => setTo(e.target.value.trim())} />
        </div>
        <div>
          <label className="text-xs text-gray-400">Amount</label>
          <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                 placeholder="정수" value={amount} onChange={e => setAmount(e.target.value)} inputMode="numeric" />
        </div>
        <div>
          <label className="text-xs text-gray-400">Partition</label>
          <div className="flex gap-2">
            <button className={`px-3 py-1 rounded-xl ${partition === 'FREETRADE' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
                    onClick={() => setPartition('FREETRADE')}>FREETRADE</button>
            <button className={`px-3 py-1 rounded-xl ${partition === 'LOCKED' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
                    onClick={() => setPartition('LOCKED')}>LOCKED</button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-gray-400">Data (hex)</label>
          <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                 placeholder="0x" value={dataHex} onChange={e => setDataHex((e.target.value || '0x') as any)} />
        </div>
      </div>

      <button className="px-3 py-1 rounded-xl bg-rose-500 text-black disabled:opacity-50"
              disabled={!canSend} onClick={send}>
        강제 이전 실행
      </button>
    </div>
  )
}
