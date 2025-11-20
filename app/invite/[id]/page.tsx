"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type InviteDetails = {
  id: string;
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  status: string;
  eventName?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  eventPlace?: string | null;
  eventLogo?: string | null;
  campaignName?: string | null;
};

export default function InvitePage() {
  const params = useParams<{ id?: string | string[] }>();
  const inviteId = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw ?? "";
  }, [params]);

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteId) return;
    const controller = new AbortController();
    const fetchInvite = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/public/invites/${inviteId}`, { signal: controller.signal });
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.error || "Invitation introuvable");
        }
        setInvite(payload);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("fetchInvite", err);
        setError(err?.message || "Impossible de charger cette invitation");
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
    return () => controller.abort();
  }, [inviteId]);

  if (!inviteId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
        <p className="text-lg font-semibold">Lien d&apos;invitation incomplet</p>
        <Link href="/" className="mt-4 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10">
          Retourner à l&apos;accueil
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        Chargement de votre invitation…
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-50">
        <p className="text-lg font-semibold text-white">Invitation indisponible</p>
        <p className="mt-2 text-sm text-slate-400">{error || "Ce lien n&apos;existe plus."}</p>
        <Link href="/" className="mt-6 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10">
          Retourner à l&apos;accueil
        </Link>
      </div>
    );
  }

  const statusLabel =
    invite.status === "SCANNED" ? "Validée sur site" : invite.status === "INVITED" ? "En attente" : invite.status;
  const guestName = [invite.prenom, invite.nom].filter(Boolean).join(" ");

  return (
    <div className="min-h-screen bg-slate-950/95 text-slate-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-12">
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-center shadow-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Invitation personnelle</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{invite.eventName || "Évènement"}</h1>
          <p className="mt-2 text-sm text-slate-300">
            {invite.eventDate || "Date communiquée prochainement"}
            {invite.eventTime ? ` • ${invite.eventTime}` : ""}
          </p>
          <p className="text-sm text-slate-400">{invite.eventPlace || "Lieu communiqué ultérieurement"}</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Invité</p>
              <p className="text-2xl font-semibold text-white">{guestName || "Invité confirmé"}</p>
              <p className="text-sm text-slate-400">{invite.email}</p>
              {invite.campaignName && (
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Campagne : {invite.campaignName}
                </p>
              )}
            </div>
            <span
              className={`inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${
                invite.status === "SCANNED"
                  ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/40"
                  : "bg-indigo-500/15 text-indigo-200 border border-indigo-400/40"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <div className="mt-6 space-y-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Conseils</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Présentez cette page ou votre email à l&apos;accueil.</li>
                <li>Munissez-vous d&apos;une pièce d&apos;identité.</li>
                <li>Arrivez 10 minutes avant l&apos;horaire indiqué.</li>
              </ul>
            </div>
            <p className="text-xs text-slate-500">
              Besoin d&apos;aide ? Contactez votre référent ou répondez à l&apos;email d&apos;invitation.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
