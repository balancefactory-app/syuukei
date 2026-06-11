import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

function toMonthString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export default function MonthlyReport() {
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState(toMonthString(today))
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const [year, month] = selectedMonth.split('-').map(Number)
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59, 999)

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
  }, [selectedMonth])

  // Group by day
  const byDay = sales.reduce((acc, s) => {
    if (!s.createdAt) return acc
    const d = s.createdAt.toDate()
    const key = String(d.getDate()).padStart(2, '0')
    if (!acc[key]) acc[key] = { total: 0, count: 0 }
    acc[key].total += s.amount || 0
    acc[key].count += 1
    return acc
  }, {})

  const grandTotal = sales.reduce((sum, s) => sum + (s.amount || 0), 0)
  const sortedDays = Object.keys(byDay).sort()

  return (
    <div className="space-y-4">
      {/* Month Picker */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">📊 月を選択</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-blue-100 text-xs mb-1">月間売上合計</p>
          <p className="text-xl font-bold">¥{grandTotal.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-teal-100 text-xs mb-1">月間取引件数</p>
          <p className="text-xl font-bold">{sales.length}件</p>
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">日別集計</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">読み込み中...</div>
        ) : sortedDays.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <p className="text-3xl mb-2">📭</p>
            <p>この月の売上データはありません</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {sortedDays.map((day) => {
                const { total, count } = byDay[day]
                const [year, month] = selectedMonth.split('-').map(Number)
                const date = new Date(year, month - 1, Number(day))
                const weekday = date.toLocaleDateString('ja-JP', { weekday: 'short' })
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                return (
                  <div key={day} className="px-4 py-3 flex justify-between items-center">
                    <div>
                      <span className={`text-sm font-medium ${isWeekend ? 'text-red-500' : 'text-gray-800'}`}>
                        {month}月{Number(day)}日({weekday})
                      </span>
                      <span className="text-xs text-gray-400 ml-2">{count}件</span>
                    </div>
                    <span className="text-sm font-bold text-blue-600">¥{total.toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-600 font-medium">月間合計</span>
              <span className="text-base font-bold text-blue-600">¥{grandTotal.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
