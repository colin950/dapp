'use client'

import { useMemo, useState } from 'react'
import { useReadContract, useWriteContract } from 'wagmi'
import { SECURITY_TOKEN_1400_MODULAR_ABI } from '@/config/sto/abi'
import { STO_TOKEN_ADDRESS } from '@/config/sto/config'
import { keccak256, stringToBytes } from 'viem'

export default function DocsPanel() {
  // const { address } = useAccount()
  const { writeContractAsync, isPending } = useWriteContract()

  const token = useMemo(() => STO_TOKEN_ADDRESS ? { address: STO_TOKEN_ADDRESS, abi: SECURITY_TOKEN_1400_MODULAR_ABI } : null, [])

  const [name, setName] = useState('SubscriptionAgreement')
  const [uri, setUri] = useState('')
  const [hashHex, setHashHex] = useState<`0x${string}` | ''>('')

  const nameKey: `0x${string}` | null = name ? (keccak256(stringToBytes(name)) as `0x${string}`) : null

  const { data: doc } = useReadContract({
    ...(token ?? {}),
    functionName: 'documents',
    args: nameKey && token ? [nameKey] : undefined,
    query: { enabled: !!token && !!nameKey }
  } as any)

  const currentUri = Array.isArray(doc) ? (doc[0] as string) : undefined
  const currentHash = Array.isArray(doc) ? (doc[1] as `0x${string}`) : undefined
  const lastModified = Array.isArray(doc) ? Number(doc[2]) : undefined

  function computeHashFromUri(u: string) {
    try {
      const hex = keccak256(stringToBytes(u)) as `0x${string}`
      setHashHex(hex)
    } catch {}
  }

  async function save() {
    if (!token || !nameKey) return
    const finalHash = (hashHex && hashHex.startsWith('0x') ? hashHex : ('0x' + hashHex)) as `0x${string}`
    try {
      const tx = await writeContractAsync({
        ...(token as any),
        functionName: 'setDocument',
        args: [nameKey, uri, finalHash]
      })
      console.log('setDocument tx', tx)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="p-4 rounded-2xl border border-gray-700 space-y-3">
      <h3 className="font-semibold">문서 관리 (ERC-1643)</h3>

      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <label className="text-xs text-gray-400">문서 이름(키)</label>
          <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                 value={name} onChange={e => setName(e.target.value)} />
          <div className="text-xs text-gray-500 mt-1">key: {nameKey}</div>
        </div>
        <div>
          <label className="text-xs text-gray-400">문서 URI</label>
          <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                 placeholder="https://.../doc.pdf" value={uri}
                 onChange={e => { setUri(e.target.value); computeHashFromUri(e.target.value) }} />
        </div>
        <div>
          <label className="text-xs text-gray-400">문서 해시(자동 계산, 수정 가능)</label>
          <input className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700"
                 placeholder="0x..." value={hashHex}
                 onChange={e => setHashHex(e.target.value as `0x${string}`)} />
        </div>
        <div className="text-xs text-gray-400">
          현재 등록된 문서:<br/>
          URI: <span className="break-all">{currentUri || '-'}</span><br/>
          hash: <span className="break-all">{currentHash || '-'}</span><br/>
          lastModified: {lastModified ? new Date(lastModified * 1000).toLocaleString() : '-'}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="px-3 py-1 rounded-xl bg-emerald-500 text-black disabled:opacity-50"
                disabled={!token || !nameKey || !uri || !hashHex || isPending}
                onClick={save}>
          저장
        </button>
      </div>
    </div>
  )
}
