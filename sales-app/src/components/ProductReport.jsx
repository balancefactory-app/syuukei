import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

function toDateString(date) {
  return date.toISOString().slice(0, 10)
}

export default function ProductReport() {
  const today = toDateString(new Date())
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const start = new Date(from + 'T00:00:00')
    const end = new Date(to + 'T23:59:59')
    const q = query(
      collection(db, 'sales'),
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setSales(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [from, to])

  const byProduct = sales.reduce((acc, r) => {
    if (!acc[r.productName]) acc[r.productName] = { total: 0, count: 0 }
    acc[r.productName].total += r.amount
    acc[r.productName].count += 1
    return acc
  }, {})

  const products = Object.entries(byProduct).sort((a, b) => b[1].total - a[1].total)
  const grandTotal = sales.reduce((s, r) => s + r.amount, 0)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">商品別レポート</h2>
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">開始</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">終了</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {grandTotal > 0 && (
          <div className="mt-4 bg-teal-50 rounded-lg p-4">
            <p className="text-xs text-teal-600 font-medium mb-1">期間合計売上</p>
            <p className="text-2xl font-bold text-teal-700">¥{grandTotal.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">商品名</th>
              <th className="px-4 py-3 text-right">件数</th>
              <th className="px-4 py-3 text-right">売上合計</th>
              <th className="px-4 py-3 text-right">構成比</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-400">読み込み中…</td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-400">売上データがありません</td></tr>
            )}
            {products.map(([name, data]) => (
              <tr key={name} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{name}</td>
                <td className="px-4 py-3 text-right text-gray-500">{data.count}件</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">¥{data.total.toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-gray-500">
                  {grandTotal > 0 ? Math.round((data.total / grandTotal) * 100) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
