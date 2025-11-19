"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useAuth } from "../components/AuthProvider";

const QrReader = dynamic(() => import("react-qr-reader").then(res => res.QrReader), {
  ssr: false,
});

export default function ManagerPage() {
  const { token, user, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [lastScan, setLastScan] = useState("");

  const handleScan = async (text: any) => {
    if (!text || text === lastScan) return;

    if (!token) {
      setMessage("Connectez-vous pour valider des invitations");
      return;
    }

    setLastScan(text);
    setMessage("Traitement...");

    const res = await fetch(`/api/invites/${text}/scan`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    if (json.success) setMessage("✅ Invitation validée");
    else setMessage(`❌ ${json.error}`);
  };

  if (!loading && !user) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold">Accès restreint</h1>
        <p className="mt-4 text-slate-300">Vous devez être connecté pour utiliser la station de scan.</p>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="mb-4 text-xl font-bold">Scanner les Invitations</h1>

      <QrReader
        constraints={{ facingMode: "environment" }}
        onResult={(result) => {
          if (result) handleScan(result.getText());
        }}
      />

      {message && <p className="mt-4 text-lg">{message}</p>}
    </div>
  );
}
