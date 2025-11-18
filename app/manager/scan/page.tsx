"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const QrReader = dynamic(() => import("react-qr-reader").then(res => res.QrReader), {
  ssr: false,
});

export default function ScanPage() {
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function handleScan(text: string) {
    if (!text) return;
    if (result === text) return; // avoid duplicates

    setResult(text);

    const res = await fetch(`/api/invites/${text}/scan`, {
      method: "POST",
    });

    const data = await res.json();
    if (data.success) {
      setStatus("✔️ Invitation validée");
    } else {
      setStatus(`❌ ${data.message}`);
    }
  }

  return (
    <div className="p-8 flex flex-col items-center bg-white">
      <h1 className="text-2xl font-bold mb-6">Scanner une invitation</h1>

      <QrReader
        constraints={{ facingMode: "environment" }} // REQUIRED ✔
        onResult={(result, error) => {
          if (!!result) {
            const text = result.getText();
            if (text) handleScan(text);
          }
        }}
        containerStyle={{ width: "100%", maxWidth: 320 }}
        videoContainerStyle={{ width: "100%" }}
        videoStyle={{ width: "100%", borderRadius: 12 }}
      />

      {status && (
        <p className="mt-6 text-lg font-semibold">{status}</p>
      )}
    </div>
  );
}
