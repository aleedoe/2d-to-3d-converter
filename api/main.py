"""
2D → 3D Converter — Flask Application Entry Point
"""

import logging

from flask import Flask
from flask_cors import CORS

from config.settings import (
    FLASK_HOST,
    FLASK_PORT,
    FLASK_DEBUG,
    MAX_CONTENT_LENGTH,
    CORS_ORIGINS,
)
from routes.generate import generate_bp

# ─── Logging ─────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger(__name__)


# ─── App factory ─────────────────────────────────────────────────────────────────
def create_app() -> Flask:
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

    # CORS — allow the Next.js dev server
    CORS(app, origins=CORS_ORIGINS)

    # Register blueprints
    app.register_blueprint(generate_bp)

    logger.info("Flask app ready  •  CORS origins: %s", CORS_ORIGINS)
    return app


# ─── Entrypoint ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app = create_app()
    logger.info("Starting server on %s:%s", FLASK_HOST, FLASK_PORT)
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=FLASK_DEBUG)
