"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PRIMARY_COLOR = "#ff69b4";
const SECONDARY_COLOR = "#ffe4e1";
const TEXT_DARK = "#333";
const TEXT_LIGHT = "#fff";
const BORDER_COLOR = "#ffc0cb";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputStyle: React.CSSProperties = {
    padding: 10,
    borderRadius: 10,
    border: `1px solid ${BORDER_COLOR}`,
    backgroundColor: TEXT_LIGHT,
    color: TEXT_DARK,
    fontSize: 14,
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !username || !password || !confirm) {
      setError("Semua field wajib diisi");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    if (password !== confirm) {
      setError("Password dan konfirmasi tidak cocok");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });

      if (res.status === 409) {
        setError("Username sudah digunakan");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError("Gagal mendaftar");
        setLoading(false);
        return;
      }

      // redirect ke halaman login pasien
      setLoading(false);
      router.push('/patient-login');
    } catch (err) {
      console.error(err);
      setError("Server error");
      setLoading(false);
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
          width: 320,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 30,
          borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.95)",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
          border: `1px solid ${BORDER_COLOR}`,
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 8, color: PRIMARY_COLOR }}>
          Daftar Akun Pasien
        </h2>

        <label style={{ fontSize: 13, fontWeight: 500 }}>Nama</label>
        <input placeholder="Nama lengkap" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />

        <label style={{ fontSize: 13, fontWeight: 500 }}>Username</label>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />

        <label style={{ fontSize: 13, fontWeight: 500 }}>Password</label>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />

        <label style={{ fontSize: 13, fontWeight: 500 }}>Konfirmasi Password</label>
        <input type="password" placeholder="Ulangi password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} />

        {error && <p style={{ color: PRIMARY_COLOR, fontSize: 13 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 25,
            border: "none",
            backgroundColor: PRIMARY_COLOR,
            color: TEXT_LIGHT,
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          {loading ? "Mendaftar..." : "DAFTAR"}
        </button>

        <button type="button" onClick={() => router.push('/patient-login')} style={{ marginTop: 6, background: 'transparent', border: 'none', color: PRIMARY_COLOR, cursor: 'pointer' }}>
          Sudah punya akun? Login
        </button>
      </form>
    </div>
  );
}
