"use client";

import "./globals.css";
import { useRouter, usePathname } from "next/navigation";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // halaman yang tidak butuh tombol back
  const noBackButton = ["/", "/login"];

  return (
    <html lang="id">
      <body className="min-h-screen bg-black text-white relative">

        {/* Tombol Back global */}
        {!noBackButton.includes(pathname) && (
          <button
            onClick={() => router.back()}
            className="
              fixed top-4 left-4 z-999
              bg-white text-[#ff69b4]
              rounded-full px-4 py-1
              shadow-lg
            "
          >
            ◀ Back
          </button>
        )}

        {children}
      </body>
    </html>
  );
}
