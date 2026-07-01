from flask import Blueprint, request, jsonify
import requests
import logging
from config import Config
from model import Database  # Mengambil koneksi database terpusat

logger = logging.getLogger(__name__)

# Daftarkan blueprint tanpa url_prefix di sini karena sudah diatur di app.py
utama_bp = Blueprint('utama', __name__)

# ==========================================
# 🆕 AMBIL DATA GABUNGAN UNTUK LANDING PAGE (SINKRON DATA ADMIN)
# ==========================================
@utama_bp.route('/utama', methods=['GET'])
def get_utama_data():
    """Mengambil seluruh data portofolio dari TiDB Cloud untuk halaman utama"""
    try:
        db = Database()
        
        # 1. Ambil data skills dari database
        query_skills = "SELECT nama_skill, icon_class FROM skills ORDER BY id DESC"
        skills = db.execute_query(query_skills, fetch=True)
        
        # 2. Ambil data projects (Sesuaikan nama kolom ERD Baru: judul, deskripsi, gambar_url, link_project)
        query_projects = "SELECT judul, deskripsi, gambar_url, link_project FROM projects ORDER BY id DESC"
        projects = db.execute_query(query_projects, fetch=True)
        
        # 3. Ambil data experience (Sesuaikan nama kolom ERD Baru: posisi, perusahaan, durasi, deskripsi)
        query_experience = "SELECT posisi, perusahaan, durasi, deskripsi FROM experiences ORDER BY id DESC"
        experience = db.execute_query(query_experience, fetch=True)

        # 4. Ambil data profil terbaru untuk halaman utama
        query_profile = "SELECT nama_lengkap, nama_panggilan, tempat_lahir, tanggal_lahir, email, telepon, universitas, fakultas, prodi, semester, alamat, foto_url FROM profiles WHERE user_id = %s"
        profile = db.execute_query(query_profile, (1,), fetch=True)
        profile_data = profile[0] if profile else {}
        
        # Bungkus data menjadi satu object agar bisa langsung dibaca script.js
        return jsonify({
            "success": True,
            "data": {
                "skills": skills if skills else [],
                "projects": projects if projects else [],
                "experience": experience if experience else [],
                "profile": profile_data
            }
        }), 200

    except Exception as e:
        logger.error(f"[SERVER ERROR] Gagal mengambil data utama: {str(e)}")
        return jsonify({"success": False, "error": "Gagal memuat data dari database"}), 500


# ==========================================
# ROUTING LAMA: KIRIM PESAN KE EMAIL (RESEND)
# ==========================================
@utama_bp.route('/kirim-pesan', methods=['POST'])
def kirim_pesan():
    try:
        # 1. FIX: Ambil bahasa Indonesia ATAU bahasa Inggris agar tidak Miss dengan HTML/JS
        nama = request.form.get('nama') or request.form.get('name')
        email_pengunjung = request.form.get('email')
        pesan = request.form.get('pesan') or request.form.get('message') or request.form.get('msg')
        
        # 2. Alternatif jika sewaktu-waktu frontend mengirim format JSON
        if request.is_json:
            data = request.get_json()
            nama = data.get('nama') or data.get('name') or nama
            email_pengunjung = data.get('email') or email_pengunjung
            pesan = data.get('pesan') or data.get('message') or pesan

        # Validasi input
        if not nama or not email_pengunjung or not pesan:
            return jsonify({"status": "error", "message": "Semua form wajib diisi!"}), 400
            
        api_key = Config.RESEND_API_KEY
        email_tujuan = getattr(Config, 'ADMIN_EMAIL', 'velmakhoirunnissa122@gmail.com')
        
        # Cek apakah API Key terbaca dari .env
        if not api_key or api_key == "None":
            logger.error("[RESEND ERROR] API Key Resend kosong atau tidak terbaca dari .env")
            return jsonify({"status": "error", "message": "Konfigurasi API Key Server belum siap."}), 500

        # 3. Setup Header & Payload untuk Resend API resmi
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": "onboarding@resend.dev", 
            "to": email_tujuan,
            "subject": f"Pesan Portofolio Baru: {nama}",
            "html": f"""
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #dfd5c6; border-radius: 4px; background: #f8f5f0;">
                    <h2 style="color: #2c2523; font-family: Georgia, serif;">Halo Velma, ada pesan kolaborasi!</h2>
                    <p><strong>Nama Pengirim:</strong> {nama}</p>
                    <p><strong>Email Pengirim:</strong> <a href="mailto:{email_pengunjung}">{email_pengunjung}</a></p>
                    <hr style="border: 0; border-top: 1px dashed #dfd5c6; margin: 20px 0;" />
                    <p><strong>Isi Pesan:</strong></p>
                    <div style="background: #fff; padding: 15px; border-radius: 4px; border: 1px solid #dfd5c6; white-space: pre-wrap;">{pesan}</div>
                </div>
            """
        }
        
        # 4. Tembak langsung ke API Resend
        response = requests.post("https://api.resend.com/emails", json=payload, headers=headers)
        
        if response.status_code in [200, 201]:
            logger.info(f"[RESEND SUCCESS] Email dari {nama} berhasil dikirim.")
            return jsonify({"status": "success", "message": "Pesan sukses terkirim!"}), 200
        else:
            logger.error(f"[RESEND ERROR] Status: {response.status_code} | Response: {response.text}")
            return jsonify({"status": "error", "message": f"Gagal mengirim via Resend: {response.text}"}), 500

    except Exception as e:
        logger.error(f"[SERVER ERROR] Kendala internal: {str(e)}")
        return jsonify({"status": "error", "message": "Terjadi kesalahan pada server."}), 500