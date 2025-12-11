const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const app = express();
app.use(cors());
app.use(express.json());

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    console.log('BODY LOGIN:', req.body);

    const { username, password } = req.body;

    const result = await pool.query(
      'SELECT id, name, password FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const user = result.rows[0];
    const stored = user.password;

    const isHashed = typeof stored === 'string' && stored.startsWith('$2');

    let match = false;
    if (isHashed) {
      match = await bcrypt.compare(password, stored);
    } else {
      match = password === stored;
    }

    if (!match) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    res.json({ id: user.id, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN ADMIN
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('BODY LOGIN ADMIN:', req.body);
    const result = await pool.query(
      'SELECT id, name, password FROM admin_users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const row = result.rows[0];
    const stored = row.password;
    const isHashed = typeof stored === 'string' && stored.startsWith('$2');
    let match = false;
    if (isHashed) {
      match = await bcrypt.compare(password, stored);
    } else {
      match = password === stored;
    }

    if (!match) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    res.json({
      id: row.id,
      name: row.name,
      role: 'admin',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN DOKTER
app.post('/api/doctor/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // fetch doctor user with stored password
    const result = await pool.query(
      `
      SELECT du.id, du.password, d.id AS doctor_id, d.name, d.specialty
      FROM doctor_users du
      JOIN doctors d ON d.id = du.doctor_id
      WHERE du.username = $1
      `,
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }
    const row = result.rows[0];
    const stored = row.password;
    const isHashed = typeof stored === 'string' && stored.startsWith('$2');
    let match = false;
    if (isHashed) {
      match = await bcrypt.compare(password, stored);
    } else {
      match = password === stored;
    }

    if (!match) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    res.json({
      id: row.id,
      doctorId: row.doctor_id,
      name: row.name,
      specialty: row.specialty,
      role: 'doctor',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LIST DOKTER
app.get('/api/doctors', async (req, res) => {
  try {
    const { specialty } = req.query;
    let query = `
      SELECT d.id, d.name, d.specialty,
             COALESCE(
               array_agg(ds.time_label ORDER BY ds.time_label)
               FILTER (WHERE ds.id IS NOT NULL),
               '{}'
             ) AS slots
      FROM doctors d
      LEFT JOIN doctor_slots ds ON ds.doctor_id = d.id
    `;
    const values = [];
    if (specialty) {
      query += ' WHERE LOWER(d.specialty) LIKE LOWER($1)';
      values.push('%' + specialty + '%');
    }
    query += ' GROUP BY d.id ORDER BY d.id';

    const result = await pool.query(query, values);
    res.json(
      result.rows.map(row => ({
        id: row.id,
        name: row.name,
        specialty: row.specialty,
        slots: row.slots,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// BUAT RESERVASI
app.post('/api/reservations', async (req, res) => {
  try {
    const { userId, doctorId, date, time, complaint } = req.body;
    const result = await pool.query(
      `INSERT INTO reservations (user_id, doctor_id, date, time, complaint, status)
       VALUES ($1, $2, $3, $4, $5, 'Aktif')
       RETURNING *`,
      [userId, doctorId, date, time, complaint]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// BUAT RESERVASI BARU
app.post('/api/reservations/new', async (req, res) => {
  try {
    const { userId, doctorId, date, time, complaint } = req.body;

    const result = await pool.query(
      `INSERT INTO reservations (user_id, doctor_id, date, time, complaint, status)
       VALUES ($1, $2, $3, $4, $5, 'Aktif')
       RETURNING *`,
      [userId, doctorId, date, time, complaint]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DAFTAR RESERVASI USER
app.get('/api/reservations', async (req, res) => {
  try {
    const { userId, status } = req.query;
    let query = `
      SELECT r.id,
             r.date,
             r.time,
             r.status,
             r.complaint,
             d.name AS doctor_name,
             d.specialty
      FROM reservations r
      JOIN doctors d ON d.id = r.doctor_id
      WHERE r.user_id = $1
    `;
    const values = [userId];
    if (status) {
      query += ' AND r.status = $2';
      values.push(status);
    }
    query += ' ORDER BY r.date, r.time';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// REKAM MEDIS
app.get('/api/records', async (req, res) => {
  try {
    const { userId } = req.query;

    const result = await pool.query(
      `
      SELECT
        mr.id,
        mr.date,
        mr.time,
        mr.diagnosis,
        mr.notes,
        d.name AS doctor_name,
        d.specialty,
        COALESCE(
          json_agg(
            json_build_object(
              'name', p.name,
              'dose', p.dose
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) AS prescriptions
      FROM medical_records mr
      JOIN doctors d ON d.id = mr.doctor_id
      LEFT JOIN prescriptions p ON p.record_id = mr.id
      WHERE mr.user_id = $1
      GROUP BY mr.id, d.name, d.specialty
      ORDER BY mr.date DESC, mr.time DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// SIMPAN REKAM MEDIS (dokter isi rekam medis + resep)
// body: { reservationId, diagnosis, notes, prescriptions: [{ name, dose }] }
app.post('/api/records', async (req, res) => {
  const { reservationId, diagnosis, notes, prescriptions } = req.body;

  console.log('POST /api/records BODY:', req.body);

  if (!reservationId || !diagnosis) {
    return res.status(400).json({ message: 'reservationId dan diagnosis wajib diisi' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // bikin 1 baris rekam medis berdasar data di tabel reservations
    const recResult = await client.query(
      `
      INSERT INTO medical_records (user_id, doctor_id, date, time, diagnosis, notes)
      SELECT r.user_id, r.doctor_id, r.date, r.time, $2, $3
      FROM reservations r
      WHERE r.id = $1
      RETURNING id
      `,
      [reservationId, diagnosis, notes || '']
    );

    if (recResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
    }

    const recordId = recResult.rows[0].id;

    // kalau ada resep obat, insert ke tabel prescriptions
    if (Array.isArray(prescriptions) && prescriptions.length > 0) {
      const values = [];
      const params = [];

      prescriptions.forEach((p, idx) => {
        if (!p.name || !p.dose) return; // skip yang kosong

        const base = idx * 3;
        values.push(`($${base + 1}, $${base + 2}, $${base + 3})`);
        params.push(recordId, p.name, p.dose);
      });

      if (values.length > 0) {
        await client.query(
          `INSERT INTO prescriptions (record_id, name, dose) VALUES ${values.join(', ')}`,
          params
        );
      }
    }

    // sekalian tandai reservasi ini Selesai
    await client.query(
      `UPDATE reservations SET status = 'Selesai' WHERE id = $1`,
      [reservationId]
    );

    await client.query('COMMIT');

    res.json({ success: true, recordId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERROR SAVE RECORD:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});


// DOKTER ISI REKAM MEDIS BERDASARKAN RESERVASI
app.post('/api/records', async (req, res) => {
  const client = await pool.connect();

  try {
    const { reservationId, diagnosis, notes, prescriptions } = req.body;

    if (!reservationId) {
      return res.status(400).json({ message: 'reservationId wajib diisi' });
    }

    await client.query('BEGIN');

    // ambil data reservasi untuk dapat user_id, doctor_id, tanggal, jam
    const resv = await client.query(
      `
      SELECT id, user_id, doctor_id, date, time
      FROM reservations
      WHERE id = $1
      `,
      [reservationId]
    );

    if (resv.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
    }

    const r = resv.rows[0];

    // insert ke medical_records
    const mr = await client.query(
      `
      INSERT INTO medical_records (user_id, doctor_id, date, time, diagnosis, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [r.user_id, r.doctor_id, r.date, r.time, diagnosis || '', notes || '']
    );

    const recordId = mr.rows[0].id;

    // insert resep obat (kalau ada)
    if (Array.isArray(prescriptions)) {
      for (const p of prescriptions) {
        if (!p || !p.name || !p.dose) continue;
        await client.query(
          `
          INSERT INTO prescriptions (record_id, name, dose)
          VALUES ($1, $2, $3)
          `,
          [recordId, p.name, p.dose]
        );
      }
    }

    // otomatis set status reservasi jadi Selesai
    await client.query(
      `UPDATE reservations SET status = 'Selesai' WHERE id = $1`,
      [reservationId]
    );

    await client.query('COMMIT');

    res.json({ id: recordId, message: 'Rekam medis tersimpan' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});


// UPDATE STATUS RESERVASI
app.patch('/api/reservations/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DAFTAR RESERVASI USER
app.get('/api/reservations', async (req, res) => {
  try {
    const { userId, status } = req.query;
    let query = `
      SELECT r.id,
             r.date,
             r.time,
             r.status,
             r.complaint,
             d.name AS doctor_name,
             d.specialty
      FROM reservations r
      JOIN doctors d ON d.id = r.doctor_id
      WHERE r.user_id = $1
    `;
    const values = [userId];
    if (status) {
      query += ' AND r.status = $2';
      values.push(status);
    }
    query += ' ORDER BY r.date, r.time';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DAFTAR SEMUA RESERVASI UNTUK ADMIN
app.get('/api/admin/reservations', async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT
        r.id,
        r.date,
        r.time,
        r.status,
        r.complaint,
        u.name AS patient_name,
        d.name AS doctor_name,
        d.specialty
      FROM reservations r
      JOIN users u ON u.id = r.user_id
      JOIN doctors d ON d.id = r.doctor_id
    `;

    const values = [];

    if (status) {
      query += ' WHERE r.status = $1';
      values.push(status);
    }

    query += ' ORDER BY r.date DESC, r.time DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DAFTAR RESERVASI UNTUK DOKTER TERTENTU
app.get('/api/doctor/reservations', async (req, res) => {
  try {
    const { doctorId, status } = req.query;

    let query = `
      SELECT
        r.id,
        r.date,
        r.time,
        r.status,
        r.complaint,
        u.name AS patient_name,
        d.name AS doctor_name,
        d.specialty
      FROM reservations r
      JOIN users u ON u.id = r.user_id
      JOIN doctors d ON d.id = r.doctor_id
      WHERE r.doctor_id = $1
    `;

    const values = [doctorId];

    if (status) {
      query += ' AND r.status = $2';
      values.push(status);
    }

    query += ' ORDER BY r.date DESC, r.time DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// UBAH STATUS RESERVASI (Aktif / Selesai / Batal / Tidak Hadir dll)
app.post('/api/reservations/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // contoh: 'Selesai'
    const { id } = req.params;

    const allowed = ['Aktif', 'Selesai', 'Batal', 'Tidak Hadir'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const result = await pool.query(
      'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DAFTAR RESERVASI USER
app.get('/api/reservations', async (req, res) => {
  try {
    const { userId, status } = req.query;
    let query = `
      SELECT r.id,
             r.date,
             r.time,
             r.status,
             r.complaint,
             d.name AS doctor_name,
             d.specialty
      FROM reservations r
      JOIN doctors d ON d.id = r.doctor_id
      WHERE r.user_id = $1
    `;
    const values = [userId];
    if (status) {
      query += ' AND r.status = $2';
      values.push(status);
    }
    query += ' ORDER BY r.date, r.time';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// HAPUS RESERVASI
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await pool.query(
      'DELETE FROM reservations WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Reservasi tidak ditemukan' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log('Server jalan di port ' + PORT);
});

// register user (pasien)
app.post("/api/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ message: "name, username, dan password wajib" });
    }

    // cek username/email unik
    const checkQ = await pool.query(
      "SELECT id FROM users WHERE username = $1 OR (email IS NOT NULL AND email = $2)",
      [username, email || null]
    );
    if (checkQ.rows.length > 0) {
      return res.status(409).json({ message: "Username atau email sudah terpakai" });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const insertQ = await pool.query(
      `INSERT INTO users (name, username, email, password)
       VALUES ($1, $2, $3, $4) RETURNING id, name, username`,
      [name, username, email || null, hashed]
    );

    const user = insertQ.rows[0];
    res.status(201).json({ id: user.id, name: user.name, username: user.username });
  } catch (err) {
    console.error("REGISTER ERR", err);
    res.status(500).json({ message: "Server error" });
  }
});