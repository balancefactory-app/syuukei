import { useState, useEffect, useRef } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { db } from '../firebase'

export default function useMasterList(collectionName, seedDefaults = []) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const hasSeeded = useRef(false)

  useEffect(() => {
    const q = query(collection(db, collectionName), orderBy('name', 'asc'))
    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      if (list.length === 0 && seedDefaults.length > 0 && !hasSeeded.current) {
        hasSeeded.current = true
        for (const name of seedDefaults) {
          await addDoc(collection(db, collectionName), { name })
        }
        return
      }
      setItems(list)
      setLoading(false)
    })
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName])

  const add = async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    await addDoc(collection(db, collectionName), { name: trimmed })
  }

  const update = async (id, name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    await updateDoc(doc(db, collectionName, id), { name: trimmed })
  }

  const remove = async (id) => {
    await deleteDoc(doc(db, collectionName, id))
  }

  return { items, loading, add, update, remove }
}
