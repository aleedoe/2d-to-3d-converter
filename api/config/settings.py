"""
Application configuration and constants.
Optimized for NVIDIA RTX 4050 GPU (~6GB VRAM).
"""

import os
import torch

# ─── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = BASE_DIR  # model.fp16.safetensors lives in api/
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ─── Model Settings ─────────────────────────────────────────────────────────────
MODEL_SUBFOLDER = "hunyuan3d-dit-v2-mini"
MODEL_REPO = "tencent/Hunyuan3D-2mini"

# ─── Quality Presets (Low / Mid / High) ──────────────────────────────────────────
# Each preset controls both AI generation density and post-processing decimation.
QUALITY_PRESETS = {
    "low": {
        "inference_steps": 20,
        "octree_resolution": 192,
        "target_faces": 2_000,
    },
    "mid": {
        "inference_steps": 25,
        "octree_resolution": 256,
        "target_faces": 5_000,
    },
    "high": {
        "inference_steps": 35,
        "octree_resolution": 380,
        "target_faces": 15_000,
    },
}
DEFAULT_QUALITY = "mid"

# ─── Shared Inference Constants (tuned for RTX 4050) ─────────────────────────────
NUM_CHUNKS = 20000  # chunked processing keeps VRAM under control
SEED = 12345

# ─── Mesh Optimization ──────────────────────────────────────────────────────────
ENABLE_MESH_OPTIMIZATION = True

# ─── CUDA / Hardware ────────────────────────────────────────────────────────────
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
DTYPE = torch.float16 if DEVICE == "cuda" else torch.float32

# ─── Flask ───────────────────────────────────────────────────────────────────────
FLASK_HOST = "0.0.0.0"
FLASK_PORT = 5000
FLASK_DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"

MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB upload limit
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
