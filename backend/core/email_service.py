import html
import logging
import os
from typing import Optional

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Email, Mail, ReplyTo

logger = logging.getLogger(__name__)

PLATFORM_NAME = os.environ.get("PLATFORM_NAME", "Helio RCM")
EMAIL_FROM = os.environ.get("EMAIL_FROM", "noreply@heliorcm.ai")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Helio RCM")
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO", "davida@heliorcm.ai")
EMAIL_SIGNATURE = os.environ.get("EMAIL_SIGNATURE", "Helio Support Team")
PLATFORM_LOGIN_URL = os.environ.get("PLATFORM_LOGIN_URL", "https://heliorcm.ai/signin")
PASSWORD_RESET_CONTINUE_URL = os.environ.get("PASSWORD_RESET_CONTINUE_URL", PLATFORM_LOGIN_URL)
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY", "")


def _send_html_email(*, to_email: str, subject: str, html_content: str) -> None:
    if not SENDGRID_API_KEY:
        raise RuntimeError("Email service is not configured (missing SENDGRID_API_KEY).")

    recipient = (to_email or "").strip().lower()
    if not recipient:
        raise ValueError("Recipient email is required.")

    message = Mail(
        from_email=Email(EMAIL_FROM, EMAIL_FROM_NAME),
        to_emails=recipient,
        subject=subject,
        html_content=html_content,
    )
    if EMAIL_REPLY_TO:
        message.reply_to = ReplyTo(EMAIL_REPLY_TO)

    client = SendGridAPIClient(SENDGRID_API_KEY)
    response = client.send(message)
    if response.status_code >= 400:
        raise RuntimeError(f"SendGrid returned status {response.status_code}")


def _email_shell(*, title: str, body_html: str) -> str:
    safe_platform = html.escape(PLATFORM_NAME)
    safe_title = html.escape(title)
    safe_signature = html.escape(EMAIL_SIGNATURE)

    return f"""
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f7fb;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;padding:32px;border:1px solid #e5e7eb;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">{safe_platform}</p>
                <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#111827;">{safe_title}</h1>
                {body_html}
                <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#374151;">
                  Thanks,<br />
                  {safe_signature}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
""".strip()


def _build_welcome_email_html(
    *,
    firstname: str,
    lastname: str,
    email: str,
    password: str,
    login_url: str,
) -> str:
    display_name = " ".join(part for part in (firstname, lastname) if part).strip() or "there"
    safe_name = html.escape(display_name)
    safe_email = html.escape(email)
    safe_password = html.escape(password)
    safe_login_url = html.escape(login_url, quote=True)
    safe_platform = html.escape(PLATFORM_NAME)

    body_html = f"""
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                  Hi {safe_name},
                </p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                  Your account has been created. You can sign in using the credentials below.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
                  <tr>
                    <td style="padding:16px 20px;font-size:15px;line-height:1.8;">
                      <strong>Email:</strong> {safe_email}<br />
                      <strong>Temporary password:</strong> {safe_password}
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
                  For security, please change your password after your first login.
                </p>
                <a href="{safe_login_url}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:15px;font-weight:600;">
                  Sign in to {safe_platform}
                </a>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
                  If the button does not work, copy and paste this link into your browser:<br />
                  <a href="{safe_login_url}" style="color:#2563eb;word-break:break-all;">{safe_login_url}</a>
                </p>
    """

    return _email_shell(title=f"Welcome to {safe_platform}", body_html=body_html)


def send_new_user_welcome_email(
    *,
    to_email: str,
    password: str,
    firstname: str = "",
    lastname: str = "",
    login_url: Optional[str] = None,
) -> None:
    """Send a welcome email with login credentials to a newly created user."""
    if not SENDGRID_API_KEY:
        raise RuntimeError("Email service is not configured (missing SENDGRID_API_KEY).")

    recipient = (to_email or "").strip().lower()
    if not recipient:
        raise ValueError("Recipient email is required.")

    sign_in_url = (login_url or PLATFORM_LOGIN_URL).strip()
    subject = f"Your {PLATFORM_NAME} account is ready"
    html_content = _build_welcome_email_html(
        firstname=firstname,
        lastname=lastname,
        email=recipient,
        password=password,
        login_url=sign_in_url,
    )

    _send_html_email(to_email=recipient, subject=subject, html_content=html_content)
    logger.info("Welcome email sent to %s", recipient)


def _build_password_reset_email_html(*, email: str, reset_link: str) -> str:
    safe_email = html.escape(email)
    safe_reset_link = html.escape(reset_link, quote=True)
    safe_platform = html.escape(PLATFORM_NAME)

    body_html = f"""
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                  Hello,
                </p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
                  Follow the link below to reset the password for your <strong>{safe_email}</strong> account on {safe_platform}.
                </p>
                <a href="{safe_reset_link}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:999px;font-size:15px;font-weight:600;">
                  Reset your password
                </a>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
                  If the button does not work, copy and paste this link into your browser:<br />
                  <a href="{safe_reset_link}" style="color:#2563eb;word-break:break-all;">{safe_reset_link}</a>
                </p>
                <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#374151;">
                  If you did not ask to reset your password, you can ignore this email.
                </p>
    """

    return _email_shell(title="Reset your password", body_html=body_html)


def send_password_reset_email(*, to_email: str, reset_link: str) -> None:
    """Send a branded password reset email with a Firebase-generated reset link."""
    recipient = (to_email or "").strip().lower()
    reset_url = (reset_link or "").strip()
    if not reset_url:
        raise ValueError("Password reset link is required.")

    subject = f"Reset your {PLATFORM_NAME} password"
    html_content = _build_password_reset_email_html(email=recipient, reset_link=reset_url)
    _send_html_email(to_email=recipient, subject=subject, html_content=html_content)
    logger.info("Password reset email sent to %s", recipient)
