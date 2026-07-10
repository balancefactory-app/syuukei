"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase/config";

let cached: { auth: Auth; db: Firestore } | null = null;

/**
 * ブラウザ用 Firebase（Auth + Firestore）のシングルトン。
 * 未構成の場合は null を返す。
 */
export function getFirebase(): { auth: Auth; db: Firestore } | null {
  if (!isFirebaseConfigured()) return null;
  if (cached) return cached;

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  cached = { auth: getAuth(app), db: getFirestore(app) };
  return cached;
}
