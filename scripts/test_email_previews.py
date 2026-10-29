import os
import unittest
from unittest.mock import patch
import test_reviewer_emails as emails

class EmailPreviewTests(unittest.TestCase):
    @patch.object(emails, 'api')
    @patch.object(emails.smtplib, 'SMTP')
    def test_both_tests_use_same_templates_and_only_owner_address(self, smtp, api):
        api.return_value = {'messages':[{'mode':mode,'subject':'Subject','body':'Example'} for mode in ['ready','overdue']]}
        with patch.dict(os.environ, {key:'test@example.test' for key in ['REMINDER_RUN_TOKEN','BREVO_SMTP_USER','BREVO_SMTP_PASSWORD','BREVO_SMTP_SENDER']}):
            emails.send_tests()
        api.assert_called_once_with('test-preview')
        connection = smtp.return_value.__enter__.return_value
        connection.starttls.assert_called_once()
        self.assertEqual(connection.send_message.call_count,2)
        for call in connection.send_message.call_args_list:
            message = call.args[0]
            self.assertEqual(message['To'],'e.spierings@umcutrecht.nl')
            self.assertTrue(message['Subject'].startswith('[TEST]'))
            self.assertIn('no real review action is required',message.get_content())

if __name__ == '__main__':
    unittest.main()
