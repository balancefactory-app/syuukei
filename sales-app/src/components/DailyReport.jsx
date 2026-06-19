import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, Timestamp, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import { downloadCsv } from '../utils/csv'
import useMasterList from '../hooks/useMasterList'

const PRODUCT_DEFAULTS = [
  'PST/PYG',
  'YOGA',
  'スマホ',
  'バランス',
  'プリカ',
  'マッサージ',
  '体操',
  '加圧',
  '小顔',
  '水',
  '鍼・よくばり',
  '家賃',
]

const STAFF_NAMES = ['武衛', '中尾', '大鷹']

function toLocalDateString(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function DailyReport() {
  const today = toLocalDateString(new Date())
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const { items: customers } = useMasterList('customers', [])
  const { items: products } = useMasterList('products', PRODUCT_DEFAULTS)

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

  const total = sales.reduce((sum, s) => sum + (s.amount || 0), 0)
  const byPayment = sales.reduce((acc, s) => {
    const pm = s.paymentMethod || 'その他'
    acc[pm] = (acc[pm] || 0) + (s.amount || 0)
    return acc
  }, {})

  const paymentIcon = { '現金': '💴', 'カード': '💳', 'QR': '📱' }

  const startEdit = (sale) => {
    setEditingId(sale.id)
    setEditForm({
      customerName: sale.customerName || '',
      productName: sale.productName || '',
      amount: sale.amount || 0,
      staffName: sale.staffName || '',
      paymentMethod: sale.paymentMethod || '現金',
      notes: sale.notes || '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const saveEdit = async () => {
    await updateDoc(doc(db, 'sales', editingId), {
      customerName: editForm.customerName.trim(),
      productName: editForm.productName,
      amount: Number(editForm.amount),
      staffName: editForm.staffName,
      paymentMethod: editForm.paymentMethod,
      notes: editForm.notes.trim(),
    })
    cancelEdit()
  }

  const handleDeleteSale = async (sale) => {
    if (!window.confirm(`「${sale.productName}」（¥${(sale.amount || 0).toLocaleString()}）の売上を削除しますか？`)) return
    await deleteDoc(doc(db, 'sales', sale.id))
  }

  const handleExport = () => {
    downloadCsv(
      `daily_sales_${fromDate}_${toDate}.csv`,
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
      {/* Date Range Picker Card */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">📅 期間を選択</h3>
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
            <p>この期間の売上データはありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sales.map((sale) =>
              editingId === sale.id ? (
                <div key={sale.id} className="px-4 py-3 bg-blue-50 space-y-2">
                  <input
                    type="text"
                    name="customerName"
                    value={editForm.customerName}
                    onChange={handleEditChange}
                    list="daily-edit-customer-suggestions"
                    placeholder="顧客名"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                  />
                  <datalist id="daily-edit-customer-suggestions">
                    {customers.map((c) => (
                      <option key={c.id} value={c.name} />
                    ))}
                  </datalist>
                  <select
                    name="productName"
                    value={editForm.productName}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="amount"
                    value={editForm.amount}
                    onChange={handleEditChange}
                    min="0"
                    step="1"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                  />
                  <select
                    name="staffName"
                    value={editForm.staffName}
                    onChange={handleEditChange}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                  >
                    {STAFF_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-4">
                    {['現金', 'カード', 'QR'].map((method) => (
                      <label key={method} className="flex items-center gap-1.5 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={editForm.paymentMethod === method}
                          onChange={handleEditChange}
                          className="accent-blue-600 w-4 h-4"
                        />
                        {method}
                      </label>
                    ))}
                  </div>
                  <textarea
                    name="notes"
                    value={editForm.notes}
                    onChange={handleEditChange}
                    rows={2}
                    placeholder="備考"
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={cancelEdit} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
                      キャンセル
                    </button>
                    <button onClick={saveEdit} className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                      保存
                    </button>
                  </div>
                </div>
              ) : (
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
                      <div className="flex gap-3 mt-1">
                        <button onClick={() => startEdit(sale)} className="text-xs text-blue-600 hover:underline">
                          編集
                        </button>
                        <button onClick={() => handleDeleteSale(sale)} className="text-xs text-red-500 hover:underline">
                          削除
                        </button>
                      </div>
                    </div>
                    <div className="ml-3 text-right flex-shrink-0">
                      <p className="text-sm font-bold text-blue-600">¥{(sale.amount || 0).toLocaleString()}</p>
                      {sale.createdAt && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {fromDate === toDate
                            ? sale.createdAt.toDate().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                            : sale.createdAt.toDate().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
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
