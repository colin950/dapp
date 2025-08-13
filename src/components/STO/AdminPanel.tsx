'use client'

import { useMemo, useState } from 'react'
import { isAddress } from 'viem'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { SECURITY_TOKEN_1400_MODULAR_ABI, KYC_REGISTRY_ABI } from '@/config/sto/abi'
import { STO_TOKEN_ADDRESS, STO_REGISTRY_ADDRESS, STO_VALIDATOR_ADDRESS, PARTITION_FREETRADE, PARTITION_LOCKED } from '@/config/sto/config'

export default function AdminPanel() {
  const { address } = useAccount()
  const { writeContractAsync, isPending } = useWriteContract()

  const token = useMemo(() => STO_TOKEN_ADDRESS ? { address: STO_TOKEN_ADDRESS, abi: SECURITY_TOKEN_1400_MODULAR_ABI } : null, [])
  const registry = useMemo(() => STO_REGISTRY_ADDRESS ? { address: STO_REGISTRY_ADDRESS, abi: KYC_REGISTRY_ABI } : null, [])

  const [whAddr, setWhAddr] = useState('')
  const [whAllow, setWhAllow] = useState(true)

  const [issueAddr, setIssueAddr] = useState('')
  const [issueAmt, setIssueAmt] = useState('')
  const [issuePartition, setIssuePartition] = useState<'FREETRADE' | 'LOCKED'>('FREETRADE')

  const [lockAddr, setLockAddr] = useState('')
  const [lockUntil, setLockUntil] = useState('')

  const [newValidator, setNewValidator] = useState(STO_VALIDATOR_ADDRESS || '')

  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const statusTarget = whAddr || address
  const { data: isWl } = useReadContract({
    ...(registry ?? {}),
    functionName: 'isWhitelisted',
    args: statusTarget && registry && isAddress(statusTarget) ? [statusTarget as `0x${string}`] : undefined,
    query: { enabled: !!registry && !!statusTarget && isAddress(statusTarget) }
  } as any)
  const { data: lu } = useReadContract({
    ...(registry ?? {}),
    functionName: 'lockupUntil',
    args: statusTarget && registry && isAddress(statusTarget) ? [statusTarget as `0x${string}`] : undefined,
    query: { enabled: !!registry && !!statusTarget && isAddress(statusTarget) }
  } as any)

  async function callRegistry(fnName: string, args: any[]) {
    setMsg(null); setErr(null)
    if (!registry) { setErr('REGISTRY 주소가 없습니다'); return }
    try {
      const hash = await writeContractAsync({ ...(registry as any), functionName: fnName as any, args })
      setMsg(`${fnName} submitted: ${hash}`)
    } catch (e: any) {
      setErr(e?.shortMessage || e?.message || '실패')
    }
  }

  async function callToken(fnName: string, args: any[]) {
    setMsg(null); setErr(null)
    if (!token) { setErr('TOKEN 주소가 없습니다'); return }
    try {
      const hash = await writeContractAsync({ ...(token as any), functionName: fnName as any, args })
      setMsg(`${fnName} submitted: ${hash}`)
    } catch (e: any) {
      setErr(e?.shortMessage || e?.message || '실패')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-gray-400 space-y-1">
        <div>Token: <span className="break-all">{STO_TOKEN_ADDRESS ?? '-'}</span></div>
        <div>Registry: <span className="break-all">{STO_REGISTRY_ADDRESS ?? '-'}</span></div>
        <div>Validator: <span className="break-all">{STO_VALIDATOR_ADDRESS ?? '-'}</span></div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* whitelist */}
        <div className="p-4 rounded-2xl border border-gray-700">
          <h3 className="font-semibold mb-3">Whitelist</h3>
          <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                 placeholder="0x..." value={whAddr} onChange={e => setWhAddr(e.target.value.trim())} />
          <div className="mt-2 flex items-center gap-2">
            <label className="text-sm"><input type="checkbox" checked={whAllow} onChange={e => setWhAllow(e.target.checked)} /> allow</label>
            <button className="px-3 py-1 rounded-xl bg-emerald-500 text-black disabled:opacity-50"
                    disabled={!isAddress(whAddr) || isPending}
                    onClick={() => callRegistry('setWhitelist', [whAddr as `0x${string}`, whAllow])}>
              저장
            </button>
          </div>
          {isAddress(statusTarget || '') && (
            <div className="text-xs text-gray-400 mt-2">
              상태: {String(isWl)} · lockupUntil: {lu ? String(lu) : '-'}
            </div>
          )}
        </div>

        {/* issue */}
        <div className="p-4 rounded-2xl border border-gray-700">
          <h3 className="font-semibold mb-3">Issue by Partition</h3>
          <div className="flex gap-2 mb-2">
            <button className={`px-3 py-1 rounded-xl ${issuePartition === 'FREETRADE' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
                    onClick={() => setIssuePartition('FREETRADE')}>FREETRADE</button>
            <button className={`px-3 py-1 rounded-xl ${issuePartition === 'LOCKED' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
                    onClick={() => setIssuePartition('LOCKED')}>LOCKED</button>
          </div>
          <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 mb-2"
                 placeholder="받는 주소 0x..." value={issueAddr} onChange={e => setIssueAddr(e.target.value.trim())} />
          <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 mb-2"
                 placeholder="수량 (정수)" value={issueAmt} onChange={e => setIssueAmt(e.target.value)} inputMode="numeric" />
          <button className="px-3 py-1 rounded-xl bg-emerald-500 text-black disabled:opacity-50"
                  disabled={!isAddress(issueAddr) || !issueAmt || isPending}
                  onClick={() => callToken('issueByPartition', [
                    issuePartition === 'FREETRADE' ? PARTITION_FREETRADE : PARTITION_LOCKED,
                    issueAddr as `0x${string}`,
                    BigInt(Number(issueAmt || '0'))
                  ])}>
            발행
          </button>
        </div>

        {/* lockup */}
        <div className="p-4 rounded-2xl border border-gray-700">
          <h3 className="font-semibold mb-3">Lockup</h3>
          <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 mb-2"
                 placeholder="대상 주소 0x..." value={lockAddr} onChange={e => setLockAddr(e.target.value.trim())} />
          <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 mb-2"
                 placeholder="until (unix seconds)" value={lockUntil} onChange={e => setLockUntil(e.target.value)} inputMode="numeric" />
          <button className="px-3 py-1 rounded-xl bg-emerald-500 text-black disabled:opacity-50"
                  disabled={!isAddress(lockAddr) || !lockUntil || isPending}
                  onClick={() => callRegistry('setLockup', [lockAddr as `0x${string}`, BigInt(Number(lockUntil || '0'))])}>
            저장
          </button>
        </div>

        {/* token admin */}
        <div className="p-4 rounded-2xl border border-gray-700 space-y-2">
          <h3 className="font-semibold mb-3">Token Admin</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-xl bg-rose-500 text-black disabled:opacity-50"
                    disabled={isPending} onClick={() => callToken('pause', [])}>
              Pause
            </button>
            <button className="px-3 py-1 rounded-xl bg-emerald-500 text-black disabled:opacity-50"
                    disabled={isPending} onClick={() => callToken('unpause', [])}>
              Unpause
            </button>
          </div>
          <div className="mt-2">
            <label className="block text-sm text-gray-300 mb-1">Set Validator</label>
            <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                   placeholder="0x..." value={newValidator} onChange={e => setNewValidator(e.target.value.trim())} />
            <button className="mt-2 px-3 py-1 rounded-xl bg-blue-500 text-black disabled:opacity-50"
                    disabled={!isAddress(newValidator) || isPending}
                    onClick={() => callToken('setValidator', [newValidator as `0x${string}`])}>
              변경
            </button>
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="p-4 rounded-2xl border border-gray-700">
        <h3 className="font-semibold mb-3">상태</h3>
        {msg && <div className="text-sm text-emerald-400 break-all">{msg}</div>}
        {err && <div className="text-sm text-rose-400">{err}</div>}
        {(!STO_TOKEN_ADDRESS || !STO_REGISTRY_ADDRESS) && <div className="text-amber-400 text-sm">.env에 VITE_STO_* 주소를 설정하세요</div>}
      </div>
    </div>
  )
}
