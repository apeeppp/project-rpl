"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Konstanta Warna (Sesuai dengan Dashboard Admin & Login)
const PRIMARY_COLOR = "#ff69b4"; // Hot Pink
const SECONDARY_COLOR = "#ffe4e1"; // Misty Rose (Pink Pucat)
const TEXT_DARK = "#333"; // Warna Teks Hitam
const TEXT_LIGHT = "#fff";
const BORDER_COLOR = "#ffc0cb"; // Light Pink

// =========================================================================

type DoctorSession = {
  id: number;
  doctorId: number;
  name: string;
  specialty: string;
  role: string;
};

type Reservation = {
  id: number;
  date: string;
  time: string;
  status: string;
  complaint: string | null;
  patient_name: string;
  doctor_name: string;
  specialty: string;
};

/**
 * Komponen Pembantu: DoctorReservationCard
 * Menampilkan detail reservasi dan tombol aksi khusus Dokter.
 */
const DoctorReservationCard: React.FC<{ r: Reservation; updateStatus: (id: number, status: string) => void; router: any }> = ({ r, updateStatus, router }) => {
    
    // Helper untuk warna border kartu dan status badge
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Aktif":
                return "#87ceeb"; // Light Sky Blue
            case "Selesai":
                return "#90ee90"; // Light Green
            case "Batal":
                return "#f08080"; // Light Coral
            case "Tidak Hadir":
                return "#ffdab9"; // Peach Puff
            default:
                return BORDER_COLOR;
        }
    };
    
    const formatDate = (d: string) => {
        if (!d) return "-";
        return new Date(d).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
    };
    
    const formatTime = (t: string) => {
        if (!t) return "-";
        return t.slice(0, 5) + " WIB";
    };

    // Styling dasar untuk tombol aksi
    const baseButtonStyle = {
        padding: "8px 12px",
        borderRadius: 15,
        border: "none",
        cursor: "pointer",
        color: TEXT_DARK,
        fontSize: 12,
        fontWeight: "bold",
        transition: "all 0.3s ease", // Transisi untuk hover
    };

    // Style Aksi (Warna)
    const activeStyle = { ...baseButtonStyle, backgroundColor: "#add8e6" };
    const finishStyle = { ...baseButtonStyle, backgroundColor: "#c8f7c5" };
    const cancelStyle = { ...baseButtonStyle, backgroundColor: "#ffb6c1" };
    const absentStyle = { ...baseButtonStyle, backgroundColor: "#f0e68c" };
    
    // PERUBAHAN DI SINI: Warna teks (color) diubah menjadi TEXT_DARK (hitam)
    const recordStyle = { ...baseButtonStyle, backgroundColor: "#d0e4ff", color: TEXT_DARK }; 

    return (
        <div
            style={{
                padding: 15,
                borderRadius: 15,
                marginBottom: 15,
                backgroundColor: TEXT_LIGHT,
                color: TEXT_DARK,
                borderLeft: `5px solid ${getStatusColor(r.status)}`,
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
            }}
        >
            <div
                style={{
                    fontWeight: 700,
                    fontSize: 18,
                    marginBottom: 8,
                    color: PRIMARY_COLOR,
                }}
            >
                Pasien: {r.patient_name}
            </div>

            <div
                style={{
                    fontSize: 14,
                    fontWeight: 400
                }}
            >
                <div style={{ marginBottom: 2 }}>
                    🗓️ Jadwal: {formatDate(r.date)} •  {formatTime(r.time)}
                </div>
                <div style={{ marginBottom: 2 }}>
                    🏷️ Status:{" "}
                    <span
                        style={{
                            fontWeight: "bold",
                            color: TEXT_DARK,
                            padding: "2px 8px",
                            borderRadius: 8,
                            backgroundColor: getStatusColor(r.status),
                            transition: "background-color 0.3s ease",
                        }}
                    >
                        {r.status}
                    </span>
                </div>
                <div>💬 Keluhan: {r.complaint || "-"}</div>
            </div>

            {/* Tombol Aksi */}
            <div
                style={{
                    marginTop: 12,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    borderTop: `1px dashed ${BORDER_COLOR}`,
                    paddingTop: 8,
                }}
            >
                <button
                    onClick={() => updateStatus(r.id, "Aktif")}
                    style={activeStyle}
                >
                    Jadikan Aktif
                </button>
                <button
                    onClick={() => updateStatus(r.id, "Selesai")}
                    style={finishStyle}
                >
                    Tandai Selesai 
                </button>
                <button
                    onClick={() => updateStatus(r.id, "Batal")}
                    style={cancelStyle}
                >
                    Batalkan 
                </button>
                <button
                    onClick={() => updateStatus(r.id, "Tidak Hadir")}
                    style={absentStyle}
                >
                    Tidak Hadir 
                </button>
                <button
                    onClick={() =>
                      router.push(
                        `/doctor/records/new?reservationId=${r.id}&patientName=${encodeURIComponent(
                          r.patient_name
                        )}`
                      )
                    }
                    style={recordStyle}
                >
                    Isi Rekam Medis
                </button>
            </div>
        </div>
    );
};

// =========================================================================

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorSession | null>(null);
  const [items, setItems] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("Aktif");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("doctor");
    if (!saved) {
      router.push("/doctor-login");
      return;
    }
    setDoctor(JSON.parse(saved));
  }, [router]);

  useEffect(() => {
    if (!doctor) return;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        params.set("doctorId", String(doctor.doctorId));
        if (statusFilter !== "Semua") {
          params.set("status", statusFilter);
        }

        const url =
          "http://localhost:5000/api/doctor/reservations?" +
          params.toString();

        const res = await fetch(url);
        if (!res.ok) {
          setError("Gagal memuat data");
          return;
        }

        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [doctor, statusFilter]);

  const handleLogout = () => {
    localStorage.removeItem("doctor");
    router.push("/login");
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/reservations/${id}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        alert("Gagal mengubah status");
        return;
      }

      const updated = await res.json();

      setItems((prev) => {
        const newItems = prev.map((r) =>
            r.id === updated.id ? { ...r, status: updated.status } : r
        );
        
        if (statusFilter === "Semua") {
          return newItems;
        }

        return newItems.filter((r) => r.status === statusFilter);
      });
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status");
    }
  };

  if (!doctor) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${SECONDARY_COLOR} 0%, #ffffff 80%)`,
        color: TEXT_DARK,
        padding: 24,
        fontFamily: "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        
        {/* Header (Bab 1) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            paddingBottom: 12,
            borderBottom: `2px solid ${BORDER_COLOR}`,
          }}
        >
          <div>
            <h2 
              style={{ 
                margin: 0, 
                color: PRIMARY_COLOR,
                fontSize: 28, 
                fontWeight: 700,
              }}
            >
              Dashboard Dokter
            </h2>
            <p 
              style={{ 
                margin: 0, 
                fontSize: 14, 
                color: TEXT_DARK,
                fontWeight: 400,
              }}
            >
              {doctor.name} - {doctor.specialty}
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "10px 15px",
              borderRadius: 20,
              border: `1px solid ${PRIMARY_COLOR}`,
              backgroundColor: TEXT_LIGHT,
              color: PRIMARY_COLOR,
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            Keluar
          </button>
        </div>

        {/* Filter Status (Sub Bab 1) */}
        <div style={{ marginBottom: 20, padding: 8, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.7)', border: `1px solid ${BORDER_COLOR}` }}>
          <span 
            style={{ 
              fontSize: 15, 
              marginRight: 8, 
              fontWeight: 600 
            }}
          >
            Filter status:
          </span>

          {["Aktif", "Selesai", "Batal", "Tidak Hadir", "Semua"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "8px 12px",
                marginRight: 6,
                borderRadius: 15,
                border: `1px solid ${statusFilter === s ? PRIMARY_COLOR : BORDER_COLOR}`,
                cursor: "pointer",
                backgroundColor: statusFilter === s ? PRIMARY_COLOR : TEXT_LIGHT,
                color: statusFilter === s ? TEXT_LIGHT : TEXT_DARK,
                fontSize: 12,
                fontWeight: statusFilter === s ? "bold" : "normal",
                transition: "all 0.3s ease",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {loading && (
          <p style={{ fontSize: 14, color: PRIMARY_COLOR, fontWeight: "bold" }}>
            Memuat data reservasi... ⏳
          </p>
        )}
        {error && <p style={{ fontSize: 14, color: "red" }}>{error} ❌</p>}

        {/* Daftar Reservasi (Bab 2) */}
        <div style={{ marginTop: 20 }}>
          {items.map((r) => (
            <DoctorReservationCard key={r.id} r={r} updateStatus={updateStatus} router={router} />
          ))}
        </div>

        {!loading && items.length === 0 && !error && (
          <p style={{ fontSize: 14, color: PRIMARY_COLOR, textAlign: "center", marginTop: 30 }}>
            Tidak ada data reservasi untuk status {statusFilter}.
          </p>
        )}
      </div>
    </div>
  );
}