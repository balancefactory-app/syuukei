import { useState, useRef } from 'react'
import useMasterList from '../hooks/useMasterList'
import { downloadCsv, parseCsvNames, parseCsvByColumn } from '../utils/csv'

const CUSTOMER_NAME_HEADERS = ['お客様名', '顧客名', '名前', 'name']

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

const PAGE_SIZE = 25

function MasterSection({ title, icon, collectionName, seedDefaults, allowImportExport, importColumnHeaders }) {
  const { items, loading, add, update, remove, addMany } = useMasterList(collectionName, seedDefaults)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [page, setPage] = useState(0)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [search, setSearch] = useState('')
  const fileInputRef = useRef(null)

  const filteredItems = search.trim()
    ? items.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()))
    : items

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)
  const visibleItems = filteredItems.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)
  const allVisibleSelected =
    visibleItems.length > 0 && visibleItems.every((item) => selectedIds.has(item.id))

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        visibleItems.forEach((item) => next.delete(item.id))
      } else {
        visibleItems.forEach((item) => next.add(item.id))
      }
      return next
    })
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`選択した${selectedIds.size}件を削除しますか？`)) return
    for (const id of selectedIds) {
      await remove(id)
    }
    setSelectedIds(new Set())
  }

  const handleDeleteAll = async () => {
    if (items.length === 0) return
    if (!window.confirm(`${title}を全件（${items.length}件）削除しますか？この操作は元に戻せません。`)) return
    for (const item of items) {
      await remove(item.id)
    }
    setSelectedIds(new Set())
  }

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
    const names = importColumnHeaders
      ? parseCsvByColumn(text, importColumnHeaders)
      : parseCsvNames(text)
    const existing = new Set(items.map((item) => item.name))
    const toAdd = []
    for (const name of names) {
      if (!existing.has(name)) {
        existing.add(name)
        toAdd.push(name)
      }
    }
    if (toAdd.length > 0) {
      await addMany(toAdd)
    }
    e.target.value = ''
    window.alert(
      `CSVから読み込み: ${names.length}件\n新規登録: ${toAdd.length}件\n重複・既存のためスキップ: ${names.length - toAdd.length}件`
    )
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
            <button
              onClick={handleDeleteAll}
              disabled={items.length === 0}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🗑️ 全件削除
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

      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(0)
        }}
        placeholder={`${title}を検索`}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <div className="p-6 text-center text-gray-400 text-sm">読み込み中...</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-sm">登録がありません</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-sm">該当する{title}が見つかりません</div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                className="w-4 h-4 accent-blue-600"
              />
              このページを全て選択
            </label>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                🗑️ 選択した{selectedIds.size}件を削除
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-50 border border-gray-100 rounded-lg overflow-hidden">
            {visibleItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 accent-blue-600 flex-shrink-0"
                  />
                  {editingId === item.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm text-gray-800 truncate">{item.name}</span>
                  )}
                </div>
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
        </>
      )}

      {filteredItems.length > PAGE_SIZE && (
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← 前へ
          </button>
          <span className="text-xs text-gray-500">
            {currentPage + 1} / {totalPages} ページ（全{filteredItems.length}件）
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage >= totalPages - 1}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            次へ →
          </button>
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
        importColumnHeaders={CUSTOMER_NAME_HEADERS}
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
