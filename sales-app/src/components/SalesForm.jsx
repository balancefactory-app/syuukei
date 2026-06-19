import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
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

const initialForm = {
  customerName: '',
  productName: '',
  amount: '',
  staffName: '',
  paymentMethod: '現金',
  notes: '',
}

export default function SalesForm() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'success'|'error', text: string }
  const { items: customers } = useMasterList('customers', [])
  const { items: products } = useMasterList('products', PRODUCT_DEFAULTS)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await addDoc(collection(db, 'sales'), {
        customerName: form.customerName.trim(),
        productName: form.productName,
        amount: Number(form.amount),
        staffName: form.staffName.trim(),
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),
        createdAt: serverTimestamp(),
      })
      setMessage({ type: 'success', text: '売上を登録しました！' })
      setForm(initialForm)
    } catch (err) {
      console.error(err)
      setMessage({ type: 'error', text: `登録に失敗しました: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-lg mx-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>📝</span> 売上入力
      </h2>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? '✅ ' : '❌ '}{message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 顧客名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            顧客名 <span className="text-gray-400 text-xs font-normal">(任意)</span>
          </label>
          <select
            name="customerName"
            value={form.customerName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">選択してください</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.name}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* 商品名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            商品名 <span className="text-red-500">*</span>
          </label>
          <select
            name="productName"
            value={form.productName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="" disabled>
              選択してください
            </option>
            {products.map((product) => (
              <option key={product.id} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* 受取り代金 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            受取り代金 (円) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            min="0"
            step="1"
            placeholder="例: 1500"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 担当スタッフ名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            担当スタッフ名 <span className="text-red-500">*</span>
          </label>
          <select
            name="staffName"
            value={form.staffName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="" disabled>
              選択してください
            </option>
            {STAFF_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* 支払い方法 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            支払い方法 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            {['現金', 'カード', 'QR'].map((method) => (
              <label key={method} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={form.paymentMethod === method}
                  onChange={handleChange}
                  className="accent-blue-600 w-4 h-4"
                />
                <span className="text-sm text-gray-700">
                  {method === '現金' ? '💴 現金' : method === 'カード' ? '💳 カード' : '📱 QR'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 備考 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            備考 <span className="text-gray-400 text-xs font-normal">(任意)</span>
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder="メモがあれば入力してください"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-md"
        >
          {loading ? '登録中...' : '💾 売上を登録する'}
        </button>
      </form>
    </div>
  )
}
