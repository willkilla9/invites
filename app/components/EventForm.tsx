"use client";

import { useState } from "react";

export default function EventForm() {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logoUrl, date, time, place }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Impossible d'enregistrer l'évènement");
        return;
      }

      setMessage("Évènement créé avec succès 🎉");
      setName("");
      setLogoUrl("");
      setDate("");
      setTime("");
      setPlace("");
      // Reload to inject the new event inside the other forms
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError("Erreur réseau – réessayez");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-slate-100 shadow-2xl"
    >
      <div className="absolute inset-x-8 top-4 h-24 rounded-full bg-gradient-to-r from-emerald-500/20 to-indigo-500/10 blur-3xl" />
      <div className="relative space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Évènement</p>
          <h2 className="text-2xl font-semibold text-white">Créer un évènement</h2>
          <p className="mt-1 text-sm text-slate-400">
            Configurez le contexte (nom, date, lieu…) puis rattachez vos invitations.
          </p>
        </div>

        {message && (
          <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-2 text-sm text-emerald-100">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Nom de l'évènement <span className="text-rose-400">*</span>
            </label>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lancement Produit"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Logo (URL)</label>
            <input
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://exemple.com/logo.png"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300">Date</label>
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Samedi 22 Novembre 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Horaire</label>
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="Accueil 10h30 – Talk 11h00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">Lieu</label>
            <input
              type="text"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Salle Atlas – Technopark"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Enregistrement..." : "Créer l'évènement"}
        </button>
      </div>
    </form>
  );
}
