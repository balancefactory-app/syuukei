import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { downloadCsv } from '../utils/csv'

function toLocalDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function ProductReport() {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const [fromDate, setFromDate] = useState(toLocalDateString(firstOfMonth))
  const [toDate, setToDate] = useState(toLocalDateString(today))
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!fromDate || !toDate) return
    setLoading(true)
    const start = new Date(fromDate + 'T00:00:00')
    const end = new Date(toDate + 'T23:59:59.999')

    const q = query(
      collection(db, 'sales'),
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(q, (snap) => {
      setSales(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })

    return () => unsub()
  }, [fromDate, toDate])

  // Group by product
  const byProduct = sales.reduce((acc, s) => {
    const name = s.productName || '不明'
    if (!acc[name]) acc[name] = { total: 0, count: 0 }
    acc[name].total += s.amount || 0
    acc[name].count += 1
    return acc
  }, {})

  const sortedProducts = Object.entries(byProduct).sort((a, b) => b[1].total - a[1].total)
  const grandTotal = sales.reduce((sum, s) => sum + (s.amount || 0), 0)

  const handleExport = () => {
    downloadCsv(
      `product_sales_${fromDate}_${toDate}.csv`,
      ['日時', '顧客名', '商品名', '金額', '担当スタッフ', '支払い方法', '備考'],
      sales.map((s) => [
        s.createdAt ? s.createdAt.toDate().toLocaleString('ja-JP') : '',
        s.customerName || '',
        s.productName || '',
        s.amount || 0,
        s.staffName || '',
        s.paymentMethod || '',
        s.notes || '',
      ])
    )
  }

  return (
    <div className="space-y-4">
      {/* Date Range Picker */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">📦 期間を選択</h3>
          <button
            onClick={handleExport}
            disabled={sales.length === 0}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📤 CSVエクスポート
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">開始日</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end justify-center pb-1 text-gray-400 hidden sm:flex">〜</div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">終了日</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-blue-100 text-xs mb-1">期間合計売上</p>
          <p className="text-xl font-bold">¥{grandTotal.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-teal-100 text-xs mb-1">商品種別数</p>
          <p className="text-xl font-bold">{sortedProducts.length}種</p>
        </div>
      </div>

      {/* Product ranking */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">商品別売上ランキング</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">読み込み中...</div>
        ) : sortedProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <p className="text-3xl mb-2">📭</p>
            <p>この期間の売上データはありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sortedProducts.map(([name, { total, count }], index) => {
              const pct = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0
              return (
                <div key={name} className="px-4 py-3">
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`text-sm font-bold flex-shrink-0 ${
                        index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-400'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                      </span>
                      <span className="text-sm font-semibold text-gray-800 truncate">{name}</span>
                    </div>
                    <div className="ml-3 text-right flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">¥{total.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 ml-2">{count}件</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-teal-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-gray-400 mt-0.5">{pct}%</div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
