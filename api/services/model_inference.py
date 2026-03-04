"""
Model inference service for Hunyuan3D-2mini.
Handles pipeline loading, GPU optimization, and 3D generation.
Includes automatic low-poly mesh optimization for game engines.
"""

import io
import os
import uuid
import logging

import torch
import trimesh
from PIL import Image

from config.settings import (
    MODEL_REPO,
    MODEL_SUBFOLDER,
    OUTPUT_DIR,
    DEVICE,
    NUM_CHUNKS,
    SEED,
)
from services.mesh_optimizer import MeshOptimizer

logger = logging.getLogger(__name__)


class ModelInferenceService:
    """Singleton-style service that keeps the pipeline warm in GPU memory."""

    _instance = None
    _pipeline = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        if ModelInferenceService._pipeline is None:
            self._load_pipeline()

    # ── pipeline bootstrap ──────────────────────────────────────────────────
    def _load_pipeline(self):
        """Load Hunyuan3D-DiT pipeline with fp16 + CUDA optimisations."""
        logger.info("Loading Hunyuan3D-2mini pipeline on %s …", DEVICE)

        try:
            from hy3dgen.shapegen import Hunyuan3DDiTFlowMatchingPipeline

            pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
                MODEL_REPO,
                subfolder=MODEL_SUBFOLDER,
                use_safetensors=True,
                device=DEVICE,
            )

            # RTX 4050 optimisations
            if DEVICE == "cuda":
                try:
                    pipeline.enable_flashattn()
                    logger.info("Flash Attention enabled")
                except Exception:
                    logger.warning("Flash Attention not available, continuing without it")

            ModelInferenceService._pipeline = pipeline
            logger.info("Pipeline loaded successfully")

        except ImportError:
            logger.warning(
                "hy3dgen is not installed. Using MOCK inference mode. "
                "Install with: pip install git+https://github.com/Tencent/Hunyuan3D-2.git"
            )
            ModelInferenceService._pipeline = None

    # ── public API ──────────────────────────────────────────────────────────
    def generate_3d(self, image_bytes: bytes, quality_preset: dict) -> str:
        """
        Convert a 2D image to a 3D GLB model using the given quality preset.

        Pipeline:
        1. Run Hunyuan3D-2mini inference with preset-specific parameters
        2. Apply quadric decimation + mesh cleanup for game-ready output
        3. Export optimized mesh as .glb

        Args:
            image_bytes:     Raw bytes of the uploaded image.
            quality_preset:  Dict with keys: inference_steps, octree_resolution, target_faces.

        Returns:
            Absolute path to the generated .glb file.
        """
        inference_steps = quality_preset["inference_steps"]
        octree_resolution = quality_preset["octree_resolution"]
        target_faces = quality_preset["target_faces"]

        image = Image.open(io.BytesIO(image_bytes)).convert("RGBA")

        output_filename = f"{uuid.uuid4().hex}.glb"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        if ModelInferenceService._pipeline is None:
            # ── MOCK: generate a simple placeholder cube ────────────────
            logger.info("Mock mode — generating placeholder cube")
            mesh = trimesh.creation.box(extents=[1.0, 1.0, 1.0])
            mesh.export(output_path, file_type="glb")
            return output_path

        # ── Real inference ──────────────────────────────────────────────
        logger.info(
            "Running inference (%d steps, octree %d, target %d faces) …",
            inference_steps,
            octree_resolution,
            target_faces,
        )

        with torch.inference_mode():
            mesh = ModelInferenceService._pipeline(
                image=image,
                num_inference_steps=inference_steps,
                octree_resolution=octree_resolution,
                num_chunks=NUM_CHUNKS,
                generator=torch.manual_seed(SEED),
                output_type="trimesh",
            )[0]

        # ── Low-poly optimization (runs on CPU, no VRAM needed) ─────────
        logger.info("Optimizing mesh for game-engine use …")
        optimizer = MeshOptimizer(target_faces=target_faces)
        mesh = optimizer.optimize(mesh)

        # Export to GLB
        if isinstance(mesh, trimesh.Scene):
            mesh.export(output_path, file_type="glb")
        else:
            scene = trimesh.Scene(mesh)
            scene.export(output_path, file_type="glb")

        # Free VRAM after inference
        if DEVICE == "cuda":
            torch.cuda.empty_cache()

        logger.info("3D model saved → %s", output_path)
        return output_path
