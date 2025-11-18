"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";

const QrReader = dynamic(() => import("react-qr-reader").then(res => res.QrReader), {
  ssr: false,
});

export default function ScanPage() {
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoContainerStyle = useMemo(() => ({
    width: "100%",
    maxWidth: 360,
    aspectRatio: "3 / 4",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#111",
  }), []);

  const videoStyle = useMemo(
    () => ({
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
    }),
    [],
  );

  const handleScan = useCallback(
    async (text: string) => {
      if (!text) return;
      if (result === text || isCoolingDown) return; // avoid duplicates while the message is visible

      setIsCoolingDown(true);
      setResult(text);
      setError(null);

      try {
        const res = await fetch(`/api/invites/${text}/scan`, {
          method: "POST",
        });

        const data = await res.json();
        if (data.success) {
          setStatus("✔️ Invitation validée");
        } else {
          setStatus(`❌ ${data.message}`);
        }
      } catch (err) {
        console.error(err);
        setError("Impossible de vérifier l'invitation. Veuillez réessayer.");
      } finally {
        setTimeout(() => setIsCoolingDown(false), 2000);
      }
    },
    [isCoolingDown, result],
  );

  return (
    <div className="p-8 flex flex-col items-center bg-white">
      <h1 className="text-2xl font-bold mb-6">Scanner une invitation</h1>

      <QrReader
        constraints={{ facingMode: "environment" }}
        scanDelay={1500}
        onResult={(scanResult, error) => {
          if (scanResult) {
            const text = scanResult.getText();
            if (text) handleScan(text);
          }

          if (error) {
            console.debug(error);
          }
        }}
        containerStyle={{ width: "100%", display: "flex", justifyContent: "center" }}
        videoContainerStyle={videoContainerStyle}
        videoStyle={videoStyle}
      />

      {status && (
        <p className="mt-6 text-lg font-semibold">{status}</p>
      )}
      {result && (
        <p className="mt-2 text-sm text-gray-600">Dernier code scanné : {result}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
