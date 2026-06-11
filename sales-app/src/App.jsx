import { useState } from 'react'
import SalesForm from './components/SalesForm'
import DailyReport from './components/DailyReport'
import MonthlyReport from './components/MonthlyReport'
import ProductReport from './components/ProductReport'

const tabs = [
  { id: 'form', label: '売上入力' },
  { id: 'daily', label: '日次レポート' },
  { id: 'monthly', label: '月次レポート' },
  { id: 'product', label: '商品別' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('form')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-600 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold tracking-wide">売上管理</h1>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-2">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
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
      </main>
    </div>
  )
}
