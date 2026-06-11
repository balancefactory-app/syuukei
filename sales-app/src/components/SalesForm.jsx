import { useState } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

const PAYMENT_METHODS = ['現金', 'カード', 'QR']

const INITIAL = {
  productName: '',
  amount: '',
  staffName: '',
  paymentMethod: '現金',
  notes: '',
}

export default function SalesForm() {
  const [form, setForm] = useState(INITIAL)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.productName.trim() || !form.amount || !form.staffName.trim()) {
      setError('商品名・金額・スタッフ名は必須です')
      return
    }
    setLoading(true)
    setError('')
    try {
      await addDoc(collection(db, 'sales'), {
        productName: form.productName.trim(),
        amount: Number(form.amount),
        staffName: form.staffName.trim(),
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),
        createdAt: Timestamp.now(),
      })
      setForm(INITIAL)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('保存に失敗しました: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-5">売上入力</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ 売上を登録しました
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            商品名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="productName"
            value={form.productName}
            onChange={handleChange}
            placeholder="例：ランチセット"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            受取り代金（円） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            担当スタッフ名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="staffName"
            value={form.staffName}
            onChange={handleChange}
            placeholder="例：田中"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            支払い方法
          </label>
          <div className="flex gap-3">
            {PAYMENT_METHODS.map((method) => (
              <label key={method} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method}
                  checked={form.paymentMethod === method}
                  onChange={handleChange}
                  className="accent-teal-600"
                />
                <span className="text-sm text-gray-700">{method}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            備考
          </label>
          <input
            type="text"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="任意"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? '登録中…' : '売上を登録'}
        </button>
      </form>
    </div>
  )
}
