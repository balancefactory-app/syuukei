import { useState } from 'react'
import SalesForm from './components/SalesForm'
import DailyReport from './components/DailyReport'
import MonthlyReport from './components/MonthlyReport'
import ProductReport from './components/ProductReport'
import MasterData from './components/MasterData'

const tabs = [
  { id: 'form', label: '売上入力', icon: '📝' },
  { id: 'daily', label: '日次レポート', icon: '📅' },
  { id: 'monthly', label: '月次レポート', icon: '📊' },
  { id: 'product', label: '商品別', icon: '📦' },
  { id: 'master', label: '顧客・商品管理', icon: '🗂️' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('form')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold tracking-wide">売上管理システム</h1>
          <p className="text-blue-100 text-sm mt-0.5">Sales Aggregation App</p>
        </div>
      </header>

      {/* Sticky Tab Navigation */}
      <nav className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-2">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'form' && <SalesForm />}
        {activeTab === 'daily' && <DailyReport />}
        {activeTab === 'monthly' && <MonthlyReport />}
        {activeTab === 'product' && <ProductReport />}
        {activeTab === 'master' && <MasterData />}
      </main>
    </div>
  )
}
