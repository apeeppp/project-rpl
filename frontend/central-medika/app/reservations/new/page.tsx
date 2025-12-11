"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Konstanta Warna (Sesuai dengan semua komponen sebelumnya)
const PRIMARY_COLOR = "#ff69b4"; // Hot Pink
const SECONDARY_COLOR = "#ffe4e1"; // Misty Rose (Pink Pucat)
const TEXT_DARK = "#333";
const TEXT_LIGHT = "#fff";
const BORDER_COLOR = "#ffc0cb"; // Light Pink
const SUCCESS_COLOR = "#059669"; // Hijau untuk Sukses/Aksi Utama

type User = {
  id: number;
  name: string;
};

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  slots: string[];
};

export default function NewReservationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialty, setSpecialty] = useState("");
  const [date, setDate] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [time, setTime] = useState("");
  const [complaint, setComplaint] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  // cek user login
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (!saved) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(saved));
  }, [router]);

  // load dokter dari backend
  useEffect(() => {
    // Reset selected doctor and time whenever specialty changes
    setSelectedDoctor(null);
    setTime("");
    
    const fetchDoctors = async () => {
      setLoadingDoctors(true);
      try {
        const url = new URL("http://localhost:5000/api/doctors");
        if (specialty.trim() !== "") {
          url.searchParams.set("specialty", specialty.trim());
        }
        const res = await fetch(url.toString());
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [specialty]);

  // reset time if date changes or doctor is unselected
  useEffect(() => {
    setTime("");
  }, [date]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!user || !selectedDoctor || !date || !time) {
      setMessage("Dokter, tanggal, dan waktu wajib diisi.");
      return;
    }

    setSending(true);

    try {
      const res = await fetch("http://localhost:5000/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          doctorId: selectedDoctor.id,
          date,
          time,
          complaint,
        }),
      });

      const data = await res.json();
      console.log("HASIL RESERVASI:", data);

      if (!res.ok) {
        setMessage("Gagal menyimpan reservasi. Coba ulangi.");
        setSending(false);
        return;
      }

      // kalau sukses pindah ke daftar reservasi
      router.push("/reservations/list");
    } catch (err) {
      console.error(err);
      setMessage("Terjadi error saat mengirim data.");
      setSending(false);
    }
  }

  if (!user) return null;

  // Style untuk Input Umum
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 10,
    marginBottom: 4,
    borderRadius: 10,
    border: `1px solid ${BORDER_COLOR}`,
    backgroundColor: TEXT_LIGHT,
    color: TEXT_DARK,
    fontSize: 14,
    transition: "all 0.3s ease",
  };

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
      <div style={{ maxWidth: 450, margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: `2px solid ${BORDER_COLOR}`, paddingBottom: 10 }}>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: PRIMARY_COLOR,
                margin: 0,
              }}
            >
              Buat Reservasi Baru
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


        {/* Input Spesialis & Tanggal */}
        <label style={{ fontSize: 13, fontWeight: 600 }}>Spesialis (Opsional)</label>
        <input
          placeholder="Cari Spesialisasi (cth: Dermatologi, Pediatri)"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          style={inputStyle}
        />
        <p style={{ fontSize: 12, color: TEXT_DARK, opacity: 0.7, marginBottom: 16 }}>
          Kosongkan untuk melihat semua dokter.
        </p>

        <label style={{ fontSize: 13, fontWeight: 600 }}>Pilih Tanggal</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ 
            ...inputStyle, 
            marginBottom: 20,
            // Styling khusus untuk date input
            padding: 10,
            color: date ? TEXT_DARK : '#777', // Agar placeholder/text terlihat
          }}
        />

        {/* Daftar Dokter */}
        <p style={{ marginBottom: 12, fontWeight: 600 }}>
            Dokter yang Tersedia ({doctors.length})
        </p>
        
        {loadingDoctors && (
          <p style={{ fontSize: 14, color: PRIMARY_COLOR }}>Memuat data dokter… ⏳</p>
        )}
        
        {!loadingDoctors && doctors.length === 0 && (
            <p style={{ fontSize: 14, color: TEXT_DARK, opacity: 0.7, padding: 10, border: `1px solid ${BORDER_COLOR}`, borderRadius: 10 }}>
                Tidak ada dokter yang sesuai kriteria.
            </p>
        )}

        {!loadingDoctors &&
          doctors.map((doc) => (
            <div
              key={doc.id}
              onClick={() => {
                setSelectedDoctor(doc);
                setTime("");
              }}
              style={{
                padding: 12,
                borderRadius: 15,
                border: selectedDoctor?.id === doc.id
                    ? `2px solid ${PRIMARY_COLOR}` // Border saat terpilih: Hot Pink
                    : `1px solid ${BORDER_COLOR}`,
                marginBottom: 10,
                cursor: "pointer",
                backgroundColor: selectedDoctor?.id === doc.id ? SECONDARY_COLOR : TEXT_LIGHT,
                color: TEXT_DARK,
                transition: "all 0.3s ease",
                boxShadow: selectedDoctor?.id === doc.id ? `0 4px 8px rgba(255, 105, 180, 0.2)` : 'none',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, color: PRIMARY_COLOR }}>
                {doc.name}
              </div>
              <div style={{ fontSize: 13, color: TEXT_DARK, opacity: 0.8 }}>{doc.specialty}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: TEXT_DARK, fontWeight: 500 }}>
                Waktu Tersedia: 
                <span style={{ display: 'block', marginTop: 4, opacity: 0.8 }}>
                    {doc.slots.length > 0 ? doc.slots.join(" | ") : "Tidak ada slot tersedia."}
                </span>
              </div>
            </div>
          ))}

        {/* Form Konfirmasi dan Keluhan */}
        {selectedDoctor && (
          <form onSubmit={handleSubmit} style={{ marginTop: 30, padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 15, border: `1px solid ${BORDER_COLOR}` }}>
            <h3 style={{ marginBottom: 15, color: PRIMARY_COLOR, fontSize: 20, fontWeight: 700, borderBottom: `1px dashed ${BORDER_COLOR}`, paddingBottom: 8 }}>
              Konfirmasi & Keluhan
            </h3>

            {/* Rincian Konfirmasi */}
            <div style={{ marginBottom: 15 }}>
              <div style={{ marginBottom: 8, fontSize: 14 }}>
                <div style={{ fontWeight: 600 }}>Dokter: </div>
                <div style={{ fontWeight: "bold", color: TEXT_DARK }}>{selectedDoctor.name}</div>
                <div style={{ fontSize: 12, color: TEXT_DARK, opacity: 0.7 }}>
                  {selectedDoctor.specialty}
                </div>
              </div>

              <div style={{ marginBottom: 8, fontSize: 14 }}>
                <div style={{ fontWeight: 600 }}>Tanggal: </div>
                <div>{date || "-"}</div>
              </div>

              <div style={{ marginBottom: 8, fontSize: 14 }}>
                <div style={{ fontWeight: 600 }}>Pilih Waktu Konsultasi: </div>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: 'auto',
                    marginTop: 4,
                    color: TEXT_DARK, // Pastikan teks terlihat
                    backgroundColor: BORDER_COLOR, // Background pink untuk dropdown
                  }}
                >
                  <option value="">Pilih waktu</option>
                  {selectedDoctor.slots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} WIB
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Keluhan */}
            <h3 style={{ marginTop: 16, marginBottom: 8, fontSize: 16, fontWeight: 600 }}>Keluhan Anda (Opsional)</h3>

            <textarea
              placeholder="Masukkan Keluhan Singkat Anda"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              style={{
                ...inputStyle,
                minHeight: 80,
                resize: 'vertical',
                marginBottom: 4,
              }}
            />
            <p style={{ fontSize: 12, color: TEXT_DARK, opacity: 0.7, marginBottom: 20 }}>
              Berikan penjelasan singkat tentang kekhawatiran Anda (maks 255 karakter).
            </p>

            {message && (
              <p style={{ fontSize: 14, color: PRIMARY_COLOR, fontWeight: 600, marginBottom: 12 }}>
                {message}
              </p>
            )}

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={sending}
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 25,
                border: "none",
                backgroundColor: PRIMARY_COLOR,
                color: TEXT_LIGHT,
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 16,
                transition: "all 0.3s ease",
                boxShadow: `0 4px 6px rgba(255, 105, 180, 0.4)`,
                opacity: sending || !time || !date ? 0.7 : 1, // Opacity jika disabled
              }}
            >
              {sending ? "Mengirim..." : "KONFIRMASI & KIRIM RESERVASI"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}