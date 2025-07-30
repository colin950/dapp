import { useEffect, useRef, useState } from 'react'

interface TickerData {
  code: string
  trade_price: number
  signed_change_rate: number
  change_price: number
  acc_trade_price_24h: number
}

const marketNameMap: Record<string, string> = {
  'KRW-MOCA': '모카네트워크',
  'KRW-BTC': '비트코인',
  'KRW-ETH': '이더리움',
  'KRW-USDT': '테더',
}

const marketCodes = Object.keys(marketNameMap)

const useUpbitWebSocket = () => {
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)
  const isMounted = useRef(false)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 10

  const [tickers, setTickers] = useState<Record<string, TickerData>>({})

  const connect = () => {
    // 이미 열려있는 소켓 있으면 중복 연결 방지
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already open, skipping connect')
      return
    }

    // 닫히지 않은 소켓 있으면 닫고 재연결은 onclose에서 처리
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      console.log('Closing existing WebSocket; reconnect deferred to onclose')
      ws.current.close(1000, 'Reconnect')
      return
    }

    console.log('Opening new WebSocket connection')
    ws.current = new WebSocket('wss://api.upbit.com/websocket/v1')

    ws.current.onopen = () => {
      console.log('WebSocket connected')
      reconnectAttempts.current = 0

      ws.current?.send(
        JSON.stringify([
          { ticket: 'price-table' },
          { type: 'ticker', codes: marketCodes, isOnlyRealtime: false },
        ])
      )
    }

    ws.current.onmessage = async (event) => {
      if (ws.current?.readyState !== WebSocket.OPEN) return

      try {
        const blob = event.data as Blob
        const text = await blob.text()
        const data: TickerData = JSON.parse(text)
        setTickers((prev) => ({ ...prev, [data.code]: data }))
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err)
      }
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error', error)
      ws.current?.close()
    }

    ws.current.onclose = (event) => {
      console.warn(`WebSocket closed: code=${event.code} reason=${event.reason}`)
      ws.current = null

      // 정상 종료 및 컴포넌트 언마운트 시 재연결 안함
      if (
        event.code === 1000 ||
        event.reason === 'Component unmounting' ||
        event.reason === 'Reconnect'
      ) {
        console.log('WebSocket closed normally - no reconnect')
        return
      }

      // 비정상 종료면 지수 백오프 적용해 재연결 시도
      if (isMounted.current && reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(3000 * 2 ** reconnectAttempts.current, 30000)
        reconnectAttempts.current++
        reconnectTimer.current = setTimeout(() => {
          console.log('Reconnecting WebSocket...')
          connect()
        }, delay)
      } else {
        console.log('Reconnect limit reached or component unmounted')
      }
    }
  }

  useEffect(() => {
    isMounted.current = true
    connect()

    return () => {
      isMounted.current = false
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting')
        ws.current = null
      }
    }
  }, [])

  return tickers
}

const UpbitPriceTable = () => {
  const tickers = useUpbitWebSocket()

  if (Object.keys(tickers).length === 0) {
    return <div>시세 로딩 중...</div>
  }

  return (
    <table className="w-full text-left text-sm border-collapse">
      <thead className="border-b border-gray-700 text-gray-400">
      <tr>
        <th className="py-2 px-4 min-w-[120px] text-left">한글명</th>
        <th className="py-2 px-4 min-w-[100px] text-right">현재가</th>
        <th className="py-2 px-4 min-w-[100px] text-right">전일대비</th>
        <th className="py-2 px-4 min-w-[120px] text-right">거래대금</th>
      </tr>
      </thead>
      <tbody>
      {marketCodes.map((code) => {
        const ticker = tickers[code]
        if (!ticker) return null

        const changeRatePercent = (ticker.signed_change_rate * 100).toFixed(2)
        const changePrice = ticker.change_price.toFixed(2)
        const isUp = ticker.signed_change_rate > 0
        const colorClass = isUp ? 'text-red-500' : 'text-blue-500'

        return (
          <tr key={code} className="border-b border-gray-800">
            <td className="py-3 px-4 font-semibold whitespace-nowrap">
              {marketNameMap[code] || code}
              <br />
              <span className="text-gray-500 text-xs">{code}</span>
            </td>
            <td className="font-bold text-right min-w-[100px] max-w-[100px] truncate">
              {ticker.trade_price.toLocaleString()}
            </td>
            <td
              className={`${colorClass} py-3 px-4 font-semibold whitespace-nowrap text-right min-w-[100px] max-w-[100px] truncate`}
            >
              {isUp ? '+' : ''}
              {changeRatePercent}%
              <br />
              <span className="text-xs">{changePrice}</span>
            </td>
            <td
              className="py-3 px-4 whitespace-nowrap text-right min-w-[120px] max-w-[120px] truncate"
            >
              {Math.floor(ticker.acc_trade_price_24h / 1_000_000).toLocaleString()}백만
            </td>
          </tr>
        )
      })}
      </tbody>
    </table>


  )
}

export default UpbitPriceTable
