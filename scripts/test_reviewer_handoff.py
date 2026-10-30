import unittest
from reviewer_handoff import wait_for_handoff


class HandoffTests(unittest.TestCase):
    def test_wait_then_process_only_once(self):
        results = iter([{'status': 'waiting'}, {'status': 'waiting'}, {'status': 'processed'}])
        calls = []
        def check():
            calls.append(True)
            return next(results)
        self.assertEqual(wait_for_handoff(check, lambda _: None, lambda: 0)['status'], 'processed')
        self.assertEqual(len(calls), 3)

    def test_completed_and_paused_do_not_retry(self):
        for status in ['already_processed', 'paused']:
            self.assertEqual(wait_for_handoff(lambda: {'status': status}, lambda _: self.fail('must not wait'), lambda: 0)['status'], status)

    def test_timeout_is_reported_instead_of_processing_empty_input(self):
        seconds = [0]
        def sleep(value): seconds[0] += value
        with self.assertRaisesRegex(RuntimeError, 'not ready'):
            wait_for_handoff(lambda: {'status': 'waiting'}, sleep, lambda: seconds[0], 120)


if __name__ == '__main__':
    unittest.main()
