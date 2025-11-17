// components/InviteTable.tsx
import Link from "next/link";

export default function InviteTable({ invites }: { invites: any[] }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Liste des invitations</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th>Nom</th>
            <th>Prénom</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Statut</th>
            <th>PDF</th>
          </tr>
        </thead>

        <tbody>
          {invites.map((inv) => (
            <tr key={inv.id} className="border-b">
              <td>{inv.nom}</td>
              <td>{inv.prenom}</td>
              <td>{inv.phone || "-"}</td>
              <td>{inv.email || "-"}</td>
              <td>
                {inv.status === "SCANNED" ? (
                  <span className="text-green-600">Scanné</span>
                ) : (
                  <span className="text-orange-600">Invité</span>
                )}
              </td>
              <td>
                <Link
                  className="text-blue-600 underline"
                  href={`/api/invites/${inv.id}/pdf`}
                  target="_blank"
                >
                  PDF
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
