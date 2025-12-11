"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Konstanta Warna (Sesuai dengan Dashboard & Login Admin)
const PRIMARY_COLOR = "#ff69b4"; // Hot Pink
const SECONDARY_COLOR = "#ffe4e1"; // Misty Rose (Pink Pucat)
const TEXT_DARK = "#333";
const TEXT_LIGHT = "#fff";
const BORDER_COLOR = "#ffc0cb"; // Light Pink

export default function DoctorLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/doctor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Username atau password salah");
        return;
      }

      const data = await res.json();
      localStorage.setItem("doctor", JSON.stringify(data));
      router.push("/doctor/dashboard");
    } catch (err) {
      console.error(err);
      setError("Gagal login");
    }
  };

  // Styling untuk input
  const inputStyle: React.CSSProperties = {
    padding: 10,
    borderRadius: 10,
    border: `1px solid ${BORDER_COLOR}`,
    backgroundColor: TEXT_LIGHT,
    color: TEXT_DARK,
    fontSize: 14,
    transition: "border-color 0.3s ease, box-shadow 0.3s ease", // Animasi transisi
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        // Gradient background pink halus ke putih
        background: `linear-gradient(180deg, ${SECONDARY_COLOR} 0%, #ffffff 80%)`,
        color: TEXT_DARK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Font Poppins
        fontFamily: "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 300,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 30,
          borderRadius: 20,
          backgroundColor: TEXT_LIGHT,
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)", // Shadow yang lebih halus
          border: `1px solid ${BORDER_COLOR}`,
          // Animasi masuk form
          opacity: 1, 
          transform: "translateY(0px)", 
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        }}
      >
        <h2 
          style={{ 
            textAlign: "center", 
            marginBottom: 20, 
            color: PRIMARY_COLOR, 
            fontSize: 28, // Ukuran font disamakan dengan Judul Utama
            fontWeight: 700,
          }}
        >
          Dokter Login
        </h2>

        {/* Username Input */}
        <label style={{ fontSize: 13, fontWeight: 500 }}>Username</label>
        <input
          placeholder="Masukkan username Anda"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />

        {/* Password Input */}
        <label style={{ fontSize: 13, fontWeight: 500 }}>Password</label>
        <input
          type="password"
          placeholder="Masukkan password Anda"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <p style={{ color: PRIMARY_COLOR, fontSize: 13, marginTop: 4, fontWeight: 500 }}>
             {error}
          </p>
        )}
        
        {/* Tombol Submit */}
        <button
          type="submit"
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 25,
            border: "none",
            // Warna tombol utama Hot Pink
            backgroundColor: PRIMARY_COLOR, 
            color: TEXT_LIGHT,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 16,
            transition: "background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease", // Animasi
            boxShadow: "0 4px 6px rgba(255, 105, 180, 0.3)", // Shadow pink
          }}
        >
          LOGIN
        </button>
      </form>
    </div>
  );
}