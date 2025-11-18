// components/InviteTable.tsx
import Link from "next/link";

type EventById = Record<string, { id: string; name: string } | undefined>;

const statusConfig: Record<string, { label: string; className: string }> = {
  SCANNED: {
    label: "Scanné",
    className: "bg-emerald-500/15 text-emerald-200 border-emerald-500/40",
  },
  INVITED: {
    label: "Invité",
    className: "bg-amber-500/15 text-amber-200 border-amber-400/40",
  },
};

export default function InviteTable({ invites, eventsById }: { invites: any[]; eventsById: EventById }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-6 text-slate-100 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Suivi</p>
          <h2 className="text-2xl font-semibold text-white">Liste des invitations</h2>
        </div>
        <span className="hidden rounded-full border border-white/10 px-4 py-1 text-xs text-slate-300 sm:inline-flex">
          {invites.length} invités
        </span>
      </div>

      <div className="mt-6 space-y-6">
        <div className="grid gap-3 sm:hidden">
          {invites.map((inv) => {
            const status = statusConfig[inv.status] ?? statusConfig.INVITED;
            const event = eventsById[inv.eventId ?? ""];
            return (
              <div key={inv.id} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{inv.nom}</p>
                    <p className="text-xs text-slate-400">{inv.prenom}</p>
                    {event && <p className="text-xs text-slate-500">{event.name}</p>}
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <dl className="mt-3 space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <dt>Téléphone</dt>
                    <dd className="text-slate-200">{inv.phone || "-"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Email</dt>
                    <dd className="text-slate-200">{inv.email || "-"}</dd>
                  </div>
                </dl>
                <Link
                  className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-indigo-400/40 px-3 py-2 text-xs font-semibold text-indigo-200 transition hover:border-indigo-300 hover:text-white"
                  href={`/api/invites/${inv.id}/pdf`}
                  target="_blank"
                >
                  Télécharger le PDF
                </Link>
              </div>
            );
          })}
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 sm:block">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5 text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
                <tr>
                  {[
                    "Nom",
                    "Prénom",
                    "Évènement",
                    "Téléphone",
                    "Email",
                    "Statut",
                    "Document",
                  ].map((col) => (
                    <th key={col} className="px-4 py-3 font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invites.map((inv) => {
                  const status = statusConfig[inv.status] ?? statusConfig.INVITED;
                  const event = eventsById[inv.eventId ?? ""];
                  return (
                    <tr key={inv.id} className="transition hover:bg-white/5">
                      <td className="px-4 py-4 font-semibold text-white">{inv.nom}</td>
                      <td className="px-4 py-4 text-slate-300">{inv.prenom}</td>
                      <td className="px-4 py-4 text-slate-400">{event?.name || "-"}</td>
                      <td className="px-4 py-4 text-slate-400">{inv.phone || "-"}</td>
                      <td className="px-4 py-4 text-slate-400">{inv.email || "-"}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 px-3 py-1 text-xs font-semibold text-indigo-200 transition hover:border-indigo-300 hover:text-white"
                          href={`/api/invites/${inv.id}/pdf`}
                          target="_blank"
                        >
                          Télécharger PDF
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
