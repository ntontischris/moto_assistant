import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moto Assistant",
  description: "MotoMarket AI Voice Assistant for client discovery interviews",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
