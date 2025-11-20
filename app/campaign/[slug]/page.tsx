"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

type CampaignDetails = {
  id: string;
  name: string;
  description?: string | null;
  eventId: string;
  eventName?: string | null;
  eventDate?: string | null;
  eventTime?: string | null;
  eventPlace?: string | null;
  eventLogo?: string | null;
};

export default function CampaignLanding() {
  const params = useParams<{ slug?: string | string[] }>();
  const slug = useMemo(() => {
    const value = params?.slug;
    if (Array.isArray(value)) return value[0];
    return value ?? "";
  }, [params]);
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ nom: "", prenom: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();
    const loadCampaign = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/public/campaigns/${slug}`, { signal: controller.signal });
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.error || "Campagne introuvable");
        }
        setCampaign(payload);
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("fetchCampaign", err);
        setError(err?.message || "Impossible de charger la campagne");
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
    return () => controller.abort();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim() || !formData.prenom.trim()) {
      setError("Merci de renseigner votre nom et prénom");
      return;
    }
    if (!slug) {
      setError("Lien incomplet");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await fetch(`/api/public/campaigns/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom.trim(),
          prenom: formData.prenom.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Impossible d'enregistrer votre demande");
      }
      setSuccessMessage("Merci ! Votre demande d'invitation a bien été transmise.");
      setFormData({ nom: "", prenom: "", email: "", phone: "" });
    } catch (err: any) {
      console.error("submitCampaignLead", err);
      setError(err?.message || "Impossible d'enregistrer votre demande");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
        <p>Chargement de la campagne…</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-200">
        <p className="text-lg font-semibold text-white">Campagne indisponible</p>
        <p className="mt-2 text-sm text-slate-400">{error || "Ce lien n&apos;est plus actif."}</p>
        <Link href="/" className="mt-6 rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10">
          Retourner à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950/95 text-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12 sm:py-16">
        <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-center shadow-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Demande d&apos;invitation</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{campaign.eventName || campaign.name}</h1>
          <p className="mt-2 text-sm text-slate-300">
            {campaign.eventDate || "Date communiquée prochainement"}
            {campaign.eventTime ? ` • ${campaign.eventTime}` : ""}
          </p>
          <p className="text-sm text-slate-400">{campaign.eventPlace || "Lieu communiqué ultérieurement"}</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Campagne</p>
            <h2 className="text-2xl font-semibold text-white">{campaign.name}</h2>
            {campaign.description && (
              <p className="mt-2 text-sm text-slate-300">{campaign.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-slate-400">Nom</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                  value={formData.nom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-slate-400">Prénom</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                  value={formData.prenom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, prenom: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-slate-400">Email</label>
                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="vous@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.3em] text-slate-400">Téléphone</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>
            </div>

            {error && <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</p>}
            {successMessage && (
              <p className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Envoi..." : "Demander une invitation"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
