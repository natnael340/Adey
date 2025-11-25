from pathlib import Path
import mimetypes
from uuid import uuid4
from typing import Optional


def get_ext_from_filename(filename: str) -> Optional[str]:
    if not filename:
        return None

    ext = Path(filename).suffix.lower().lstrip(".")
    if ext:
        if len(ext) > 10 or not ext.isalnum():
            return None
        return ext
    
    mime, _ = mimetypes.guess_type(filename)
    if mime:
        guessed = mimetypes.guess_extension(mime)
        if guessed:
            return guessed.lstrip(".")
    return None


def get_user_avatar_upload_path(instance, filename: str) -> str:
    ext = get_ext_from_filename(filename)
    if not ext:
        ext = "bin"
    
    return f"avatars/{instance.identifier}/{uuid4().hex}.{ext}"