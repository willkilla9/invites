"use client";

import { useState } from "react";

export default function InviteForm() {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom,
          prenom,
          phone: phone || null,
          email: email || null,
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
      }
    } catch (err) {
      console.error(err);
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow space-y-3"
    >
      <h2 className="text-lg font-semibold mb-2">Créer une invitation</h2>

      {message && <p className="text-green-600 text-sm">{message}</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium mb-1">
          Nom <span className="text-red-500">*</span>
        </label>
        <input
          className="border rounded w-full p-2 text-sm"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Prénom <span className="text-red-500">*</span>
        </label>
        <input
          className="border rounded w-full p-2 text-sm"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Téléphone (optionnel)
        </label>
        <input
          className="border rounded w-full p-2 text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Email (optionnel)
        </label>
        <input
          type="email"
          className="border rounded w-full p-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-60"
      >
        {loading ? "Enregistrement..." : "Créer l'invitation"}
      </button>
    </form>
  );
}
