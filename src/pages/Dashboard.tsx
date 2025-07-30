import { useState } from 'react'
import UpbitPriceTable from '@/components/UpbitPrice'

const tabs = ['시세', '잔액', 'NFT', '토큰 전송'] as const
type Tab = typeof tabs[number]

const Dashboard = () => {
  const [selectedTab, setSelectedTab] = useState<Tab>('시세')

  return (
    <div className="min-h-screen bg-[#111827] text-white font-sans flex">
      {/* 좌측 탭 네비게이션 */}
      <nav className="w-48 bg-gray-900 p-4 flex flex-col space-y-4 border-r border-gray-700">
        <h1 className="text-2xl font-bold mb-6">🪙 Colin DApp</h1>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`text-left px-4 py-3 rounded-md transition-colors ${
              selectedTab === tab
                ? 'bg-blue-600 text-white font-semibold shadow-lg'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* 우측 콘텐츠 영역 */}
      <main className="flex-1 p-6 overflow-y-auto">
        {selectedTab === '시세' && (
          <section>
            <h2 className="text-3xl font-semibold mb-4">📈 실시간 시세</h2>
            {/* 시세 컴포넌트 */}
            <UpbitPriceTable />
          </section>
          )}
        {selectedTab === '잔액' && (
          <section>
            <h2 className="text-3xl font-semibold mb-4">💰 잔액 보기</h2>
            {/* 잔액 컴포넌트 또는 내용 */}
            <div>잔액 정보 표시 영역</div>
          </section>
        )}
        {selectedTab === 'NFT' && (
          <section>
            <h2 className="text-3xl font-semibold mb-4">🖼️ NFT 보기</h2>
            {/* NFT 컴포넌트 */}
            <div>NFT 정보 표시 영역</div>
          </section>
        )}
        {selectedTab === '토큰 전송' && (
          <section>
            <h2 className="text-3xl font-semibold mb-4">📤 토큰 전송</h2>
            {/* 토큰 전송 폼 컴포넌트 */}
            <div>전송 폼 영역</div>
          </section>
        )}
      </main>
    </div>
  )
}

export default Dashboard
