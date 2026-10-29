"""Send one claimed reviewer reminder. Never print recipient, credentials or payload."""
import json
import os
import smtplib
import ssl
import urllib.request
from email.message import EmailMessage
from email.utils import parseaddr

BASE = 'https://efi-journal-club-review-store.espierin.chatgpt.site'

def api(action, payload=None):
    request = urllib.request.Request(BASE + '/reminders/' + action,
        data=json.dumps(payload or {}).encode(), method='POST',
        headers={'Authorization': 'Bearer ' + os.environ['REMINDER_RUN_TOKEN'],
                 'Content-Type': 'application/json'})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)

def run():
    dry_run = os.environ.get('DRY_RUN', 'true').lower() != 'false'
    required = ['REMINDER_RUN_TOKEN'] + ([] if dry_run else ['BREVO_SMTP_USER', 'BREVO_SMTP_PASSWORD', 'BREVO_SMTP_SENDER'])
    if any(not os.environ.get(key) for key in required):
        raise RuntimeError('Required protected settings are missing')
    mode = os.environ.get('REMINDER_MODE', 'auto')
    if mode == 'auto':
        from datetime import datetime
        from zoneinfo import ZoneInfo
        mode = 'ready' if datetime.now(ZoneInfo('Europe/Amsterdam')).weekday() == 4 else 'overdue'
    preview = api('prepare', {'mode':mode})
    if not preview.get('eligible'):
        if preview.get('needsAttention'):
            raise RuntimeError('No active reviewer is assigned; check administration')
        print('No reminder required. No email sent.')
        return
    if dry_run:
        print('An incomplete review is eligible. Dry run: no claim and no email sent.')
        return
    sender = parseaddr(os.environ['BREVO_SMTP_SENDER'])[1]
    if '@' not in sender or '\n' in sender or '\r' in sender:
        raise RuntimeError('Verified sender address is invalid')
    # Check authentication before claiming. Never automatically retry after a claim:
    # an interrupted SMTP response can mean the message was accepted.
    with smtplib.SMTP('smtp-relay.brevo.com', 2525, timeout=30) as smtp:
        smtp.ehlo()
        smtp.starttls(context=ssl.create_default_context())
        smtp.ehlo()
        smtp.login(os.environ['BREVO_SMTP_USER'], os.environ['BREVO_SMTP_PASSWORD'])
        reminder = api('claim', {'mode':mode})
        if not reminder.get('eligible'):
            print('Reminder was not claimed. No email sent.')
            return
        message = EmailMessage()
        message['From'] = os.environ['BREVO_SMTP_SENDER']
        message['To'] = reminder['to']
        message['Subject'] = reminder['subject']
        message['Message-ID'] = '<efi-review-' + reminder['id'] + '@' + sender.rsplit('@', 1)[1] + '>'
        message.set_content(reminder['body'])
        try:
            smtp.send_message(message)
        except Exception:
            try:
                api('ack', {'id': reminder['id'], 'status': 'uncertain'})
            except Exception:
                pass
            raise RuntimeError('SMTP delivery is uncertain; check Brevo before any manual resend') from None
        api('ack', {'id': reminder['id'], 'status': 'smtp_accepted'})
        print('Brevo accepted one reminder. Inbox delivery is not yet confirmed.')

if __name__ == '__main__':
    try:
        run()
    except Exception as error:
        # SMTP exception details may contain addresses. Keep public Actions logs private-data free.
        print('::error::Reviewer reminder could not complete (' + type(error).__name__ + '). Check protected settings and Brevo; do not resend blindly.')
        raise SystemExit(1)
