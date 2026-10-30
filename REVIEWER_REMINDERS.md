# Reviewer email reminders

Prepared for Friday morning when a new selection is ready (from 07:00 until 12:00), and Monday 09:00 Europe/Amsterdam (including daylight saving).
A push of data/editions.json triggers a readiness check; polling every 15 minutes on Friday morning catches delayed availability. Each notification type is sent at most once. Friday notifications require an edition dated that Friday.
Only the latest edition from the preceding seven days is considered. The
current duty reviewer must have an active account. Friday announces the new completed search handoff even if the reviewer has already finished; its message states that no further action is needed in that case. Monday still requires an incomplete review. No notification is sent for an absent shortlist or sent edition.

Provider: Brevo SMTP, STARTTLS on port 2525, matching the EPT infrastructure.
The EPT application and its credentials have not been changed.

## Protected setup

Repository Settings → Secrets and variables → Actions:

- Secret `BREVO_SMTP_USER`: Brevo SMTP login.
- Secret `BREVO_SMTP_PASSWORD`: a Brevo SMTP key, preferably dedicated to EFI.
- Secret `BREVO_SMTP_SENDER`: verified sender email address.
- Secret `REMINDER_RUN_TOKEN`: dedicated shared token, also a secret in the
  review backend. This grants reminder access only, never publication access.

Keep `REVIEWER_REMINDERS_ENABLED` unset or `false` until configured.
Run the workflow manually with `dry_run=true` to check eligibility without
sending, then verify the sender in Brevo. Set backend `REMINDER_EMAIL_ENABLED`
and repository variable `REVIEWER_REMINDERS_ENABLED` to `true` to activate.
Never place credentials in chat, code, workflow arguments or logs.

## Delivery behavior

The backend rechecks eligibility immediately before claiming a reminder.
A conditional storage write prevents duplicate claims, including overlapping
workflow executions. A claimed reminder is never automatically retried,
even after a workflow interruption. Check Brevo before manually resolving
an uncertain delivery. SMTP acceptance is recorded separately from inbox delivery.
The recipient and message content are never written to public Actions logs.

This workflow does not edit reviews, publish posts, change Buffer schedules,
change selection criteria, or enable the newsletter.

## Activation and delivery verification

Activated 29 October 2026 after the owner created a dedicated EFI SMTP key
and stored it directly in GitHub Secrets. Both production gates are enabled.
Two clearly marked owner-only tests were sent through the actual SMTP route;
Brevo reported Delivered to the owner UMC address for both ready and overdue
templates. This confirms receiving-server acceptance, not inbox placement.

Test run: https://github.com/espierin/SC_lit/actions/runs/40951964641

The verified existing pilot sender is used with display name EFI Journal Club;
Brevo rewrites its Gmail sender domain to brevosend.com. No institutional DNS
or EPT configuration was changed. Test messages use the same backend templates
as production, do not claim reminders, and cannot target other recipients.


## Friday delivery recovery (30 October 2026)

Successful completion of the trusted main-branch search handoff also starts the mail workflow. It waits until Friday 07:00 Amsterdam before attempting delivery, so morning delivery does not rely solely on GitHub cron. Existing Friday 07:00-12:00 checks and Monday 09:00 remain unchanged. All push, scheduled, manual and handoff-triggered runs use the same per-mode/date/edition/recipient conditional claim. Claims and uncertain SMTP outcomes are never cleared or retried automatically. Dry runs never claim or send. The notification remains due when review was completed before the Friday email window.
