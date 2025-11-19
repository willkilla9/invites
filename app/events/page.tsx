"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EventForm from "../components/EventForm";
import Navbar from "../components/Navbar";
import { useAuth } from "../components/AuthProvider";

interface EventRecord {
  id: string;
  name: string;
  logoUrl?: string | null;
  date?: string | null;
  time?: string | null;
  place?: string | null;
  createdAt?: number;
}

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return "Ajout récent";
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
  } catch (error) {
    return "Ajout récent";
  }
};

export default function EventsPage() {
  const { user, loading, token } = useAuth();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!token) {
      setEvents([]);
      return;
    }

    const controller = new AbortController();
    const fetchEvents = async () => {
      setFetching(true);
      setError(null);
      try {
        const res = await fetch("/api/events", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Impossible de charger les évènements");
        }
        const payload = await res.json();
        setEvents(payload);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("fetchEvents", err);
        setError("Erreur lors du chargement des évènements");
      } finally {
        setFetching(false);
      }
    };

    fetchEvents();
    return () => controller.abort();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950/95 bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] text-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-10 px-6 pb-16 pt-8 sm:px-8 md:pt-12">
        {!loading && !user ? (
          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Espace réservé</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Connectez-vous pour gérer vos évènements</h1>
            <p className="mt-3 text-sm text-slate-300">
              Vous devez être authentifié pour créer des évènements et mettre à jour le catalogue.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
            >
              Se connecter
            </Link>
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Gestion des évènements</p>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-white sm:text-4xl">Votre catalogue d&apos;évènements</h1>
                  <p className="mt-3 max-w-2xl text-base text-slate-200">
                    Centralisez le contexte de vos opérations : logo, date, lieu… Tout est prêt à être relié aux invitations en quelques clics.
                  </p>
                </div>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                >
                  Retourner aux invitations
                </Link>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <EventForm />
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-100">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Catalogue</p>
                  <h2 className="text-2xl font-semibold text-white">{events.length || "Aucun"} évènement{events.length > 1 ? "s" : ""}</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Retrouvez ici les évènements prêts à accueillir vos invités. Ajoutez-en un nouveau ou mettez à jour les informations existantes.
                  </p>
                </div>

                {error && (
                  <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</p>
                )}

                {fetching && (
                  <p className="mt-4 text-sm text-slate-300">Mise à jour des évènements…</p>
                )}

                <div className="mt-6 space-y-4">
                  {events.length === 0 && !fetching && (
                    <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
                      Aucun évènement enregistré pour le moment. Créez-en un via le formulaire pour commencer.
                    </p>
                  )}

                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 px-5 py-4 shadow-inner shadow-black/40"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">{event.name}</p>
                          <p className="text-sm text-slate-300">
                            {event.date || "Date à définir"}
                            {event.time ? ` • ${event.time}` : ""}
                          </p>
                          <p className="text-sm text-slate-400">{event.place || "Lieu à préciser"}</p>
                        </div>
                        <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{formatTimestamp(event.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
