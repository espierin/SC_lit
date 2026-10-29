"""Explicit owner-only mail preview test; never claims a production reminder."""
import os
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import make_msgid, parseaddr
from reviewer_reminder import api

OWNER = 'e.spierings@umcutrecht.nl'

def send_tests():
    required = ['REMINDER_RUN_TOKEN', 'BREVO_SMTP_USER', 'BREVO_SMTP_PASSWORD', 'BREVO_SMTP_SENDER']
    if any(not os.environ.get(key) for key in required):
        raise RuntimeError('Protected SMTP configuration is incomplete')
    messages = api('test-preview')['messages']
    if [message.get('mode') for message in messages] != ['ready', 'overdue']:
        raise RuntimeError('Unexpected test templates')
    with smtplib.SMTP('smtp-relay.brevo.com', 2525, timeout=30) as smtp:
        smtp.ehlo()
        smtp.starttls(context=ssl.create_default_context())
        smtp.ehlo()
        smtp.login(os.environ['BREVO_SMTP_USER'], os.environ['BREVO_SMTP_PASSWORD'])
        for template in messages:
            message = EmailMessage()
            message['From'] = os.environ['BREVO_SMTP_SENDER']
            message['To'] = OWNER
            message['Subject'] = '[TEST] ' + template['subject']
            message['Message-ID'] = make_msgid(domain=parseaddr(os.environ['BREVO_SMTP_SENDER'])[1].rsplit('@',1)[1])
            moment = 'Friday: selection ready' if template['mode'] == 'ready' else 'Monday 09:00: incomplete review'
            message.set_content('TEST MESSAGE — ' + moment + '\nThis is a sample; no real review action is required. The article count below is illustrative.\n\n' + template['body'])
            smtp.send_message(message)
            print('Brevo SMTP accepted the ' + template['mode'] + ' test. Inbox delivery is not confirmed.')

if __name__ == '__main__':
    try:
        send_tests()
    except Exception as error:
        print('::error::Email test stopped (' + type(error).__name__ + '). Check Brevo delivery logs before manually resending; a partial send is possible.')
        raise SystemExit(1)
