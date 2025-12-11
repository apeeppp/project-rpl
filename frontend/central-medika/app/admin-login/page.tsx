"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Konstanta Warna (Sesuai dengan Dashboard)
const PRIMARY_COLOR = "#ff69b4"; // Hot Pink
const SECONDARY_COLOR = "#ffe4e1"; // Misty Rose (Pink Pucat)
const TEXT_DARK = "#333";
const TEXT_LIGHT = "#fff";
const BORDER_COLOR = "#ffc0cb"; // Light Pink

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Username atau password salah");
        return;
      }

      const data = await res.json();
      localStorage.setItem("admin", JSON.stringify(data));

      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setError("Gagal login");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${SECONDARY_COLOR} 0%, #ffffff 80%)`,
        color: TEXT_DARK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
          border: `1px solid ${BORDER_COLOR}`,
          // Animasi Fade-in untuk form secara keseluruhan
          opacity: 1, // Dimulai dari 0 di CSS eksternal, transisi ke 1
          transform: "translateY(0px)", // Dimulai dari -20px di CSS eksternal
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out", // Animasi masuk
        }}
      >
        <h2 
          style={{ 
            textAlign: "center", 
            marginBottom: 20, 
            color: PRIMARY_COLOR, 
            fontSize: 28, 
            fontWeight: 700,
            transition: "color 0.3s ease", // Animasi untuk teks
          }}
        >
          Admin Login
        </h2>

        {/* Username Input */}
        <label style={{ fontSize: 13, fontWeight: 500 }}>Username</label>
        <input
          placeholder="Masukkan username Anda"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${BORDER_COLOR}`,
            backgroundColor: TEXT_LIGHT,
            color: TEXT_DARK,
            fontSize: 14,
            transition: "border-color 0.3s ease, box-shadow 0.3s ease", // Animasi transisi
            // Efek fokus (jika menggunakan CSS eksternal)
            // "&:focus": { borderColor: PRIMARY_COLOR, boxShadow: "0 0 0 2px rgba(255,105,180,0.2)" }
          }}
        />

        {/* Password Input */}
        <label style={{ fontSize: 13, fontWeight: 500 }}>Password</label>
        <input
          placeholder="Masukkan password Anda"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 10,
            border: `1px solid ${BORDER_COLOR}`,
            backgroundColor: TEXT_LIGHT,
            color: TEXT_DARK,
            fontSize: 14,
            transition: "border-color 0.3s ease, box-shadow 0.3s ease", // Animasi transisi
            // Efek fokus (jika menggunakan CSS eksternal)
            // "&:focus": { borderColor: PRIMARY_COLOR, boxShadow: "0 0 0 2px rgba(255,105,180,0.2)" }
          }}
        />

        {error && (
          <p 
            style={{ 
              color: PRIMARY_COLOR, 
              fontSize: 13, 
              marginTop: 4, 
              fontWeight: 500,
              opacity: 1, // Fade-in untuk error message
              transition: "opacity 0.3s ease-out",
            }}
          >
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
            backgroundColor: PRIMARY_COLOR,
            color: TEXT_LIGHT,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 16,
            transition: "background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease", // Animasi
            boxShadow: "0 4px 6px rgba(255, 105, 180, 0.3)", // Shadow pink
            // Efek hover (jika menggunakan CSS eksternal)
            // "&:hover": { backgroundColor: "#e6559d", transform: "translateY(-2px)" }
            // "&:active": { transform: "translateY(0px)", boxShadow: "0 2px 4px rgba(255,105,180,0.2)" }
          }}
        >
          LOGIN
        </button>
      </form>
    </div>
  );
}