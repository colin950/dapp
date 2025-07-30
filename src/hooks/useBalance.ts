import { useBalance, useAccount } from 'wagmi'
import { useQuery } from '@tanstack/react-query'

export const useEthBalance = () => {
  const { address } = useAccount()

  return useQuery({
    queryKey: ['ethBalance', address], // ✅ 주소별로 캐싱
    queryFn: async () => {
      if (!address) return null
      const { data } = await useBalance({ address })
      return data
    },
    staleTime: 60000, // ✅ 60초 동안 캐시 유지 (네트워크 요청 최소화)
    refetchInterval: 30000, // ✅ 30초마다 자동 갱신
  })
}
