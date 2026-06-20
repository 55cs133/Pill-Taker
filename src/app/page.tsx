"use client";

import { useEffect, useState } from "react";

type HealthStatus = {
  status: "ok" | "error";
  message: string;
  timestamp?: string;
};

export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data: HealthStatus) => setHealth(data))
      .catch(() =>
        setHealth({ status: "error", message: "Failed to reach health endpoint" })
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Pill Taker
        </h1>

        <div className="w-full max-w-md rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
          <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Database Status
          </h2>

          {loading ? (
            <p className="text-sm text-zinc-500">Checking connection&hellip;</p>
          ) : health?.status === "ok" ? (
            <div className="flex items-center gap-3">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                Connected
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  Disconnected
                </span>
              </div>
              <p className="text-xs text-zinc-500">{health?.message}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
