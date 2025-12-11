"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Konstanta Warna (Sesuai dengan semua komponen sebelumnya)
const PRIMARY_COLOR = "#ff69b4"; // Hot Pink
const SECONDARY_COLOR = "#ffe4e1"; // Misty Rose (Pink Pucat)
const TEXT_DARK = "#333";
const TEXT_LIGHT = "#fff";
const BORDER_COLOR = "#ffc0cb"; // Light Pink - INI AKAN DIGUNAKAN UNTUK TOMBOL BATALKAN
const DANGER_COLOR = "#dc2626"; // Merah (Dipertahankan hanya untuk Hapus Permanen)
// Warna Baru untuk Tombol Batalkan - Diubah menjadi BORDER_COLOR
const CANCEL_BUTTON_BG_COLOR = BORDER_COLOR; // Menggunakan Light Pink

type User = {
  id: number;
  name: string;
};

type Reservation = {
  id: number;
  date: string;
  time: string;
  status: string;
  complaint: string | null;
  doctor_name: string;
  specialty: string;
};

// Helper untuk mendapatkan warna status
const getStatusColor = (status: string) => {
    switch (status) {
        case "Aktif":
            return "#87ceeb"; // Light Sky Blue
        case "Selesai":
            return "#90ee90"; // Light Green
        case "Batal":
            return DANGER_COLOR; // Merah
        default:
            return BORDER_COLOR;
    }
};

export default function ReservationListPage() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<"Aktif" | "Selesai" | "Batal">("Aktif");
  const [items, setItems] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);

  const [detail, setDetail] = useState<Reservation | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  // cek login pasien
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(saved));
  }, [router]);

  // ambil data reservasi sesuai status
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("userId", String(user.id));
        if (status) params.set("status", status);

        const res = await fetch(
          `http://localhost:5000/api/reservations?${params.toString()}`
        );
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, status]);

  if (!user) return null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  const formatTime = (isoTime: string) => isoTime.slice(0, 5) + " WIB";

  // ubah status ke "Batal"
  const handleCancel = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Batal" }),
      });

      if (!res.ok) {
        console.error("Gagal membatalkan reservasi");
        return;
      }

      const updated = await res.json();
      setItems((prev) =>
        prev.filter((r) => r.id !== updated.id) // Filter keluar item yang sudah Batal
      );

      // Cek apakah detail yang ditampilkan adalah yang baru saja dibatalkan
      setDetail((prev) =>
        prev && prev.id === updated.id ? { ...prev, status: updated.status } : prev
      );
    } catch (err) {
      console.error(err);
    }
  };

  // buka modal konfirmasi hapus
  const handleAskDelete = (id: number) => {
    setConfirmDeleteId(id);
  };

  // eksekusi hapus setelah user klik "Hapus" di modal
  const handleConfirmDelete = async () => {
    if (confirmDeleteId == null) return;

    try {
      setDeleting(true);

      const res = await fetch(
        `http://localhost:5000/api/reservations/${confirmDeleteId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        console.error("Gagal menghapus reservasi");
        setDeleting(false);
        return;
      }

      // buang kartu dari list
      setItems((prev) => prev.filter((r) => r.id !== confirmDeleteId));

      // kalau detail yang kebuka barusan dihapus, tutup
      setDetail((prev) =>
        prev && prev.id === confirmDeleteId ? null : prev
      );

      setDeleting(false);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (deleting) return;
    setConfirmDeleteId(null);
  };
  
  // Style Tombol Aksi
  const actionButtonStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: 999,
    border: "none",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
  };
  
  // Style Tombol Filter
  const filterButtonStyle = (s: string) => ({
    padding: "8px 16px",
    borderRadius: 999,
    border: `1px solid ${status === s ? PRIMARY_COLOR : BORDER_COLOR}`,
    cursor: "pointer",
    fontWeight: 600,
    backgroundColor: status === s ? PRIMARY_COLOR : TEXT_LIGHT,
    color: status === s ? TEXT_LIGHT : TEXT_DARK,
    fontSize: 14,
    transition: "all 0.3s ease",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        // Background Gradien Halus Statis
        background: `linear-gradient(180deg, ${SECONDARY_COLOR} 0%, #ffffff 80%)`,
        color: TEXT_DARK,
        paddingTop: 40,
        paddingBottom: 40,
        fontFamily: "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>
        
        {/* Header Utama */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: `2px solid ${BORDER_COLOR}`, paddingBottom: 10 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: PRIMARY_COLOR,
                margin: 0,
              }}
            >
              Daftar Reservasi Anda
            </h1>
             <button
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: "8px 12px",
                  borderRadius: 20,
                  border: `1px solid ${PRIMARY_COLOR}`,
                  backgroundColor: TEXT_LIGHT,
                  color: PRIMARY_COLOR,
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: 14,
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
              Kembali
            </button>
        </div>


        {/* Tombol Filter Status */}
        <div
          style={{
            display: "flex",
            gap: 10,
            // Diratakan ke kiri
            justifyContent: "flex-start", 
            marginBottom: 24,
            padding: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: 15,
          }}
        >
          {(["Aktif", "Selesai", "Batal"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={filterButtonStyle(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <h2
          style={{
            fontSize: 18,
            marginBottom: 16,
            color: TEXT_DARK,
            fontWeight: 600,
            borderBottom: `1px dashed ${BORDER_COLOR}`,
            paddingBottom: 4,
          }}
        >
          Reservasi dengan status: {status}
        </h2>

        {loading && (
          <p style={{ fontSize: 14, color: PRIMARY_COLOR }}>Memuat data... ⏳</p>
        )}

        {!loading && items.length === 0 && (
          <p style={{ fontSize: 14, color: TEXT_DARK, textAlign: 'center', marginTop: 30 }}>
            Belum ada reservasi dengan status {status}.
          </p>
        )}

        {/* Kartu Reservasi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
          {!loading &&
            items.map((r) => (
              <div
                key={r.id}
                style={{
                  backgroundColor: TEXT_LIGHT,
                  color: TEXT_DARK,
                  borderRadius: 16,
                  padding: 16,
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  borderLeft: `5px solid ${getStatusColor(r.status)}`,
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: PRIMARY_COLOR }}>
                  {r.doctor_name}
                </div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>Spesialisasi: {r.specialty}</div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: "bold" }}>🗓️ Tanggal: </span> {formatDate(r.date)} - {formatTime(r.time)}
                </div>
                <div style={{ fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: "bold" }}>🏷️ Status: </span> {r.status}
                </div>
                {r.complaint && (
                  <div style={{ fontSize: 13, marginBottom: 8 }}>
                    <span style={{ fontWeight: "bold" }}>💬 Keluhan: </span> {r.complaint}
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "flex-end",
                    marginTop: 12,
                    borderTop: `1px dashed ${BORDER_COLOR}`,
                    paddingTop: 10,
                  }}
                >
                  <button
                    onClick={() => setDetail(r)}
                    style={{
                      ...actionButtonStyle,
                      backgroundColor: BORDER_COLOR,
                      color: TEXT_DARK,
                    }}
                  >
                    Lihat Detail
                  </button>

                  {r.status === "Aktif" && (
                    <button
                      onClick={() => handleCancel(r.id)}
                      style={{
                        ...actionButtonStyle,
                        // --- PENYESUAIAN: WARNA TOMBOL BATAL KE CANCEL_BUTTON_BG_COLOR ---
                        backgroundColor: CANCEL_BUTTON_BG_COLOR, 
                        // ---------------------------------------------------------------
                        color: TEXT_DARK, // Diubah agar teks lebih terlihat di warna pink terang
                      }}
                    >
                      Batalkan
                    </button>
                  )}

                  {(r.status === "Batal" || r.status === "Selesai") && (
                    <button
                      onClick={() => handleAskDelete(r.id)}
                      style={{
                        ...actionButtonStyle,
                        backgroundColor: DANGER_COLOR, // Tombol Hapus tetap merah
                        color: TEXT_LIGHT,
                      }}
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>


        {/* MODAL DETAIL */}
        {detail && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 20,
              transition: "opacity 0.3s ease",
            }}
          >
            <div
              style={{
                width: 360,
                backgroundColor: TEXT_LIGHT,
                borderRadius: 16,
                padding: 20,
                color: TEXT_DARK,
                fontFamily: "'Poppins', sans-serif",
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                transition: "transform 0.3s ease",
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  fontSize: 20,
                  marginBottom: 12,
                  color: PRIMARY_COLOR,
                  borderBottom: `1px dashed ${BORDER_COLOR}`,
                  paddingBottom: 8,
                }}
              >
                Detail Reservasi
              </h3>
              <p style={{ fontSize: 14, marginBottom: 6 }}>
                <strong>Dokter:</strong> {detail.doctor_name}
              </p>
              <p style={{ fontSize: 14, marginBottom: 6 }}>
                <strong>Spesialis:</strong> {detail.specialty}
              </p>
              <p style={{ fontSize: 14, marginBottom: 6 }}>
                <strong>🗓️ Tanggal:</strong> {formatDate(detail.date)}
              </p>
              <p style={{ fontSize: 14, marginBottom: 6 }}>
                <strong> Waktu:</strong> {formatTime(detail.time)}
              </p>
              <p style={{ fontSize: 14, marginBottom: 12 }}>
                <strong>🏷️ Status:</strong> <span style={{ fontWeight: 'bold', color: TEXT_DARK, backgroundColor: getStatusColor(detail.status), padding: '2px 8px', borderRadius: 8 }}>{detail.status}</span>
              </p>
              <p style={{ fontSize: 14, marginBottom: 8, borderTop: `1px dashed ${BORDER_COLOR}`, paddingTop: 12 }}>
                <strong>💬 Keluhan:</strong>{" "}
                {detail.complaint || "Tidak ada keluhan yang dicatat"}
              </p>

              <div style={{ textAlign: "right", marginTop: 15 }}>
                <button
                  onClick={() => setDetail(null)}
                  style={{
                    ...actionButtonStyle,
                    backgroundColor: TEXT_DARK,
                    color: TEXT_LIGHT,
                    fontSize: 14,
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL KONFIRMASI HAPUS */}
        {confirmDeleteId !== null && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 30,
            }}
          >
            <div
              style={{
                width: 360,
                backgroundColor: TEXT_LIGHT,
                borderRadius: 16,
                padding: 20,
                color: TEXT_DARK,
                fontFamily: "'Poppins', sans-serif",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              }}
            >
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 10,
                  color: DANGER_COLOR,
                  borderBottom: `1px dashed ${BORDER_COLOR}`,
                  paddingBottom: 8,
                }}
              >
                Hapus Reservasi
              </h3>
              <p style={{ fontSize: 14, marginBottom: 20 }}>
                Anda yakin ingin menghapus reservasi ini secara permanen? Tindakan ini **tidak dapat dibatalkan**.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <button
                  onClick={handleCancelDelete}
                  disabled={deleting}
                  style={{
                    ...actionButtonStyle,
                    backgroundColor: BORDER_COLOR,
                    color: TEXT_DARK,
                    fontSize: 14,
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  style={{
                    ...actionButtonStyle,
                    backgroundColor: DANGER_COLOR,
                    color: TEXT_LIGHT,
                    fontSize: 14,
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting ? "Menghapus..." : "Hapus Permanen"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}