"""Load raw 837/835 EDI files from S3 (with local fallback for POC)."""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_LOCAL_837 = REPO_ROOT / "processed837"
DEFAULT_LOCAL_835 = REPO_ROOT / "processed835"


def _tenant_bucket(platform_tenant: str) -> str:
    explicit = (os.getenv("EDI_S3_BUCKET") or "").strip()
    if explicit:
        return explicit
    tenant = (platform_tenant or "").strip().lower() or "betacustomer"
    return os.getenv(f"EDI_S3_BUCKET_{tenant.upper()}", tenant)


def _s3_client():
    try:
        import boto3
    except ImportError as exc:
        raise RuntimeError(
            "boto3 is required for S3 EDI access. Install with: pip install boto3"
        ) from exc

    kwargs: Dict[str, Any] = {}
    region = (os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION") or "").strip()
    if region:
        kwargs["region_name"] = region
    return boto3.client("s3", **kwargs)


def _normalize_claim_no(claim_no: str) -> str:
    return (claim_no or "").strip()


def list_s3_keys(bucket: str, prefix: str) -> List[str]:
    client = _s3_client()
    keys: List[str] = []
    token = None
    while True:
        params: Dict[str, Any] = {"Bucket": bucket, "Prefix": prefix}
        if token:
            params["ContinuationToken"] = token
        resp = client.list_objects_v2(**params)
        for item in resp.get("Contents") or []:
            key = item.get("Key")
            if key and not key.endswith("/"):
                keys.append(key)
        if not resp.get("IsTruncated"):
            break
        token = resp.get("NextContinuationToken")
    return keys


def find_837_s3_key(platform_tenant: str, claim_no: str) -> Optional[Tuple[str, str]]:
    """Return (bucket, key) for the first matching 837 object."""
    claim = _normalize_claim_no(claim_no)
    if not claim:
        return None
    bucket = _tenant_bucket(platform_tenant)
    prefixes = [
        f"837/837_{claim}_",
        f"837/837_{claim}.",
        f"837/{claim}",
    ]
    try:
        for prefix in prefixes:
            keys = list_s3_keys(bucket, prefix)
            # Prefer exact claim match in filename
            matched = [k for k in keys if f"837_{claim}_" in k or f"837_{claim}." in Path(k).name]
            if not matched:
                matched = keys
            if matched:
                matched.sort()
                return bucket, matched[0]
        # Broader scan under 837/
        keys = list_s3_keys(bucket, "837/")
        matched = [k for k in keys if claim in Path(k).name]
        if matched:
            matched.sort()
            return bucket, matched[0]
    except Exception as exc:
        logger.warning("S3 list failed for bucket=%s claim=%s: %s", bucket, claim, exc)
    return None


def find_local_837(claim_no: str) -> Optional[Path]:
    claim = _normalize_claim_no(claim_no)
    if not claim:
        return None
    roots = [
        Path(os.getenv("EDI_LOCAL_837_DIR") or DEFAULT_LOCAL_837),
        REPO_ROOT / "sample_edi" / "837",
    ]
    candidates: List[Path] = []
    for root in roots:
        if not root.exists():
            continue
        for path in root.glob(f"837_{claim}_*.edi"):
            candidates.append(path)
        for path in root.glob(f"837_{claim}.edi"):
            candidates.append(path)
    if not candidates:
        return None
    candidates.sort(key=lambda p: p.name)
    return candidates[0]


def get_object_bytes(bucket: str, key: str) -> bytes:
    client = _s3_client()
    resp = client.get_object(Bucket=bucket, Key=key)
    return resp["Body"].read()


def put_object_bytes(bucket: str, key: str, body: bytes, content_type: str = "text/plain") -> None:
    client = _s3_client()
    client.put_object(Bucket=bucket, Key=key, Body=body, ContentType=content_type)


def presign_get_url(bucket: str, key: str, expires_in: int = 3600) -> Optional[str]:
    try:
        client = _s3_client()
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": key},
            ExpiresIn=expires_in,
        )
    except Exception as exc:
        logger.warning("Presign failed for s3://%s/%s: %s", bucket, key, exc)
        return None


def load_raw_837(platform_tenant: str, claim_no: str) -> Dict[str, Any]:
    """
    Load raw 837 text for a claim.
    Prefer S3 bucket named after the platform tenant (e.g. betacustomer/837/...).
    Fall back to local processed837 / sample_edi/837.
    """
    claim = _normalize_claim_no(claim_no)
    result: Dict[str, Any] = {
        "claimNo": claim,
        "source": None,
        "bucket": None,
        "key": None,
        "filename": None,
        "url": None,
        "content": None,
        "error": None,
    }

    s3_hit = find_837_s3_key(platform_tenant, claim)
    if s3_hit:
        bucket, key = s3_hit
        try:
            raw = get_object_bytes(bucket, key)
            text = raw.decode("utf-8", errors="replace")
            result.update(
                {
                    "source": "s3",
                    "bucket": bucket,
                    "key": key,
                    "filename": Path(key).name,
                    "url": presign_get_url(bucket, key),
                    "content": text,
                }
            )
            return result
        except Exception as exc:
            logger.warning("S3 get failed s3://%s/%s: %s", bucket, key, exc)
            result["error"] = f"S3 read failed: {exc}"

    local = find_local_837(claim)
    if local:
        text = local.read_text(encoding="utf-8", errors="replace")
        result.update(
            {
                "source": "local",
                "bucket": None,
                "key": None,
                "filename": local.name,
                "url": None,
                "content": text,
                "error": None,
            }
        )
        return result

    if not result.get("error"):
        result["error"] = (
            f"No 837 found for {claim} in S3 bucket '{_tenant_bucket(platform_tenant)}/837/' "
            "or local processed837/"
        )
    return result


def save_corrected_837(
    platform_tenant: str,
    claim_no: str,
    content: str,
    original_key: Optional[str] = None,
) -> Dict[str, Any]:
    """Write corrected 837 under 837/corrected/ in the tenant bucket."""
    claim = _normalize_claim_no(claim_no)
    bucket = _tenant_bucket(platform_tenant)
    base_name = Path(original_key).name if original_key else f"837_{claim}_corrected.edi"
    if not base_name.endswith(".edi"):
        base_name = f"{base_name}.edi"
    key = f"837/corrected/{base_name}"
    body = content.encode("utf-8")
    put_object_bytes(bucket, key, body)
    return {
        "bucket": bucket,
        "key": key,
        "filename": base_name,
        "url": presign_get_url(bucket, key),
    }
