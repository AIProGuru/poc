import logging
import re
import time

from flask import Blueprint, jsonify, request

from core.email_service import send_form_inquiry_email

logger = logging.getLogger(__name__)

inquiries_bp = Blueprint("inquiries", __name__)

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MAX_SHORT = 200
MAX_MESSAGE = 4000
WINDOW_SECONDS = 600
MAX_REQUESTS = 8

PRICING_MODULES = {
    "Claim Status",
    "Denials and Automated Appeals",
    "Patient Liability",
    "Payment Variance (Underpayments)",
    "Autonomous Cash Posting",
    "Agentic AI and LLMs",
}
REVENUE_BANDS = {
    "Under $5M",
    "$5M-$25M",
    "$25M-$100M",
    "$100M-$250M",
    "$250M+",
}

_hits = {}


def _text(value, limit, *, keep_lines=False):
    text = str(value or "").replace("\r\n", "\n").replace("\r", "\n")
    if keep_lines:
        lines = [" ".join(line.split()) for line in text.split("\n")]
        text = "\n".join(line for line in lines if line)
    else:
        text = " ".join(text.split())
    return text[:limit].strip()


def _email(value):
    text = _text(value, MAX_SHORT).lower()
    if not text or not EMAIL_PATTERN.match(text) or len(text) > 254:
        return ""
    return text


def _too_many(ip):
    now = time.time()
    recent = [stamp for stamp in _hits.get(ip, []) if now - stamp < WINDOW_SECONDS]
    if len(recent) >= MAX_REQUESTS:
        _hits[ip] = recent
        return True
    recent.append(now)
    _hits[ip] = recent
    return False


def _count(value, *, minimum, maximum=None):
    text = _text(value, 12)
    if not text:
        return "", None
    if not text.isdigit():
        return None, "Enter a whole number."
    number = int(text)
    if number < minimum or (maximum is not None and number > maximum):
        if maximum is None:
            return None, f"Enter a whole number of {minimum} or more."
        return None, f"Enter a whole number from {minimum} to {maximum}."
    return str(number), None


def _demo_fields(data):
    name = _text(data.get("name"), MAX_SHORT)
    email = _email(data.get("email"))
    errors = {}
    if not name:
        errors["name"] = "Enter a name."
    if not email:
        errors["email"] = "Enter a valid email."
    if errors:
        return None, errors
    return [
        ("Name", name),
        ("Email", email),
        ("Phone", _text(data.get("phone"), 40)),
        ("Provider", _text(data.get("provider"), MAX_SHORT)),
        ("Product updates", "Yes" if data.get("updates") else "No"),
        ("Message", _text(data.get("message"), MAX_MESSAGE, keep_lines=True)),
    ], email


def _pricing_fields(data):
    first_name = _text(data.get("firstName"), MAX_SHORT)
    last_name = _text(data.get("lastName"), MAX_SHORT)
    email = _email(data.get("email"))
    confirm_email = _email(data.get("confirmEmail"))
    provider_name = _text(data.get("providerName"), MAX_SHORT)
    city = _text(data.get("city"), MAX_SHORT)
    state = _text(data.get("state"), 80)
    zip_code = _text(data.get("zip"), 20)
    raw_modules = data.get("modules") if isinstance(data.get("modules"), list) else []
    modules = []
    for item in raw_modules:
        name = _text(item, MAX_SHORT)
        if name in PRICING_MODULES and name not in modules:
            modules.append(name)
    revenue = _text(data.get("revenue"), 40)
    providers, providers_error = _count(data.get("providers"), minimum=1, maximum=100)
    practices, practices_error = _count(data.get("practices"), minimum=1)

    errors = {}
    if not first_name:
        errors["firstName"] = "Enter a first name."
    if not last_name:
        errors["lastName"] = "Enter a last name."
    if not email:
        errors["email"] = "Enter a valid email."
    if not confirm_email:
        errors["confirmEmail"] = "Confirm the email."
    elif email and confirm_email != email:
        errors["confirmEmail"] = "Email addresses do not match."
    if not provider_name:
        errors["providerName"] = "Enter the provider name."
    if not city:
        errors["city"] = "Enter a city."
    if not state:
        errors["state"] = "Enter a state."
    if not zip_code:
        errors["zip"] = "Enter a ZIP code."
    if not modules:
        errors["modules"] = "Select at least one module."
    if revenue and revenue not in REVENUE_BANDS:
        errors["revenue"] = "Choose a revenue band."
    if providers_error:
        errors["providers"] = providers_error
    if practices_error:
        errors["practices"] = practices_error
    if errors:
        return None, errors

    return [
        ("Name", f"{first_name} {last_name}"),
        ("Email", email),
        ("Provider", provider_name),
        ("City", city),
        ("State", state),
        ("ZIP code", zip_code),
        ("Modules", ", ".join(modules)),
        ("Annual net patient revenue", revenue),
        ("Approx number of providers", providers),
        ("Number of practices", practices),
    ], email


@inquiries_bp.route("/inquiries", methods=["POST"])
def create_inquiry():
    if not request.is_json:
        return jsonify({"error": "Unsupported Media Type"}), 415

    data = request.get_json(silent=True) or {}
    kind = _text(data.get("kind"), 20).lower()
    if kind == "demo":
        fields, reply_to = _demo_fields(data)
    elif kind == "pricing":
        fields, reply_to = _pricing_fields(data)
    else:
        return jsonify({"error": "Choose a request type."}), 400

    if fields is None:
        return jsonify({"error": "Check the form and try again.", "fields": reply_to}), 400

    ip = (request.headers.get("X-Forwarded-For") or request.remote_addr or "unknown").split(",")[0].strip()
    if _too_many(ip or "unknown"):
        return jsonify({"error": "Too many requests. Please wait and try again."}), 429

    try:
        send_form_inquiry_email(kind=kind, reply_to=reply_to, fields=fields)
    except Exception:
        logger.exception("Failed to send %s inquiry", kind)
        return jsonify({"error": "We couldn't send your request. Please try again."}), 502

    return jsonify({"message": "Request sent."}), 200
