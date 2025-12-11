"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Konstanta Warna (Sesuai dengan Dashboard Dokter)
const PRIMARY_COLOR = "#ff69b4"; // Hot Pink
const SECONDARY_COLOR = "#ffe4e1"; // Misty Rose (Pink Pucat)
const TEXT_DARK = "#333"; // Warna Teks Hitam
const TEXT_LIGHT = "#fff"; // Warna Background Input
const BORDER_COLOR = "#ffc0cb"; // Light Pink
const CARD_BG = "rgba(255, 255, 255, 0.9)"; // Background form semi-transparan putih

type PrescriptionInput = {
  name: string;
  dose: string;
};

export default function NewRecordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reservationId = searchParams.get("reservationId");
  const patientName = searchParams.get("patientName");

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [prescriptions, setPrescriptions] = useState<PrescriptionInput[]>([
    { name: "", dose: "" },
  ]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("doctor");
    if (!saved) {
      router.push("/doctor-login");
      return;
    }
  }, [router]);

  const handleChangePrescription = (
    index: number,
    field: "name" | "dose",
    value: string
  ) => {
    setPrescriptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addRow = () => {
    setPrescriptions((prev) => [...prev, { name: "", dose: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reservationId) {
      setError("Reservation ID tidak ditemukan");
      return;
    }

    try {
      setSaving(true);

      const cleanedPresc = prescriptions.filter(
        (p) => p.name.trim() !== "" && p.dose.trim() !== ""
      );

      const res = await fetch("http://localhost:5000/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: Number(reservationId),
          diagnosis,
          notes,
          prescriptions: cleanedPresc,
        }),
      });

      if (!res.ok) {
        setError("Gagal menyimpan rekam medis");
        return;
      }

      // setelah berhasil, kembali ke dashboard dokter
      router.push("/doctor/dashboard");
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan rekam medis");
    } finally {
      setSaving(false);
    }
  };

  // Style untuk Input/Textarea
  const inputStyle: React.CSSProperties = {
    padding: 10,
    borderRadius: 10,
    border: `1px solid ${BORDER_COLOR}`,
    backgroundColor: TEXT_LIGHT,
    color: TEXT_DARK,
    fontSize: 14,
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    resize: "none", // Agar textarea tidak bisa di-resize
  };

  // Style untuk Input Resep
  const prescriptionInputStyle: React.CSSProperties = {
    padding: 8,
    borderRadius: 8,
    border: `1px solid ${BORDER_COLOR}`,
    backgroundColor: TEXT_LIGHT,
    color: TEXT_DARK,
    fontSize: 13,
    transition: "border-color 0.3s ease",
  };

  if (!reservationId) {
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
        <p style={{ color: PRIMARY_COLOR, fontWeight: 600 }}>Reservation ID tidak ditemukan. ❌</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${SECONDARY_COLOR} 0%, #ffffff 80%)`,
        color: TEXT_DARK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 380,
          backgroundColor: CARD_BG,
          padding: 24,
          borderRadius: 15,
          display: "flex",
          flexDirection: "column",
          gap: 15,
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 4, color: PRIMARY_COLOR, fontSize: 22, fontWeight: 700 }}>
          Isi Rekam Medis
        </h3>
        <p style={{ fontSize: 13, margin: 0, marginBottom: 8, borderBottom: `1px dashed ${BORDER_COLOR}`, paddingBottom: 8, color: TEXT_DARK }}>
          Pasien: {patientName || "-"} • Reservasi #{reservationId}
        </p>

        {/* Diagnosa */}
        <label style={{ fontSize: 13, fontWeight: 600 }}>Diagnosa</label>
        <textarea
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          style={{ ...inputStyle, minHeight: 80 }}
        />

        {/* Catatan Dokter */}
        <label style={{ fontSize: 13, fontWeight: 600 }}>Catatan Dokter</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...inputStyle, minHeight: 80 }}
        />

        {/* Resep Obat */}
        <label style={{ fontSize: 13, fontWeight: 600 }}>Resep Obat</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {prescriptions.map((p, idx) => (
            <div
              key={idx}
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <input
                placeholder="Nama obat"
                value={p.name}
                onChange={(e) =>
                  handleChangePrescription(idx, "name", e.target.value)
                }
                style={{ ...prescriptionInputStyle, flex: 1 }}
              />
              <input
                placeholder="Dosis"
                value={p.dose}
                onChange={(e) =>
                  handleChangePrescription(idx, "dose", e.target.value)
                }
                style={{ ...prescriptionInputStyle, width: 90 }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            style={{
              marginTop: 4,
              padding: 8,
              borderRadius: 10,
              border: `1px solid ${PRIMARY_COLOR}`,
              backgroundColor: TEXT_LIGHT,
              color: PRIMARY_COLOR,
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
          >
            + Tambah Baris Obat
          </button>
        </div>

        {error && (
          <p style={{ color: PRIMARY_COLOR, fontSize: 13, marginTop: 4, fontWeight: 500 }}>
             {error}
          </p>
        )}

        {/* Tombol Aksi (Batal & Simpan) */}
        <div
          style={{
            marginTop: 15,
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: 10,
              borderRadius: 10,
              border: `1px solid ${BORDER_COLOR}`,
              backgroundColor: TEXT_LIGHT,
              color: TEXT_DARK,
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.3s ease",
            }}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "none",
              backgroundColor: PRIMARY_COLOR, // Tombol utama: Hot Pink
              color: TEXT_LIGHT,
              fontSize: 14,
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.3s ease",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Menyimpan..." : "Simpan Rekam Medis"}
          </button>
        </div>
      </form>
    </div>
  );
}