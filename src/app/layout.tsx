import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillGraph Career Navigator",
  description: "A CognoDB-backed graph application for exploring career skill paths.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
