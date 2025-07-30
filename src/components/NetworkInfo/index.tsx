import { useChainId, useSwitchChain } from 'wagmi'
import { base, baseSepolia, mainnet, sepolia } from 'wagmi/chains'
import styles from './NetworkInfo.module.css'

const NetworkInfo = () => {
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  const currentNetwork = [mainnet, sepolia, base, baseSepolia].find(
    (c) => c.id === chainId
  )?.name ?? `알 수 없음 (${chainId})`

  const handleSwitchToBaseSepolia = () => {
    switchChain({ chainId: baseSepolia.id })
  }

  return (
    <div className={styles.container}>
      <p className={styles.network}>
        🌍 현재 네트워크: <strong>{currentNetwork}</strong> (ID: {chainId})
      </p>

      <button
        className={styles.button}
        onClick={handleSwitchToBaseSepolia}
        disabled={isPending || chainId === baseSepolia.id}
      >
        {isPending
          ? '🔄 네트워크 변경 중...'
          : chainId === baseSepolia.id
            ? '✅ Base Sepolia에 연결됨'
            : '🔁 Base Sepolia로 변경'}
      </button>
    </div>
  )
}

export default NetworkInfo
