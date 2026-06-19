import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase'

const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD

export default function AuthGate({ children }) {
  const [signedIn, setSignedIn] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setSignedIn(!!user)
      setChecking(false)
    })
    return () => unsub()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!APP_PASSWORD) {
      setError('パスワードが設定されていません。管理者に確認してください。')
      return
    }
    if (password !== APP_PASSWORD) {
      setError('パスワードが正しくありません')
      return
    }
    try {
      await signInAnonymously(auth)
    } catch (err) {
      console.error(err)
      setError('ログインに失敗しました')
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">読み込み中...</p>
      </div>
    )
  }

  if (!signedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-6 w-full max-w-sm space-y-4"
        >
          <h1 className="text-lg font-bold text-gray-800 text-center">🔒 売上管理システム</h1>
          <p className="text-sm text-gray-500 text-center">パスワードを入力してください</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold py-2.5 rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all text-sm shadow-md"
          >
            ログイン
          </button>
        </form>
      </div>
    )
  }

  return children
}
