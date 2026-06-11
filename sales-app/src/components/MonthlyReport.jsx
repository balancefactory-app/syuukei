import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

function toYearMonth(date) {
  return date.toISOString().slice(0, 7)
}

export default function MonthlyReport() {
  const [month, setMonth] = useState(toYearMonth(new Date()))
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const [y, m] = month.split('-').map(Number)
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 0, 23, 59, 59)
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
  }, [month])

  const total = sales.reduce((s, r) => s + r.amount, 0)

  // Group by day
  const byDay = sales.reduce((acc, r) => {
    const d = r.createdAt?.toDate()
    if (!d) return acc
    const key = d.toISOString().slice(0, 10)
    if (!acc[key]) acc[key] = { total: 0, count: 0 }
    acc[key].total += r.amount
    acc[key].count += 1
    return acc
  }, {})

  const days = Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0]))

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">月次レポート</h2>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-teal-50 rounded-lg p-4">
            <p className="text-xs text-teal-600 font-medium mb-1">月間合計売上</p>
            <p className="text-2xl font-bold text-teal-700">¥{total.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">総件数</p>
            <p className="text-2xl font-bold text-gray-700">{sales.length}件</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">日付</th>
              <th className="px-4 py-3 text-right">件数</th>
              <th className="px-4 py-3 text-right">売上合計</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan="3" className="px-4 py-6 text-center text-gray-400">読み込み中…</td></tr>
            )}
            {!loading && days.length === 0 && (
              <tr><td colSpan="3" className="px-4 py-6 text-center text-gray-400">売上データがありません</td></tr>
            )}
            {days.map(([day, data]) => (
              <tr key={day} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">{day}</td>
                <td className="px-4 py-3 text-right text-gray-500">{data.count}件</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">¥{data.total.toLocaleString()}</td>
              </tr>
            ))}
            {days.length > 0 && (
              <tr className="bg-teal-50 font-semibold">
                <td className="px-4 py-3 text-teal-700">合計</td>
                <td className="px-4 py-3 text-right text-teal-700">{sales.length}件</td>
                <td className="px-4 py-3 text-right text-teal-700">¥{total.toLocaleString()}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
