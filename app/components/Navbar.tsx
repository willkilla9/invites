"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

const navLinks = [
  { href: "/#dashboard", label: "Tableau" },
  { href: "/#form", label: "Inviter" },
  { href: "/#import", label: "Importer" },
  { href: "/#table", label: "Suivi" },
];

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      router.push("/login");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-slate-100 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-base font-bold text-white shadow-lg shadow-indigo-500/40">
            GP
          </span>
          <div className="leading-tight">
            Gestion <span className="text-indigo-300">Pro</span>
            <p className="text-[11px] font-normal uppercase tracking-[0.4em] text-slate-400">Invitations</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-3 md:flex-none">
          <div className="flex flex-1 items-center gap-3 overflow-x-auto text-xs text-slate-300 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/10 px-3 py-1 whitespace-nowrap hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:border-white/30"
          >
            Gérer les évènements
          </Link>
          <Link
            href="/#import"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-white/20"
          >
            Importer un CSV
          </Link>
          {user ? (
            <button
              onClick={handleLogout}
              disabled={signingOut}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40"
            >
              {signingOut ? "Déconnexion..." : "Se déconnecter"}
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/80 transition hover:border-white/40"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
