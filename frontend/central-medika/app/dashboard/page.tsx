"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Konstanta Warna (Sesuai dengan Dashboard Admin)
const PRIMARY_COLOR = "#ff69b4"; // Hot Pink
const SECONDARY_COLOR = "#ffe4e1"; // Misty Rose (Pink Pucat)
const TEXT_DARK = "#333";
const TEXT_LIGHT = "#fff";
const BORDER_COLOR = "#ffc0cb"; // Light Pink

type User = {
  id: number;
  name: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(saved));
  }, [router]);

  // Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  // Style dasar untuk tombol dengan animasi transisi
  const baseButton: React.CSSProperties = {
    width: "100%",
    padding: 12,
    marginBottom: 16, // Jarak antar tombol diperbesar
    borderRadius: 15,
    border: `2px solid ${PRIMARY_COLOR}`, // Border Hot Pink
    background: TEXT_LIGHT,
    color: PRIMARY_COLOR,
    cursor: "pointer",
    fontWeight: "600",
    fontSize: 15,
    transition: "all 0.3s ease", // Animasi transisi
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  };

  return (
    <div 
      style={{ 
        minHeight: "100vh",
        background: `linear-gradient(180deg, #ffffff 0%, ${SECONDARY_COLOR} 80%)`,
        color: TEXT_DARK,
        padding: 24,
        fontFamily: "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
        
        // --- PENYESUAIAN UNTUK PUSAT LAYAR (CENTER VERTICAL & HORIZONTAL) ---
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center Horizontal
        justifyContent: 'center', // Center Vertical
        // -------------------------------------------------------------------
      }}
    >
      <div 
        style={{ 
          maxWidth: 400, 
          width: '100%', // Tambahkan width: '100%' agar maxWidth berfungsi dengan baik
          margin: "0 auto",
          // Karena kontainer utama di-center-kan, margin: "0 auto" di div ini tidak lagi
          // diperlukan untuk centering horizontal, tetapi tetap bermanfaat.
        }}
      >

        {/* Header dan Logout */}
        <div 
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: 40,
            borderBottom: `1px solid ${BORDER_COLOR}`,
            paddingBottom: 10,
          }}
        >
            <h2 
              style={{ 
                margin: 0, 
                color: PRIMARY_COLOR, 
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              Halo, {user.name}!
            </h2>

            <button
                onClick={handleLogout}
                style={{
                  padding: "6px 10px",
                  borderRadius: 15,
                  border: `1px solid ${PRIMARY_COLOR}`,
                  backgroundColor: TEXT_LIGHT,
                  color: PRIMARY_COLOR,
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: 12,
                  transition: "all 0.3s ease",
                }}
              >
              Keluar
            </button>
        </div>
        
        {/* Kontainer Tombol Utama */}
        <div style={{ padding: 10, backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 15 }}>
          
          <button
            style={{
              ...baseButton,
              background: PRIMARY_COLOR,
              color: TEXT_LIGHT,
              boxShadow: `0 4px 8px rgba(255, 105, 180, 0.4)`,
            }}
            onClick={() => router.push("/reservations/new")}
          >
            Buat Reservasi Baru
          </button>

          <button
            style={{
              ...baseButton,
              background: TEXT_LIGHT,
              color: PRIMARY_COLOR,
              border: `2px solid ${BORDER_COLOR}`,
            }}
            onClick={() => router.push("/reservations/list")}
          >
           Lihat Status & Riwayat
          </button>

          <button
            style={{
              ...baseButton,
              background: TEXT_LIGHT,
              color: PRIMARY_COLOR,
              border: `2px solid ${BORDER_COLOR}`,
            }}
            onClick={() => router.push("/records")}
          >
             Lihat Rekam Medis
          </button>
        </div>
      </div>
    </div>
  );
}