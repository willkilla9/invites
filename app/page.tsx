"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CsvImport from "./components/CsvImport";
import InviteForm from "./components/InviteForm";
import InviteTable from "./components/InviteTable";
import Navbar from "./components/Navbar";
import { useAuth } from "./components/AuthProvider";

type InviteRecord = {
  id: string;
  nom: string;
  prenom: string;
  phone?: string | null;
  email?: string | null;
  eventId?: string;
  status?: string;
};

type EventRecord = {
  id: string;
  name: string;
  logoUrl?: string | null;
  date?: string | null;
  time?: string | null;
  place?: string | null;
};

export default function HomePage() {
  const { user, loading, token } = useAuth();
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setInvites([]);
      setEvents([]);
      setFetching(false);
      return;
    }

    const controller = new AbortController();
    const fetchData = async () => {
      setFetching(true);
      setError(null);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [invitesRes, eventsRes] = await Promise.all([
          fetch("/api/invites", { headers, signal: controller.signal }),
          fetch("/api/events", { headers, signal: controller.signal }),
        ]);

        if (!invitesRes.ok || !eventsRes.ok) {
          throw new Error("Impossible de charger les données protégées");
        }

        const [invitesPayload, eventsPayload] = await Promise.all([
          invitesRes.json(),
          eventsRes.json(),
        ]);

        setInvites(invitesPayload);
        setEvents(eventsPayload);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("fetchDashboard", err);
        setError("Impossible de charger les données. Vérifiez vos droits ou réessayez.");
      } finally {
        setFetching(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [token]);

  const totalInvites = invites.length;
  const scannedInvites = invites.filter((inv) => inv.status === "SCANNED").length;
  const pendingInvites = totalInvites - scannedInvites;

  const eventsById = useMemo(() => {
    return events.reduce<Record<string, EventRecord>>((acc, evt) => {
      acc[evt.id] = evt;
      return acc;
    }, {});
  }, [events]);

  return (
    <div className="min-h-screen bg-slate-950/95 bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] text-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-12 px-6 pb-16 pt-8 sm:px-8 md:pt-12">
        {!loading && !user ? (
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950/60 p-8 text-center shadow-2xl">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Espace sécurisé</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Connectez-vous pour gérer vos invitations</h1>
            <p className="mt-3 text-sm text-slate-300">
              L&apos;accès au tableau de bord est réservé aux gestionnaires identifiés. Merci de vous authentifier pour consulter les données.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/login"
                className="rounded-2xl bg-white/10 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30"
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="rounded-2xl border border-white/20 px-6 py-3 text-sm font-semibold text-white/80"
              >
                Créer un compte
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section
              id="dashboard"
              className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 shadow-2xl shadow-indigo-500/20 sm:p-8"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Gestion Premium</p>
              <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-white sm:text-4xl">Tableau de bord des invitations</h1>
                  <p className="mt-3 max-w-2xl text-base text-slate-300">
                    Surveillez les confirmations, importez vos listes et partagez des PDF prêts à l&apos;emploi. Une expérience soignée pour travailler vite et bien sur votre prochain évènement.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-right">
                  <p className="text-xs uppercase tracking-widest text-slate-300">Invitations actives</p>
                  <p className="text-4xl font-semibold text-white">{totalInvites}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Total", value: totalInvites, accent: "from-slate-800/40 to-slate-900" },
                  { label: "Scannées", value: scannedInvites, accent: "from-emerald-900/40 to-emerald-950" },
                  { label: "En attente", value: pendingInvites, accent: "from-amber-900/40 to-amber-950" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl border border-white/5 bg-gradient-to-br ${item.accent} px-5 py-4 shadow-inner`}
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                    <p className="mt-1 text-3xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              {error && (
                <p className="mt-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
              )}
              {fetching && (
                <p className="mt-4 text-sm text-slate-300">Chargement des dernières données...</p>
              )}
            </section>

            <section id="form" className="space-y-6">
              <InviteForm events={events} />
              <div id="import">
                <CsvImport events={events} />
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-100">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Évènements</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Gérez vos évènements</h3>
                <p className="mt-2 text-sm text-slate-300">
                  La création et l&apos;édition des évènements ont désormais leur propre espace. Accédez-y pour gérer le contexte de vos invitations.
                </p>
                <Link
                  href="/events"
                  className="mt-4 inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-white/20"
                >
                  Accéder à la page évènements
                </Link>
              </div>
            </section>

            <section id="table">
              <InviteTable invites={invites} eventsById={eventsById} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
