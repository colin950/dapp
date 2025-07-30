// import { useEffect, useState } from 'react'
// import { useAccount, useBalance } from 'wagmi'
// import { ethers } from 'ethers'
//
// interface TokenBalance {
//   symbol: string
//   balance: string
//   decimals: number
// }
//
// const ERC20_ABI = [
//   'function balanceOf(address owner) view returns (uint256)',
//   'function decimals() view returns (uint8)',
//   'function symbol() view returns (string)',
// ]
//
// // 표시할 ERC20 토큰 컨트랙트 주소 배열 (예시)
// const tokenContracts = [
//   {
//     address: '0xYourTokenContractAddress1',
//   },
//   {
//     address: '0xYourTokenContractAddress2',
//   },
// ]
//
// const Balance = () => {
//   const { address, isConnected } = useAccount()
//   const { data: ethBalanceData, isLoading: ethLoading } = useBalance({
//     address,
//   })
//
//   const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([])
//   const [loadingTokens, setLoadingTokens] = useState(false)
//
//   useEffect(() => {
//     if (!address) return
//
//     const fetchTokenBalances = async () => {
//       setLoadingTokens(true)
//
//       if (!window.ethereum) {
//         console.warn('No Ethereum provider found')
//         setLoadingTokens(false)
//         return
//       }
//       const provider = new ethers.providers.Web3Provider(window.ethereum)
//       const balances: TokenBalance[] = []
//
//       for (const token of tokenContracts) {
//         try {
//           const contract = new ethers.Contract(token.address, ERC20_ABI, provider)
//           const [rawBalance, decimals, symbol] = await Promise.all([
//             contract.balanceOf(address),
//             contract.decimals(),
//             contract.symbol(),
//           ])
//           const formattedBalance = ethers.utils.formatUnits(rawBalance, decimals)
//           balances.push({
//             symbol,
//             balance: formattedBalance,
//             decimals,
//           })
//         } catch (e) {
//           console.error('Error fetching token balance:', e)
//         }
//       }
//
//       setTokenBalances(balances)
//       setLoadingTokens(false)
//     }
//
//     fetchTokenBalances()
//   }, [address])
//
//   if (!isConnected) return <div>지갑을 연결해주세요.</div>
//
//   return (
//     <div>
//       <h3 className="text-xl font-semibold mb-4">ETH 잔액</h3>
//       {ethLoading ? (
//         <p>로딩 중...</p>
//       ) : (
//         <p className="text-lg font-bold">{ethBalanceData?.formatted} ETH</p>
//       )}
//
//       <h3 className="text-xl font-semibold mt-8 mb-4">토큰 잔액</h3>
//       {loadingTokens ? (
//         <p>로딩 중...</p>
//       ) : tokenBalances.length === 0 ? (
//         <p>토큰이 없습니다.</p>
//       ) : (
//         <ul>
//           {tokenBalances.map((token) => (
//             <li key={token.symbol} className="mb-2">
//               <span className="font-semibold">{token.symbol}</span>: {token.balance}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   )
// }
//
// export default Balance
