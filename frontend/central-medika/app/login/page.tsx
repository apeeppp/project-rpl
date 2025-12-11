"use client";

import { useRouter } from "next/navigation";

// Konstanta Warna (Sesuai dengan semua komponen sebelumnya)
const PRIMARY_COLOR = "#ff69b4"; // Hot Pink
const SECONDARY_COLOR = "#ffe4e1"; // Misty Rose (Pink Pucat)
const TEXT_DARK = "#333";
const TEXT_LIGHT = "#fff";
const BORDER_COLOR = "#ffc0cb"; // Light Pink

export default function LoginRolePage() {
  const router = useRouter();

  // Style dasar untuk tombol dengan animasi transisi
  const baseButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: 12,
    borderRadius: 25,
    border: "none",
    backgroundColor: PRIMARY_COLOR,
    color: TEXT_LIGHT,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 15,
    transition: "all 0.3s ease", // Animasi transisi
    boxShadow: `0 4px 6px rgba(255, 105, 180, 0.3)`,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        // Background Gradien Halus Statis
        background: `linear-gradient(180deg, ${SECONDARY_COLOR} 0%, #ffffff 80%)`,
        overflow: "hidden", // Tetap jaga ini
        
        color: TEXT_DARK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Definisi Keyframes Dihapus */}
      
      <div
        style={{
          width: 320,
          display: "flex",
          flexDirection: "column",
          gap: 15,
          padding: 30,
          borderRadius: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // Background putih semi-transparan
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
          border: `1px solid ${BORDER_COLOR}`,
          zIndex: 1,
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20, color: PRIMARY_COLOR, fontSize: 30, fontWeight: 800 }}>
          Central Medika
        </h2>

        {/* Tombol Pasien */}
        <button
          type="button"
          onClick={() => router.push("/patient-login")}
          style={{
            ...baseButtonStyle,
            backgroundColor: PRIMARY_COLOR,
            color: TEXT_LIGHT,
          }}
        >
          Login sebagai Pasien
        </button>

        {/* Tambahan: tombol daftar akun pasien */}
        <button
          type="button"
          onClick={() => router.push("/register")}
          style={{
            marginTop: 6,
            width: "100%",
            padding: 10,
            borderRadius: 20,
            border: `2px dashed ${BORDER_COLOR}`,
            backgroundColor: "transparent",
            color: PRIMARY_COLOR,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 13,
          }}
          aria-label="Daftar akun pasien"
        >
          Belum punya akun? Daftar
        </button>

        <hr style={{ border: `0.5px dashed ${BORDER_COLOR}`, margin: "10px 0" }}/>

        {/* Tombol Admin */}
        <button
          type="button"
          onClick={() => router.push("/admin-login")}
          style={{
            ...baseButtonStyle,
            backgroundColor: TEXT_LIGHT,
            color: PRIMARY_COLOR,
            border: `2px solid ${PRIMARY_COLOR}`,
            boxShadow: "none",
          }}
        >
          Login sebagai Admin
        </button>

        {/* Tombol Dokter */}
        <button
          type="button"
          onClick={() => router.push("/doctor-login")}
          style={{
            ...baseButtonStyle,
            backgroundColor: TEXT_LIGHT,
            color: PRIMARY_COLOR,
            border: `2px solid ${PRIMARY_COLOR}`,
            boxShadow: "none",
          }}
        >
          Login sebagai Dokter 
        </button>
      </div>
    </div>
  );
}
