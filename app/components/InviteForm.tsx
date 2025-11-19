"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";

type EventOption = {
  id: string;
  name: string;
};

export default function InviteForm({ events }: { events: EventOption[] }) {
  const { token } = useAuth();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventId, setEventId] = useState(events[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId && events.length > 0) {
      setEventId(events[0].id);
    }
  }, [events, eventId]);

  const eventOptions = useMemo(() => events.map((evt) => ({ value: evt.id, label: evt.name })), [events]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (!token) {
      setError("Vous devez être connecté pour créer une invitation");
      setLoading(false);
      return;
    }

    if (!eventId) {
      setError("Merci de créer un évènement avant d'ajouter des invitations");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom,
          prenom,
          phone: phone || null,
          email: email || null,
          eventId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Une erreur est survenue");
      } else {
        setMessage("Invitation créée avec succès ✅");
        // reset form
        setNom("");
        setPrenom("");
        setPhone("");
        setEmail("");
        setEventId(events[0]?.id ?? "");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  if (!events.length) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6 text-slate-100 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.2),_transparent_55%)]" />
        <div className="relative space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-200">Évènement requis</p>
          <h2 className="text-2xl font-semibold text-white">Créez un évènement pour démarrer</h2>
          <p className="text-sm text-amber-100/90">
            Aucun évènement n&apos;est défini. Ajoutez un évènement dans le panneau dédié afin de pouvoir créer des invitations ou
            importer un fichier CSV.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-slate-100 shadow-2xl"
    >
      <div className="absolute inset-x-8 top-4 h-24 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/10 blur-3xl" />
      <div className="relative space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Créer</p>
          <h2 className="text-2xl font-semibold text-white">Nouvelle invitation</h2>
          <p className="mt-1 text-sm text-slate-400">
            Ajoutez une personne et suivez immédiatement son statut dans le tableau.
          </p>
        </div>

        {message && (
          <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-sm text-emerald-100">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Évènement <span className="text-rose-400">*</span>
            </label>
            <select
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            >
              {eventOptions.map((option) => (
                <option key={option.value} value={option.value} className="text-slate-900">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">
              Nom <span className="text-rose-400">*</span>
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
              placeholder="Ex: Martin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">
              Prénom <span className="text-rose-400">*</span>
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
              placeholder="Ex: Léa"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-300">Téléphone</label>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06 44 33 22 11"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="invite@email.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !token}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {!token ? "Authentifiez-vous" : loading ? "Enregistrement..." : "Créer l'invitation"}
        </button>
      </div>
    </form>
  );
}
