import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Case Readiness System",
  description: "Manage case readiness in one place.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="page-shell header-content">
            <Link className="brand" href="/">
              Case Readiness System
            </Link>
            <nav aria-label="Primary navigation">
              <ul className="navigation-list">
                <li>
                  <Link href="/tenants">Tenants</Link>
                </li>
                <li>
                  <Link href="/cases">Cases</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="page-shell page-content">{children}</main>
      </body>
    </html>
  );
}
