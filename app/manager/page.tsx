"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const QrReader = dynamic(() => import("react-qr-reader").then(res => res.QrReader), {
  ssr: false,
});

export default function ManagerPage() {
  const [message, setMessage] = useState("");
  const [lastScan, setLastScan] = useState("");

  const handleScan = async (text: any) => {
    if (!text || text === lastScan) return;

    setLastScan(text);
    setMessage("Traitement...");

    const res = await fetch(`/api/invites/${text}/scan`, {
      method: "POST",
    });

    const json = await res.json();
    if (json.success) setMessage("✅ Invitation validée");
    else setMessage(`❌ ${json.error}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Scanner les Invitations</h1>

      <QrReader
        constraints={{ facingMode: "environment" }}
        onResult={(result, error) => {
          if (result) handleScan(result.getText());
        }}
      />

      {message && <p className="mt-4 text-lg">{message}</p>}
    </div>
  );
}
