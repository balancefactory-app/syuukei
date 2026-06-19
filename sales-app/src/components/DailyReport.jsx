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

export default function DailyReport() {
  const [selectedDate, setSelectedDate] = useState(toLocalDateString(new Date()))
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const start = new Date(selectedDate + 'T00:00:00')
    const end = new Date(selectedDate + 'T23:59:59.999')

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
  }, [selectedDate])

  const total = sales.reduce((sum, s) => sum + (s.amount || 0), 0)
  const byPayment = sales.reduce((acc, s) => {
    const pm = s.paymentMethod || 'その他'
    acc[pm] = (acc[pm] || 0) + (s.amount || 0)
    return acc
  }, {})

  const paymentIcon = { '現金': '💴', 'カード': '💳', 'QR': '📱' }

  const handleExport = () => {
    downloadCsv(
      `daily_sales_${selectedDate}.csv`,
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
      {/* Date Picker Card */}
      <div className="bg-white rounded-xl shadow-md p-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">📅 日付を選択</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleExport}
          disabled={sales.length === 0}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          📤 CSVエクスポート
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-blue-100 text-xs mb-1">合計売上</p>
          <p className="text-2xl font-bold">¥{total.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white shadow-md">
          <p className="text-teal-100 text-xs mb-1">取引件数</p>
          <p className="text-2xl font-bold">{sales.length}件</p>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      {sales.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">支払い方法別</h3>
          <div className="space-y-2">
            {Object.entries(byPayment).map(([method, amt]) => (
              <div key={method} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{paymentIcon[method] || '💰'} {method}</span>
                <span className="font-semibold text-gray-800">¥{amt.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sales List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">売上一覧</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">読み込み中...</div>
        ) : sales.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <p className="text-3xl mb-2">📭</p>
            <p>この日の売上データはありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sales.map((sale) => (
              <div key={sale.id} className="px-4 py-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{sale.productName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {paymentIcon[sale.paymentMethod]} {sale.paymentMethod} ・ {sale.staffName}
                      {sale.customerName && <> ・ 👤 {sale.customerName}</>}
                    </p>
                    {sale.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{sale.notes}</p>
                    )}
                  </div>
                  <div className="ml-3 text-right flex-shrink-0">
                    <p className="text-sm font-bold text-blue-600">¥{(sale.amount || 0).toLocaleString()}</p>
                    {sale.createdAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sale.createdAt.toDate().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {sales.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-600 font-medium">合計</span>
            <span className="text-base font-bold text-blue-600">¥{total.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}
