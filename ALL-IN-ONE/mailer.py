# mailer.py
import smtplib
from email.message import EmailMessage
from typing import List

def send_anomaly_email(smtp_host: str, smtp_port: int, username: str, password: str,
                       from_addr: str, to_addrs: List[str],
                       subject: str, body: str):
    """
    Simple SMTP email sender. Use TLS port (587) normally.
    to_addrs: list of str
    Returns True on success, raises on failure.
    """
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = ", ".join(to_addrs)
    msg.set_content(body)

    # Connect and send
    with smtplib.SMTP(smtp_host, smtp_port) as smtp:
        smtp.starttls()
        smtp.login(username, password)
        smtp.send_message(msg)
    return True
