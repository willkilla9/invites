// app/page.tsx
import CsvImport from "./components/CsvImport";
import EventForm from "./components/EventForm";
import InviteForm from "./components/InviteForm";
import InviteTable from "./components/InviteTable";
import Navbar from "./components/Navbar";

export default async function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const [invitesRes, eventsRes] = await Promise.all([
    fetch(`${baseUrl}/api/invites`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/events`, { cache: "no-store" }),
  ]);
  const invites = invitesRes.ok ? await invitesRes.json() : [];
  const events = eventsRes.ok ? await eventsRes.json() : [];
  const totalInvites = invites.length;
  const scannedInvites = invites.filter((inv: any) => inv.status === "SCANNED").length;
  const pendingInvites = totalInvites - scannedInvites;
  const eventsById = events.reduce((acc: Record<string, any>, evt: any) => {
    acc[evt.id] = evt;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950/95 bg-[radial-gradient(circle_at_top,_#0f172a,_#020617)] text-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-12 px-6 pb-16 pt-8 sm:px-8 md:pt-12">
        <section
          id="dashboard"
          className="rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 shadow-2xl shadow-indigo-500/20 sm:p-8"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Gestion Premium</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">
                Tableau de bord des invitations
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-300">
                Surveillez les confirmations, importez vos listes et partagez des PDF prêts à l&apos;emploi.
                Une expérience soignée pour travailler vite et bien sur votre prochain évènement.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-right">
              <p className="text-xs uppercase tracking-widest text-slate-300">Invitations actives</p>
              <p className="text-4xl font-semibold text-white">{totalInvites}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total", value: totalInvites, accent: "from-slate-800/40 to-slate-900" },
              { label: "Scannées", value: scannedInvites, accent: "from-emerald-900/40 to-emerald-950" },
              { label: "En attente", value: pendingInvites, accent: "from-amber-900/40 to-amber-950" },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border border-white/5 bg-gradient-to-br ${item.accent} px-5 py-4 shadow-inner`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                <p className="mt-1 text-3xl font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="form" className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <InviteForm events={events} />
            <div id="import">
              <CsvImport events={events} />
            </div>
          </div>
          <EventForm />
        </section>

        <section id="table">
          <InviteTable invites={invites} eventsById={eventsById} />
        </section>
      </main>
    </div>
  );
}
