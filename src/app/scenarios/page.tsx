"use client";

import { useRouter } from "next/navigation";
import AppFrame from "@/components/AppFrame";
import { useAppStore } from "@/lib/store";
import { SCENARIOS } from "@/data/scenarios";

export default function ScenariosPage() {
  const router = useRouter();
  const startScenario = useAppStore((s) => s.startScenario);

  return (
    <AppFrame title="シナリオを選ぶ" showBack>
      <div className="grid grid-cols-2 gap-3">
        {SCENARIOS.map((sc) => (
          <button
            key={sc.id}
            className="scenario-card"
            onClick={() => {
              startScenario(sc);
              router.push(`/roleplay/${sc.id}`);
            }}
          >
            <div className="text-2xl">{sc.icon}</div>
            <div className="text-sm font-bold text-ink">{sc.ja}</div>
            <div className="text-[10px] text-ink-soft">{sc.en}</div>
            <div className="mt-0.5 text-[11px] text-wood-dark">
              {sc.persona.emoji} {sc.persona.name}
            </div>
          </button>
        ))}
      </div>
    </AppFrame>
  );
}
