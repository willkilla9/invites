import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";

export const metadata: Metadata = {
  title: "I Invite You",
  description: "Générez, envoyez et contrôlez vos invitations en toute sécurité",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
