"""
API routes for 3D model generation.
"""

import os
import logging

from flask import Blueprint, request, jsonify, send_file

from config.settings import ALLOWED_EXTENSIONS
from services.model_inference import ModelInferenceService

logger = logging.getLogger(__name__)

generate_bp = Blueprint("generate", __name__)


def _allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@generate_bp.route("/api/generate-3d", methods=["POST"])
def generate_3d():
    """
    POST /api/generate-3d

    Accepts a multipart form with an `image` field.
    Returns the generated .glb 3D model file.
    """
    # ── Validation ──────────────────────────────────────────────────────────
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Send a file with key 'image'."}), 400

    file = request.files["image"]

    if file.filename == "" or file.filename is None:
        return jsonify({"error": "Empty filename."}), 400

    if not _allowed_file(file.filename):
        return jsonify({
            "error": f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        }), 400

    # ── Inference ───────────────────────────────────────────────────────────
    try:
        image_bytes = file.read()
        service = ModelInferenceService.get_instance()
        output_path = service.generate_3d(image_bytes)

        if not os.path.exists(output_path):
            return jsonify({"error": "Model generation failed — output file not found."}), 500

        return send_file(
            output_path,
            mimetype="model/gltf-binary",
            as_attachment=True,
            download_name="model.glb",
        )

    except Exception as e:
        logger.exception("Generation failed")
        return jsonify({"error": f"Generation failed: {str(e)}"}), 500
