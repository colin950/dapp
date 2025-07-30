import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  base,
  mainnet,
  sepolia,
  baseSepolia,
} from 'wagmi/chains'

export const wagmiConfig = getDefaultConfig({
  appName: import.meta.env.VITE_PROJECT_ID,
  projectId: import.meta.env.VITE_PROJECT_ID,
  chains: [mainnet, sepolia, base, baseSepolia],
  ssr: false,
})
