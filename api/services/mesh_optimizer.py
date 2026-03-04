"""
Post-processing mesh optimizer for low-poly game-ready output.

Applies Quadric Edge Collapse Decimation (via fast-simplification) to
drastically reduce polygon count while preserving silhouette and color.
"""

import logging

import trimesh
import numpy as np

from config.settings import ENABLE_MESH_OPTIMIZATION

logger = logging.getLogger(__name__)


class MeshOptimizer:
    """Decimates and cleans meshes for game-engine use (Roblox, Unity, etc.)."""

    def __init__(self, target_faces: int):
        self.target_faces = target_faces

    # ── public API ──────────────────────────────────────────────────────────
    def optimize(self, mesh_or_scene):
        """
        Optimize a trimesh object for game-engine performance.

        Accepts either a trimesh.Trimesh or trimesh.Scene.
        Returns the same type, with all geometry decimated and cleaned.
        """
        if not ENABLE_MESH_OPTIMIZATION:
            logger.info("Mesh optimization is DISABLED — skipping")
            return mesh_or_scene

        if isinstance(mesh_or_scene, trimesh.Scene):
            return self._optimize_scene(mesh_or_scene)
        elif isinstance(mesh_or_scene, trimesh.Trimesh):
            return self._optimize_mesh(mesh_or_scene)
        else:
            logger.warning(
                "Unknown mesh type %s — returning as-is",
                type(mesh_or_scene).__name__,
            )
            return mesh_or_scene

    # ── scene handler ───────────────────────────────────────────────────────
    def _optimize_scene(self, scene: trimesh.Scene) -> trimesh.Scene:
        """Iterate over every geometry in a Scene and optimize each one."""
        optimized_geoms = {}
        total_before = 0
        total_after = 0

        for name, geom in scene.geometry.items():
            if isinstance(geom, trimesh.Trimesh):
                before = len(geom.faces)
                total_before += before
                optimized = self._optimize_mesh(geom)
                total_after += len(optimized.faces)
                optimized_geoms[name] = optimized
            else:
                optimized_geoms[name] = geom

        scene.geometry.update(optimized_geoms)

        logger.info(
            "Scene optimization complete: %d → %d total faces (%.0f%% reduction)",
            total_before,
            total_after,
            (1 - total_after / max(total_before, 1)) * 100,
        )
        return scene

    # ── single mesh handler ─────────────────────────────────────────────────
    def _optimize_mesh(self, mesh: trimesh.Trimesh) -> trimesh.Trimesh:
        """
        Full optimization pipeline for a single Trimesh:
        1. Merge duplicate vertices
        2. Remove degenerate / duplicate faces
        3. Quadric decimation to target face count
        4. Fix normals
        """
        original_faces = len(mesh.faces)

        # Skip if already below target
        if original_faces <= self.target_faces:
            logger.info(
                "Mesh already has %d faces (≤ target %d) — skipping decimation",
                original_faces,
                self.target_faces,
            )
            return mesh

        # ── Step 1: Clean up ────────────────────────────────────────────────
        mesh.merge_vertices()
        mesh.remove_unreferenced_vertices()

        # Remove degenerate faces (zero-area triangles)
        non_degenerate = mesh.nondegenerate_faces()
        if not np.all(non_degenerate):
            mesh.update_faces(non_degenerate)

        # Remove duplicate faces
        unique = mesh.unique_faces()
        if len(unique) < len(mesh.faces):
            mesh.update_faces(unique)

        after_cleanup = len(mesh.faces)

        # ── Step 2: Quadric Edge Collapse Decimation ────────────────────────
        try:
            mesh = mesh.simplify_quadric_decimation(face_count=self.target_faces)
            logger.info(
                "Decimation: %d → %d → %d faces (cleanup → decimation)",
                original_faces,
                after_cleanup,
                len(mesh.faces),
            )
        except Exception as e:
            logger.warning(
                "Quadric decimation failed (%s) — falling back to cleaned mesh (%d faces)",
                str(e),
                after_cleanup,
            )

        # ── Step 3: Final cleanup ───────────────────────────────────────────
        mesh.fix_normals()

        return mesh
