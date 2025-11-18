// components/CsvImport.tsx
"use client";

import Papa from "papaparse";
import { useState } from "react";

export default function CsvImport() {
  const [message, setMessage] = useState("");

  const handleFile = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const rows = results.data;

        const res = await fetch("/api/invites/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows }),
        });

        const json = await res.json();
        if (res.ok) {
          setMessage(`Importé: ${json.imported} invitations`);
          window.location.reload();
        } else {
          setMessage(json.error);
        }
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/40 p-6 text-slate-100 shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_55%)]" />
      <div className="relative space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Importer</p>
          <h2 className="text-2xl font-semibold text-white">Importer un CSV</h2>
          <p className="mt-1 text-sm text-slate-400">
            Glissez ou sélectionnez un fichier avec les colonnes nom, prénom, téléphone, email.
          </p>
        </div>

        <label className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-400/60 bg-indigo-400/5 px-6 py-10 text-center text-sm text-slate-300 transition hover:border-indigo-300 hover:bg-indigo-400/10">
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="hidden"
          />
          <span className="text-base font-semibold text-white">Sélectionner un fichier CSV</span>
          <span className="mt-1 text-xs text-slate-400">Jusqu&apos;à 5 000 lignes supportées</span>
        </label>

        {message && (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">{message}</p>
        )}
      </div>
    </div>
  );
}
