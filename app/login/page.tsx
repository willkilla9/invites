"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useAuth } from "../components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
    } catch (err: any) {
      setError("Impossible de vous connecter. Vérifiez vos identifiants.");
      console.error("signIn", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Connexion sécurisée</p>
          <h1 className="mt-2 text-3xl font-semibold">Reprendre le contrôle</h1>
          <p className="mt-2 text-sm text-slate-400">
            Accédez à votre tableau de bord invitations en vous connectant à votre compte.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input
                type="email"
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Mot de passe</label>
              <input
                type="password"
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold shadow-lg shadow-indigo-500/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Pas encore de compte ?
            <Link href="/signup" className="ml-1 font-semibold text-indigo-300">
              Créer un accès
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
