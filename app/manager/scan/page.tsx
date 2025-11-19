"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { useAuth } from "../../components/AuthProvider";

const QrReader = dynamic(() => import("react-qr-reader").then(res => res.QrReader), {
  ssr: false,
});

type ScanFeedback = {
  badge: string;
  tone: "success" | "error" | "idle";
  message: string;
};

const baseFeedback: ScanFeedback = {
  badge: "Mode prêt",
  tone: "idle",
  message: "Alignez le QR code dans le cadre pour vérifier une invitation.",
};

export default function ScanPage() {
  const { token, user, loading } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<ScanFeedback>(baseFeedback);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerStyle = useMemo(
    () => ({
      width: "100%",
      display: "flex",
      justifyContent: "center",
    }),
    [],
  );

  const videoContainerStyle = useMemo(
    () => ({
      width: "100%",
      aspectRatio: "3 / 4",
      borderRadius: 32,
      overflow: "hidden",
      backgroundColor: "#06090f",
    }),
    [],
  );

  const videoStyle = useMemo(
    () => ({
      width: "100%",
      height: "100%",
      objectFit: "cover" as const,
      filter: "contrast(1.05) saturate(1.1)",
    }),
    [],
  );

  const handleScan = useCallback(
    async (text: string) => {
      if (!text) return;
      if (result === text || isCoolingDown) return; // avoid duplicates while the message is visible

      if (!token) {
        setStatus({
          badge: "Connexion requise",
          tone: "error",
          message: "Identifiez-vous pour scanner les invitations.",
        });
        return;
      }

      setIsCoolingDown(true);
      setResult(text);
      setError(null);

      try {
        const res = await fetch(`/api/invites/${text}/scan`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success) {
          setStatus({
            badge: "Validée",
            tone: "success",
            message: `Accès autorisé pour l'invitation ${text}.`,
          });
        } else {
          setStatus({
            badge: "Refusée",
            tone: "error",
            message: data.message ?? "Invitation inconnue.",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Impossible de vérifier l'invitation. Veuillez réessayer.");
        setStatus({
          badge: "Hors-ligne",
          tone: "error",
          message: "Le service de vérification est momentanément indisponible.",
        });
      } finally {
        setTimeout(() => setIsCoolingDown(false), 2200);
      }
    },
    [isCoolingDown, result, token],
  );

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white px-6 py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Accès restreint</p>
          <h1 className="mt-3 text-3xl font-semibold">Connectez-vous pour utiliser la station de scan</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-10">
        <header className="text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-200/80">
            BotGround Manager • Contrôle des accès
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Station de scan premium
          </h1>
          <p className="text-base text-white/70">
            Scannez les QR codes des invitations et visualisez en direct la caméra pour
            guider vos équipes sur site.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_2fr]">
          <section className="rounded-[32px] bg-gradient-to-b from-slate-900 to-slate-950/60 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.65)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/70">
                  Zone de capture
                </p>
                <h2 className="text-2xl font-semibold">Prévisualisation caméra</h2>
              </div>
              <span className="rounded-full bg-white/10 px-4 py-1 text-sm text-white/80">
                Mode automatique • Flash désactivé
              </span>
            </div>

            <div className="relative mt-6">
              <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/10" />
              <div className="pointer-events-none absolute inset-6 rounded-[28px] border border-white/20" />
              <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-t from-black/30 to-transparent" />
              <div className="pointer-events-none absolute left-6 top-6 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
                Live preview
              </div>
              <QrReader
                constraints={{ facingMode: "environment" }}
                scanDelay={1200}
                onResult={(scanResult, error) => {
                  if (scanResult) {
                    const text = scanResult.getText();
                    if (text) handleScan(text);
                  }

                  if (error) {
                    console.debug(error);
                  }
                }}
                containerStyle={containerStyle}
                videoContainerStyle={videoContainerStyle}
                videoStyle={videoStyle}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Autofocus actif
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/50" />
                Conseillé : distance 20–30 cm
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/50" />
                Orientation paysage ou portrait
              </div>
            </div>
          </section>

          <aside className="rounded-[28px] border border-white/5 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium tracking-wide text-white/70">Statut</p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  status.tone === "success"
                    ? "bg-emerald-400/10 text-emerald-300"
                    : status.tone === "error"
                      ? "bg-rose-400/10 text-rose-200"
                      : "bg-white/10 text-white/70"
                }`}
              >
                {status.badge}
              </span>
            </div>
            <p className="mt-3 text-lg font-semibold text-white">{status.message}</p>

            <div className="mt-6 space-y-4 rounded-2xl bg-black/30 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Dernier QR</p>
                <p className="text-2xl font-semibold text-white">
                  {result ?? "En attente"}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 p-4 text-sm text-white/70">
                <p className="font-semibold text-white">Conseils opérateur</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Stabilisez le badge dans le cadre lumineux.</li>
                  <li>Vérifiez le retour sonore ou visuel avant de valider.</li>
                  <li>En cas d'échec, rescannez ou saisissez l'ID manuellement.</li>
                </ul>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-rose-300">{error}</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
