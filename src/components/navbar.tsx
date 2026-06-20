"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const AUTH_PATHS = ["/login", "/register"];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/auth/me");
        if (!cancelled && res.ok) {
          const data = await res.json();
          setName(data.user?.name ?? null);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (!ready || AUTH_PATHS.includes(pathname) || !name) return null;

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Pill Taker
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
