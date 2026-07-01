import os
import certifi
from dotenv import load_dotenv

load_dotenv(override=True)

class Config:
    # 1. Konfigurasi TiDB Database
    DB_HOST = os.getenv('TIDB_HOST')
    DB_PORT = int(os.getenv('TIDB_PORT', 4000))
    DB_USER = os.getenv('TIDB_USER')
    DB_PASSWORD = os.getenv('TIDB_PASSWORD')
    DB_DATABASE = os.getenv('TIDB_DATABASE')
    
    MYSQL_CONFIG = {
        'host': DB_HOST,
        'port': DB_PORT,
        'user': DB_USER,
        'password': DB_PASSWORD,
        'database': DB_DATABASE,
        'ssl_ca': certifi.where() 
    }
    
    # 2. Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'velma-rahasia-portofolio-2026')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # 3. Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
    CLOUDINARY_URL = os.getenv('CLOUDINARY_URL')
    
    # 4. Resend API Configuration
    RESEND_API_KEY = os.getenv('RESEND_API_KEY')
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'velmakhoirunnissa122@gmail.com')