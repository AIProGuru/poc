import os
from pathlib import Path

from firebase_admin import auth, credentials, firestore, initialize_app

_BACKEND_DIR = Path(__file__).resolve().parents[2]
_REPO_ROOT = _BACKEND_DIR.parent

_DEFAULT_CREDENTIAL_FILENAME = "heliorcm-46d2b-firebase-adminsdk-fbsvc-c417bac768.json"


def _resolve_credentials_path() -> str:
    configured = os.environ.get("FIREBASE_CREDENTIALS_PATH", "").strip()
    if configured:
        candidate = Path(configured)
        if candidate.is_file():
            return str(candidate.resolve())
        raise FileNotFoundError(f"FIREBASE_CREDENTIALS_PATH not found: {configured}")

    filenames = (
        _DEFAULT_CREDENTIAL_FILENAME,
        "firebase_auth.json",
        "firebase_auth_local.json",
    )
    for root in (_BACKEND_DIR, _REPO_ROOT):
        for name in filenames:
            candidate = root / name
            if candidate.is_file():
                return str(candidate.resolve())

    raise FileNotFoundError(
        "Firebase credentials not found. Set FIREBASE_CREDENTIALS_PATH or place "
        f"{_DEFAULT_CREDENTIAL_FILENAME} in the backend or repo root."
    )


initialize_app(credentials.Certificate(_resolve_credentials_path()))

db = firestore.client()
