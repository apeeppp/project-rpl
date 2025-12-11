"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Konstanta Warna (Sesuai dengan semua komponen sebelumnya)
const PRIMARY_COLOR = "#ff69b4"; // Hot Pink
const SECONDARY_COLOR = "#ffe4e1"; // Misty Rose (Pink Pucat)
const TEXT_DARK = "#333";
const TEXT_LIGHT = "#fff";
const BORDER_COLOR = "#ffc0cb"; // Light Pink

type Prescription = {
  name: string;
  dose: string;
};

type Record = {
  id: number;
  date: string;
  time: string;
  diagnosis: string;
  notes: string;
  doctor_name: string;
  specialty: string;
  prescriptions: Prescription[];
};

export default function MedicalRecordsPage() {
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(saved));
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        setLoading(true);

        const url = new URL("http://localhost:5000/api/records");
        url.searchParams.set("userId", user.id);

        const res = await fetch(url.toString());
        const data = await res.json();

        setRecords(Array.isArray(data) ? data : []);

      } catch (err) {
        console.error(err);
        setRecords([]); // fallback aman
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  if (!user) return null;

  return (
    <div 
      style={{ 
        minHeight: "100vh",
        // Background Gradien Halus Statis
        background: `linear-gradient(180deg, #ffffff 0%, ${SECONDARY_COLOR} 80%)`,
        color: TEXT_DARK,
        padding: 24,
        fontFamily: "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        
        {/* Header Rekam Medis */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: `2px solid ${BORDER_COLOR}`, paddingBottom: 10 }}>
            <h2 
              style={{ 
                margin: 0, 
                color: PRIMARY_COLOR, 
                fontSize: 28, 
                fontWeight: 700 
              }}
            >
              Rekam Medis Pasien
            </h2>
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

        {loading && <p style={{ color: PRIMARY_COLOR, fontWeight: 600 }}>Memuat data rekam medis... ⏳</p>}

        {!loading && records.length === 0 && (
          <p style={{ color: TEXT_DARK }}>Belum ada rekam medis untuk akun ini.</p>
        )}

        {/* Daftar Rekam Medis */}
        {!loading &&
          records.length > 0 &&
          records.map((r) => (
            <div
              key={r.id}
              style={{
                backgroundColor: TEXT_LIGHT,
                color: TEXT_DARK,
                padding: 15,
                borderRadius: 15,
                marginBottom: 20,
                borderLeft: `5px solid ${PRIMARY_COLOR}`, // Garis penekanan
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease",
              }}
            >
              {/* Info Dokter */}
              <div style={{ borderBottom: `1px dashed ${BORDER_COLOR}`, paddingBottom: 8, marginBottom: 8 }}>
                <h3 style={{ margin: 0, color: PRIMARY_COLOR, fontSize: 18, fontWeight: 700 }}>
                   {r.doctor_name}
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: TEXT_DARK }}>Spesialisasi: {r.specialty}</p>
              </div>

              {/* Detail Medis */}
              <div style={{ fontSize: 14, marginBottom: 10 }}>
                <p style={{ margin: 0 }}>
                  <b>🗓️ Tanggal:</b> {formatDate(r.date)} • <b>Waktu:</b> {r.time}
                </p>

                <p style={{ margin: "8px 0" }}>
                  <b>🔬 Diagnosis:</b> {r.diagnosis}
                </p>

                <p style={{ margin: "8px 0" }}>
                  <b>🗒️ Catatan Dokter:</b> {r.notes}
                </p>
              </div>

              {/* Resep Obat */}
              {r.prescriptions.length > 0 && (
                <div style={{ borderTop: `1px dashed ${BORDER_COLOR}`, paddingTop: 8 }}>
                  <b style={{ color: PRIMARY_COLOR }}>💊 Resep Obat:</b>
                  <div style={{ marginTop: 5, fontSize: 14, paddingLeft: 10 }}>
                    {r.prescriptions.map((p, i) => (
                      <div key={i} style={{ marginBottom: 2 }}>
                        • {p.name} — {p.dose}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}