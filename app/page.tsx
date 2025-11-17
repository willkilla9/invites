// app/page.tsx
import CsvImport from "./components/CsvImport";
import InviteForm from "./components/InviteForm";
import InviteTable from "./components/InviteTable";

export default async function HomePage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/invites`, {
    cache: "no-store",
  });
  const invites = await res.json();

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Invitations</h1>

      <div className="max-w-xl mb-10">
        <InviteForm />
      </div>
      <div className="mt-4">
        <CsvImport />
      </div>
      <InviteTable invites={invites} />
    </main>
  );
}
