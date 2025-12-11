// BackButton.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import React from "react";
import styles from './BackButton.module.css';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  const noBackButton = [
    "/",
    "/login",
    "/patient-login",
    "/admin-login",
    "/doctor-login",
    "/login-role",
    "/dashboard" 
  ];

  if (noBackButton.some(path => pathname.startsWith(path))) {
    return null;
  }

  return (
    <button
      onClick={() => router.back()}
      className={styles.backButton} // Menggunakan CSS Modules
    >
      ◀ Kembali
    </button>
  );
}