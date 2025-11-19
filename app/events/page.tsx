import Link from "next/link";
import EventForm from "../components/EventForm";
import Navbar from "../components/Navbar";

interface EventRecord {
  id: string;
  name: string;
  logoUrl?: string | null;
  date?: string | null;
  time?: string | null;
  place?: string | null;
  createdAt?: number;
}

const formatTimestamp = (timestamp?: number) => {
  if (!timestamp) return "Ajout récent";
  try {
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp));
  } catch (error) {
    return "Ajout récent";
  }
};

export default async function EventsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const res = await fetch(`${baseUrl}/api/events`, { cache: "no-store" });
  const events: EventRecord[] = res.ok ? await res.json() : [];

  return (
    <div className="min-h-screen bg-slate-950/95 bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] text-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-10 px-6 pb-16 pt-8 sm:px-8 md:pt-12">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Gestion des évènements</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">Votre catalogue d&apos;évènements</h1>
              <p className="mt-3 max-w-2xl text-base text-slate-200">
                Centralisez le contexte de vos opérations : logo, date, lieu… Tout est prêt à être relié aux invitations en quelques clics.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40"
            >
              Retourner aux invitations
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <EventForm />
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 text-slate-100">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Catalogue</p>
              <h2 className="text-2xl font-semibold text-white">{events.length || "Aucun"} évènement{events.length > 1 ? "s" : ""}</h2>
              <p className="mt-2 text-sm text-slate-300">
                Retrouvez ici les évènements prêts à accueillir vos invités. Ajoutez-en un nouveau ou mettez à jour les informations existantes.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {events.length === 0 && (
                <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-6 text-center text-sm text-slate-300">
                  Aucun évènement enregistré pour le moment. Créez-en un via le formulaire pour commencer.
                </p>
              )}

              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 px-5 py-4 shadow-inner shadow-black/40"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{event.name}</p>
                      <p className="text-sm text-slate-300">
                        {event.date || "Date à définir"}
                        {event.time ? ` • ${event.time}` : ""}
                      </p>
                      <p className="text-sm text-slate-400">{event.place || "Lieu à préciser"}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{formatTimestamp(event.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
