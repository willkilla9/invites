"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  publicInvitesEnabled?: boolean;
}

interface CampaignRecord {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
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
  const handleEventUpdated = useCallback((eventId: string, changes: Partial<EventRecord>) => {
    setEvents((current) =>
      current.map((evt) => (evt.id === eventId ? { ...evt, ...changes } : evt)),
    );
  }, []);

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
                    <EventCampaignCard
                      key={event.id}
                      event={event}
                      token={token}
                      onEventUpdated={handleEventUpdated}
                    />
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

function EventCampaignCard({
  event,
  token,
  onEventUpdated,
}: {
  event: EventRecord;
  token: string | null;
  onEventUpdated: (eventId: string, changes: Partial<EventRecord>) => void;
}) {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignDescription, setNewCampaignDescription] = useState("");
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [togglingPublic, setTogglingPublic] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const publicEnabled = event.publicInvitesEnabled ?? false;
  const baseShareUrl = useMemo(() => {
    if (typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_BASE_URL ?? "";
  }, []);

  const fetchCampaigns = useCallback(async () => {
    if (!token) {
      setCampaigns([]);
      return;
    }
    setCampaignsLoading(true);
    setCampaignError(null);
    try {
      const res = await fetch(`/api/events/${event.id}/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Impossible de charger les campagnes");
      }
      setCampaigns(payload);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      console.error("fetchCampaigns", err);
      setCampaignError(err?.message || "Impossible de charger les campagnes");
    } finally {
      setCampaignsLoading(false);
    }
  }, [event.id, token]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleTogglePublic = async () => {
    if (!token) {
      setCampaignError("Connectez-vous pour modifier l'évènement");
      return;
    }
    setTogglingPublic(true);
    setCampaignError(null);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ publicInvitesEnabled: !publicEnabled }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Impossible de mettre à jour l'évènement");
      }
      onEventUpdated(event.id, { publicInvitesEnabled: data.publicInvitesEnabled });
    } catch (err: any) {
      console.error("togglePublicInvites", err);
      setCampaignError(err?.message || "Mise à jour impossible");
    } finally {
      setTogglingPublic(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setCampaignError("Connectez-vous pour créer une campagne");
      return;
    }
    if (!publicEnabled) {
      setCampaignError("Activez les invitations publiques avant de créer une campagne");
      return;
    }
    if (!newCampaignName.trim()) {
      setCampaignError("Donnez un nom à la campagne");
      return;
    }
    setCreatingCampaign(true);
    setCampaignError(null);
    try {
      const res = await fetch(`/api/events/${event.id}/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newCampaignName.trim(),
          description: newCampaignDescription.trim() || undefined,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Impossible de créer la campagne");
      }
      setCampaigns((prev) => [payload, ...prev]);
      setNewCampaignName("");
      setNewCampaignDescription("");
      setCopiedSlug(null);
    } catch (err: any) {
      console.error("createCampaign", err);
      setCampaignError(err?.message || "Création impossible");
    } finally {
      setCreatingCampaign(false);
    }
  };

  const handleCopyLink = async (slug: string) => {
    const url = `${baseShareUrl?.replace(/\/$/, "")}/campaign/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 1500);
    } catch (error) {
      console.error("copyLink", error);
      setCampaignError("Impossible de copier le lien");
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 px-5 py-4 shadow-inner shadow-black/40">
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

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white">Inscriptions publiques</p>
            <p className="text-xs text-slate-400">
              Partagez un formulaire public et identifiez la provenance via des campagnes.
            </p>
          </div>
          <button
            onClick={handleTogglePublic}
            disabled={!token || togglingPublic}
            className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
              publicEnabled ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-700 text-slate-300"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {togglingPublic ? "Mise à jour..." : publicEnabled ? "Désactiver" : "Activer"}
          </button>
        </div>
      </div>

      {campaignError && (
        <p className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{campaignError}</p>
      )}

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Campagnes</p>
        {publicEnabled ? (
          <form onSubmit={handleCreateCampaign} className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Nom</label>
              <input
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                placeholder="Campagne influenceurs"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Note interne</label>
              <textarea
                className="mt-1 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                rows={2}
                placeholder="Utilisée pour le flux newsletter, offre VIP..."
                value={newCampaignDescription}
                onChange={(e) => setNewCampaignDescription(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={creatingCampaign}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingCampaign ? "Création..." : "Créer une campagne"}
            </button>
          </form>
        ) : (
          <p className="mt-2 rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
            Activez les inscriptions publiques pour créer et partager des campagnes de collecte.
          </p>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {campaignsLoading ? (
          <p className="text-sm text-slate-400">Chargement des campagnes...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune campagne répertoriée pour le moment.</p>
        ) : (
          campaigns.map((campaign) => {
            const shareUrl = `${baseShareUrl?.replace(/\/$/, "")}/campaign/${campaign.slug}`;
            return (
              <div
                key={campaign.id}
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-200"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">{campaign.name}</p>
                    {campaign.description && (
                      <p className="text-xs text-slate-400">{campaign.description}</p>
                    )}
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                      {formatTimestamp(campaign.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(campaign.slug)}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-1 text-xs font-semibold text-white transition hover:border-white/40"
                  >
                    {copiedSlug === campaign.slug ? "Lien copié ✔︎" : "Copier le lien"}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  Partagez :{" "}
                  <span className="font-mono text-white/90">{shareUrl}</span>
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
