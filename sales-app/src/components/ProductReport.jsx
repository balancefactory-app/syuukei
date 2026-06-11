import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

function formatDate(d) {
  return d.toISOString().split('T')[0]
}

export default function ProductReport() {
  const today = new Date()
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const [startDate, setStartDate] = useState(formatDate(firstOfMonth))
  const [endDate, setEndDate] = useState(formatDate(today))
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const start = new Date(startDate + 'T00:00:00+09:00')
    const end = new Date(endDate + 'T23:59:59+09:00')

    const q = query(
      collection(db, 'sales'),
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(q, (snap) => {
      setSales(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })
    return () => unsub()
  }, [startDate, endDate])

  const byProduct = sales.reduce((acc, s) => {
    if (!acc[s.productName]) acc[s.productName] = { total: 0, count: 0 }
    acc[s.productName].total += s.amount
    acc[s.productName].count += 1
    return acc
  }, {})

  const sorted = Object.entries(byProduct).sort(([, a], [, b]) => b.total - a.total)
  const grandTotal = sales.reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">商品別集計</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">開始</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">終了</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
        </div>
      </div>

      <div className="bg-teal-500 text-white rounded-xl p-5">
        <p className="text-sm text-teal-100 mb-1">期間合計売上</p>
        <p className="text-3xl font-bold">¥{grandTotal.toLocaleString()}</p>
        <p className="text-sm text-teal-100 mt-1">{sorted.length}商品 / {sales.length}件</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">商品別売上ランキング</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">読み込み中...</div>
        ) : sorted.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">この期間の売上データはありません</div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {sorted.map(([product, data], idx) => {
              const pct = grandTotal > 0 ? (data.total / grandTotal) * 100 : 0
              return (
                <li key={product} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-teal-600 w-5">{idx + 1}</span>
                      <span className="text-sm font-medium text-gray-800">{product}</span>
                      <span className="text-xs text-gray-400">{data.count}件</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">¥{data.total.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-7">
                    <div
                      className="h-full bg-teal-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
