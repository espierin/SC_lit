import os
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import unittest
from unittest.mock import MagicMock, patch
import reviewer_reminder as reminder

class ReminderTests(unittest.TestCase):
    def setUp(self):
        self.env = patch.dict(os.environ, {'REMINDER_MODE':'overdue', 'REMINDER_RUN_TOKEN':'test', 'BREVO_SMTP_USER':'test', 'BREVO_SMTP_PASSWORD':'test', 'BREVO_SMTP_SENDER':'sender@example.test'}, clear=True)
        self.env.start()
        self.addCleanup(self.env.stop)
        self.payload = {'eligible':True, 'id':'a'*64, 'to':'reviewer@example.test', 'subject':'Review reminder', 'body':'Please review.'}

    @patch.object(reminder, 'api')
    @patch.object(reminder.smtplib, 'SMTP')
    def test_dry_run_never_opens_smtp_or_claims(self, smtp, api):
        api.return_value = self.payload
        reminder.run()
        api.assert_called_once_with('prepare', {'mode':'overdue'})
        smtp.assert_not_called()

    @patch.object(reminder, 'api')
    @patch.object(reminder.smtplib, 'SMTP')
    def test_not_eligible_never_sends(self, smtp, api):
        os.environ['DRY_RUN'] = 'false'
        api.return_value = {'eligible':False}
        reminder.run()
        smtp.assert_not_called()

    @patch.object(reminder, 'api')
    @patch.object(reminder.smtplib, 'SMTP')
    def test_accepted_message_acknowledged_once(self, smtp, api):
        os.environ['DRY_RUN'] = 'false'
        api.side_effect = [self.payload, self.payload, {'ok':True}]
        reminder.run()
        connection = smtp.return_value.__enter__.return_value
        connection.starttls.assert_called_once()
        connection.send_message.assert_called_once()
        self.assertEqual(api.call_args.args, ('ack', {'id':'a'*64, 'status':'smtp_accepted'}))

    @patch.object(reminder, 'api')
    @patch.object(reminder.smtplib, 'SMTP')
    def test_uncertain_smtp_not_retried(self, smtp, api):
        os.environ['DRY_RUN'] = 'false'
        api.side_effect = [self.payload, self.payload, {'ok':True}]
        connection = smtp.return_value.__enter__.return_value
        connection.send_message.side_effect = OSError('sensitive details')
        with self.assertRaises(RuntimeError):
            reminder.run()
        connection.send_message.assert_called_once()
        self.assertEqual(api.call_args.args, ('ack', {'id':'a'*64, 'status':'uncertain'}))

class ReadyWindowTests(unittest.TestCase):
    def test_handoff_waits_for_seven_in_winter_and_summer(self):
        for date in ['2026-10-30T01:28:00', '2027-07-02T01:28:00']:
            current = [datetime.fromisoformat(date).replace(tzinfo=ZoneInfo('Europe/Amsterdam'))]
            def sleep(seconds): current[0] += timedelta(seconds=seconds)
            self.assertTrue(reminder.wait_until_ready_window(lambda: current[0], sleep))
            self.assertEqual(current[0].hour, 7)
            self.assertEqual(current[0].minute, 0)

    def test_wrong_day_or_closed_window_never_waits(self):
        for date in ['2026-10-29T07:00:00', '2026-10-30T12:00:00', '2026-10-30T00:30:00']:
            self.assertFalse(reminder.wait_until_ready_window(lambda: datetime.fromisoformat(date).replace(tzinfo=ZoneInfo('Europe/Amsterdam')), lambda _: self.fail('must not wait')))

if __name__ == '__main__':
    unittest.main()
