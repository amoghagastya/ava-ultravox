import "@/app/globals.css";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Service Training Simulator",
  description: "An interactive training tool for customer service representatives, powered by AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}
      <Analytics />
      </body>
    </html>
  )
}
