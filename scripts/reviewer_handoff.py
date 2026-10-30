"""Wait for the cloud search handoff. Never research, approve, email or publish."""
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

ORIGIN = 'https://efi-journal-club-review-store.espierin.chatgpt.site'


def attempt():
    # Obtain a fresh short-lived, audience-bound identity for every attempt.
    url = os.environ['ACTIONS_ID_TOKEN_REQUEST_URL']
    url += ('&' if '?' in url else '?') + urllib.parse.urlencode({'audience': ORIGIN})
    request = urllib.request.Request(url, headers={
        'Authorization': 'Bearer ' + os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']})
    with urllib.request.urlopen(request, timeout=45) as response:
        identity = json.load(response)['value']
    request = urllib.request.Request(ORIGIN + '/reviewer-handoff', data=b'{}', method='POST', headers={
        'Authorization': 'Bearer ' + identity, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.load(response)


def wait_for_handoff(check=attempt, sleep=time.sleep, clock=time.monotonic, max_seconds=19800):
    deadline = clock() + max_seconds
    previous = None
    while clock() < deadline:
        try:
            result = check()
        except urllib.error.HTTPError as error:
            if error.code in (401, 403, 404):
                raise RuntimeError('Handoff endpoint or workflow identity rejected: HTTP ' + str(error.code)) from None
            result = {'status': 'waiting', 'reason': 'Temporary service error'}
        except (urllib.error.URLError, TimeoutError):
            result = {'status': 'waiting', 'reason': 'Temporary connection error'}
        if result != previous:
            print(json.dumps(result), flush=True)
            previous = result
        status = result.get('status')
        if status in ('processed', 'already_processed', 'paused'):
            return result
        if status != 'waiting':
            raise RuntimeError('Unknown handoff status; no processing attempted')
        sleep(min(60, max(0, deadline - clock())))
    raise RuntimeError('Search not ready within this waiting run; a later source push will check again')


if __name__ == '__main__':
    result = wait_for_handoff()
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a', encoding='utf-8') as output:
            output.write('## Reviewer handoff\n\n' + json.dumps(result) + '\n\n')
            output.write('Review decisions remain pending. No Buffer actions or newsletter work.\n')
