import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
from config import Config
from Backend.admin.login import token_required

upload_bp = Blueprint('upload', __name__)


def _configure_cloudinary():
    load_dotenv(override=True)
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME') or Config.CLOUDINARY_CLOUD_NAME
    api_key = os.getenv('CLOUDINARY_API_KEY') or Config.CLOUDINARY_API_KEY
    api_secret = os.getenv('CLOUDINARY_API_SECRET') or Config.CLOUDINARY_API_SECRET
    cloudinary_url = os.getenv('CLOUDINARY_URL') or Config.CLOUDINARY_URL

    if cloudinary_url:
        cloudinary.config(cloudinary_url=cloudinary_url, secure=True)
        return

    if cloud_name or api_key or api_secret:
        cloudinary.config(
            cloud_name=cloud_name or None,
            api_key=api_key or None,
            api_secret=api_secret or None,
            secure=True
        )


_configure_cloudinary()


@upload_bp.route('/upload/image', methods=['POST'])
@token_required
def upload_image(current_user):
    image_url = request.form.get('image_url') or request.form.get('url')
    if image_url:
        return jsonify({
            'success': True,
            'url': image_url,
            'public_id': None,
            'source': 'direct-url'
        }), 200

    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file atau URL gambar yang diterima'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'Nama file tidak boleh kosong'}), 400

    _configure_cloudinary()
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME') or Config.CLOUDINARY_CLOUD_NAME
    api_key = os.getenv('CLOUDINARY_API_KEY') or Config.CLOUDINARY_API_KEY
    api_secret = os.getenv('CLOUDINARY_API_SECRET') or Config.CLOUDINARY_API_SECRET
    cloudinary_url = os.getenv('CLOUDINARY_URL') or Config.CLOUDINARY_URL

    if not (cloud_name and api_key and api_secret) and not cloudinary_url:
        return jsonify({
            'error': 'Cloudinary belum dikonfigurasi. Tambahkan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET atau CLOUDINARY_URL ke file .env.'
        }), 500

    try:
        file.stream.seek(0)
        result = cloudinary.uploader.upload(
            file.stream,
            folder='portfolio/projects',
            resource_type='image',
            use_filename=True,
            unique_filename=False,
            overwrite=False
        )

        return jsonify({
            'success': True,
            'url': result['secure_url'],
            'public_id': result['public_id'],
            'source': 'cloudinary-upload'
        }), 200

    except Exception as e:
        return jsonify({'error': f'Upload gagal: {str(e)}'}), 500