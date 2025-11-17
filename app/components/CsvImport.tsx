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
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-2 text-lg">Importer CSV</h2>
      <input type="file" accept=".csv" onChange={handleFile} />
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
