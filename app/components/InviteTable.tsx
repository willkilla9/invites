// components/InviteTable.tsx
import Link from "next/link";

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

export default function InviteTable({ invites }: { invites: any[] }) {
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

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
        <table className="min-w-full divide-y divide-white/5 text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-slate-400">
            <tr>
              {[
                "Nom",
                "Prénom",
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
              return (
                <tr key={inv.id} className="transition hover:bg-white/5">
                  <td className="px-4 py-4 font-semibold text-white">{inv.nom}</td>
                  <td className="px-4 py-4 text-slate-300">{inv.prenom}</td>
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
  );
}
