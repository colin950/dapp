import { useMemo, useState } from 'react'
import { isAddress, parseEther, parseUnits } from 'viem'
import { useAccount, useBalance, useChainId, useReadContract, useWriteContract, useSendTransaction } from 'wagmi'

const ERC20_ABI = [
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
] as const

type Mode = 'NATIVE' | 'ERC20'

const explorers: Record<number, string> = {
  1: 'https://etherscan.io',
  11155111: 'https://sepolia.etherscan.io',
  8453: 'https://basescan.org',
  84532: 'https://sepolia.basescan.org',
}

export default function Transfer() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: nativeBal } = useBalance({ address, query: { enabled: !!address } })
  const { writeContractAsync, isPending: isWriting } = useWriteContract()
  const { sendTransactionAsync, isPending: isSending } = useSendTransaction()

  const [mode, setMode] = useState<Mode>('NATIVE')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [token, setToken] = useState('') // ERC20 address
  const [txHash, setTxHash] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const isValidTo = isAddress(to)
  const isTokenAddressValid = !!token && isAddress(token)   // ← 항상 boolean
  const isValidToken = mode === 'NATIVE' || isTokenAddressValid

  // ERC20 metadata & balance
  const { data: decimalsData } = useReadContract({
    address: isValidToken && mode === 'ERC20' ? (token as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: 'decimals',
    query: { enabled: mode === 'ERC20' && isValidToken }
  })

  const decimals = (typeof decimalsData === 'number' ? decimalsData : Number(decimalsData)) || 18

  const { data: symbolData } = useReadContract({
    address: isValidToken && mode === 'ERC20' ? (token as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: 'symbol',
    query: { enabled: mode === 'ERC20' && isValidToken }
  })

  const tokenSymbol = typeof symbolData === 'string' ? symbolData : undefined

  const { data: tokenBal } = useReadContract({
    address: isValidToken && mode === 'ERC20' ? (token as `0x${string}`) : undefined,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: mode === 'ERC20' && isValidToken && !!address }
  })

  const humanTokenBal = useMemo(() => {
    try {
      if (!tokenBal) return '0'
      const bn = BigInt(tokenBal as any)
      const s = (Number(bn) / 10 ** decimals).toString()
      return parseFloat(s).toLocaleString(undefined, { maximumFractionDigits: Math.min(decimals, 6) })
    } catch {
      return '0'
    }
  }, [tokenBal, decimals])

  const humanNativeBal = nativeBal ? Number(nativeBal.formatted).toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0'

  const canSubmit = isConnected && isValidTo && !!amount && Number(amount) > 0 && (mode === 'NATIVE' || isValidToken)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setTxHash(null)
    if (!canSubmit) return

    try {
      if (mode === 'NATIVE') {
        const value = parseEther(amount as `${number}`)
        const hash = await sendTransactionAsync({ to: to as `0x${string}`, value })
        setTxHash(hash)
      } else {
        const value = parseUnits(amount as `${number}`, decimals)
        const hash = await writeContractAsync({
          address: token as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [to as `0x${string}`, value],
        })
        setTxHash(hash)
      }
    } catch (e: any) {
      const msg = e?.shortMessage || e?.message || '전송 실패'
      setErr(msg)
    }
  }

  const explorer = explorers[chainId || 0]

  return (
    <div className="max-w-xl w-full">
      <div className="mb-4 flex items-center gap-2">
        <button
          className={`px-3 py-1 rounded-xl ${mode === 'NATIVE' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
          onClick={() => setMode('NATIVE')}
        >
          Native(ETH)
        </button>
        <button
          className={`px-3 py-1 rounded-xl ${mode === 'ERC20' ? 'bg-white text-black' : 'bg-gray-800 text-white'}`}
          onClick={() => setMode('ERC20')}
        >
          ERC20
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === 'ERC20' && (
          <div>
            <label className="block text-sm text-gray-300 mb-1">토큰 주소 (ERC20)</label>
            <input
              className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white outline-none border border-gray-700 focus:border-gray-500"
              placeholder="0x..."
              value={token}
              onChange={e => setToken(e.target.value.trim())}
            />
            {token && !isValidToken && <p className="text-rose-400 text-sm mt-1">유효한 주소가 아닙니다</p>}
            {isValidToken && tokenSymbol && (
              <p className="text-gray-400 text-sm mt-1">토큰: {tokenSymbol} · 잔액: {humanTokenBal}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-300 mb-1">받는 주소</label>
          <input
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white outline-none border border-gray-700 focus:border-gray-500"
            placeholder="0x..."
            value={to}
            onChange={e => setTo(e.target.value.trim())}
          />
          {to && !isValidTo && <p className="text-rose-400 text-sm mt-1">유효한 주소가 아닙니다</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">보낼 수량</label>
          <input
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white outline-none border border-gray-700 focus:border-gray-500"
            placeholder={mode === 'NATIVE' ? '0.01' : '100'}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputMode="decimal"
          />
          <p className="text-gray-400 text-sm mt-1">
            내 잔액: {mode === 'NATIVE' ? `${humanNativeBal}` : `${humanTokenBal}`} {mode === 'NATIVE' ? (nativeBal?.symbol ?? '') : (tokenSymbol ?? '')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || isWriting || isSending}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-black disabled:opacity-50"
          >
            {isWriting || isSending ? '전송 중...' : '전송하기'}
          </button>

          {explorer && txHash && (
            <a
              className="px-4 py-2 rounded-xl bg-gray-700 text-white"
              href={`${explorer}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
            >
              트랜잭션 보기 ↗
            </a>
          )}
        </div>

        {err && <p className="text-rose-400 text-sm">{err}</p>}
      </form>
    </div>
  )
}
