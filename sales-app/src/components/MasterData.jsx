import { useState, useRef } from 'react'
import useMasterList from '../hooks/useMasterList'
import { downloadCsv, parseCsvNames } from '../utils/csv'

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

function MasterSection({ title, icon, collectionName, seedDefaults, allowImportExport }) {
  const { items, loading, add, update, remove } = useMasterList(collectionName, seedDefaults)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const fileInputRef = useRef(null)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    await add(newName)
    setNewName('')
  }

  const startEdit = (item) => {
    setEditingId(item.id)
    setEditingName(item.name)
  }

  const saveEdit = async () => {
    await update(editingId, editingName)
    setEditingId(null)
    setEditingName('')
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`「${item.name}」を削除しますか？`)) return
    await remove(item.id)
  }

  const handleExport = () => {
    downloadCsv(
      `${collectionName}.csv`,
      ['名前'],
      items.map((item) => [item.name])
    )
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const names = parseCsvNames(text)
    const existing = new Set(items.map((item) => item.name))
    for (const name of names) {
      if (!existing.has(name)) {
        await add(name)
        existing.add(name)
      }
    }
    e.target.value = ''
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          {icon} {title}
        </h3>
        {allowImportExport && (
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              📥 インポート
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              onClick={handleExport}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              📤 エクスポート
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={`新しい${title}を入力`}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          追加
        </button>
      </form>

      {loading ? (
        <div className="p-6 text-center text-gray-400 text-sm">読み込み中...</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-sm">登録がありません</div>
      ) : (
        <div className="divide-y divide-gray-50 border border-gray-100 rounded-lg overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-3 py-2">
              {editingId === item.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <span className="text-sm text-gray-800">{item.name}</span>
              )}
              <div className="flex gap-2 flex-shrink-0">
                {editingId === item.id ? (
                  <>
                    <button onClick={saveEdit} className="text-xs text-green-600 hover:underline">
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-gray-400 hover:underline"
                    >
                      キャンセル
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(item)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      削除
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function MasterData() {
  return (
    <div className="space-y-4">
      <MasterSection
        title="顧客"
        icon="👤"
        collectionName="customers"
        seedDefaults={[]}
        allowImportExport
      />
      <MasterSection
        title="商品"
        icon="📦"
        collectionName="products"
        seedDefaults={PRODUCT_DEFAULTS}
        allowImportExport={false}
      />
    </div>
  )
}
