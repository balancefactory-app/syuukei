import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, Timestamp, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

function toDateString(date) {
  return date.toISOString().slice(0, 10)
}

export default function DailyReport() {
  const [date, setDate] = useState(toDateString(new Date()))
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const start = new Date(date + 'T00:00:00')
    const end = new Date(date + 'T23:59:59')
    const q = query(
      collection(db, 'sales'),
      where('createdAt', '>=', Timestamp.fromDate(start)),
      where('createdAt', '<=', Timestamp.fromDate(end)),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setSales(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [date])

  const total = sales.reduce((s, r) => s + r.amount, 0)
  const byPayment = sales.reduce((acc, r) => {
    acc[r.paymentMethod] = (acc[r.paymentMethod] || 0) + r.amount
    return acc
  }, {})

  async function handleDelete(id) {
    if (!confirm('この売上を削除しますか？')) return
    await deleteDoc(doc(db, 'sales', id))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">日次レポート</h2>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-teal-50 rounded-lg p-4">
            <p className="text-xs text-teal-600 font-medium mb-1">合計売上</p>
            <p className="text-2xl font-bold text-teal-700">¥{total.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">件数</p>
            <p className="text-2xl font-bold text-gray-700">{sales.length}件</p>
          </div>
        </div>

        {Object.keys(byPayment).length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {Object.entries(byPayment).map(([method, amt]) => (
              <span key={method} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {method}: ¥{amt.toLocaleString()}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">時刻</th>
              <th className="px-4 py-3 text-left">商品名</th>
              <th className="px-4 py-3 text-left">スタッフ</th>
              <th className="px-4 py-3 text-right">金額</th>
              <th className="px-4 py-3 text-center">支払</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-400">読み込み中…</td></tr>
            )}
            {!loading && sales.length === 0 && (
              <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-400">売上データがありません</td></tr>
            )}
            {sales.map((s) => {
              const t = s.createdAt?.toDate()
              const time = t ? t.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '-'
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{time}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{s.productName}</td>
                  <td className="px-4 py-3 text-gray-600">{s.staffName}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">¥{s.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s.paymentMethod}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600 text-xs">削除</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
