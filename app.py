"""API Flask untuk chatbot RAG layanan mahasiswa."""

from __future__ import annotations

import logging
import os

from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException

from config import (
    MAX_QUESTION_LENGTH,
    MAX_REQUEST_BYTES,
    get_chat_model,
    get_cors_origin,
    get_host,
    get_port,
    is_debug,
)
from rag_core import RagError, answer_with_rag, index_available


def _error(message: str, status: int):
    return jsonify({'error': message}), status


def _configure_logging(app: Flask) -> None:
    level_name = os.getenv('LOG_LEVEL', 'INFO').strip().upper()
    level = getattr(logging, level_name, logging.INFO)
    logging.basicConfig(
        level=level,
        format='%(asctime)s %(levelname)s %(name)s: %(message)s',
    )
    app.logger.setLevel(level)


def _register_cors(app: Flask) -> None:
    origin = get_cors_origin()
    if origin is None:
        return

    @app.after_request
    def add_cors_headers(response):
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        response.headers['Vary'] = 'Origin'
        return response


def _register_error_handlers(app: Flask) -> None:
    @app.errorhandler(HTTPException)
    def handle_http_error(exc: HTTPException):
        message = exc.description or 'Permintaan tidak valid.'
        if exc.code == 404:
            message = 'Endpoint tidak ditemukan.'
        elif exc.code == 405:
            message = 'Metode HTTP tidak didukung untuk endpoint ini.'
        elif exc.code == 413:
            message = 'Ukuran request terlalu besar.'
        return _error(message, exc.code or 500)

    @app.errorhandler(Exception)
    def handle_unexpected_error(exc: Exception):
        app.logger.exception('Kesalahan server tidak tertangani.')
        return _error('Terjadi kesalahan internal pada server.', 500)


def _register_routes(app: Flask) -> None:
    @app.get('/api/health')
    def health():
        return jsonify(
            {
                'status': 'ok',
                'service': 'Flask RAG API',
                'model': get_chat_model(),
                'index_ready': index_available(),
            }
        )

    @app.post('/api/chat')
    def chat():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return _error('Body harus berupa JSON objek.', 400)

        raw_question = payload.get('question')
        if not isinstance(raw_question, str):
            return _error('Pertanyaan harus berupa teks.', 400)

        question = raw_question.strip()
        if not question:
            return _error('Pertanyaan tidak boleh kosong.', 400)
        if len(question) > MAX_QUESTION_LENGTH:
            return _error(
                f'Pertanyaan maksimal {MAX_QUESTION_LENGTH} karakter.',
                400,
            )

        try:
            result = answer_with_rag(question)
        except RagError as exc:
            app.logger.warning('RAG gagal: %s', exc)
            return _error(str(exc), 503)
        except Exception:
            app.logger.exception('Kesalahan tak terduga saat memproses RAG.')
            return _error(
                'Chatbot sedang bermasalah. Periksa log server.',
                500,
            )

        return jsonify(
            {
                'answer': result['answer'],
                'sources': result['sources'],
            }
        )


def create_app() -> Flask:
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = MAX_REQUEST_BYTES
    app.json.ensure_ascii = False

    _configure_logging(app)
    _register_cors(app)
    _register_error_handlers(app)
    _register_routes(app)
    return app


app = create_app()


if __name__ == '__main__':
    app.run(host=get_host(), port=get_port(), debug=is_debug())
