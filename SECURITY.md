# Security Policy

## Supported Versions

The following table lists the security support status for versions of Outreacio.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.0   | Yes                |
| < 1.0.0 | No                 |

## Reporting a Vulnerability

If you discover a security vulnerability in Outreacio, please do not open a public GitHub issue. Instead, send a private report to the maintainers:

- Contact: `solvers.real@gmail.com` *(maintainers: replace with your active security contact address)*

Please include:
- A description of the vulnerability and its potential impact.
- Step-by-step instructions to reproduce the issue (proof of concept or sample requests).
- Any proposed remediation if available.

Reports will be acknowledged within 48 hours, with a follow-up assessment and timeline for a patch.

## Handling of Credentials

Outreacio is designed with in-memory credential security:

- Gmail App Passwords entered in the interface are transmitted securely to the local backend solely to authenticate the Nodemailer transporter.
- Passwords and authentication keys are never written to disk, stored in a database, or logged in server output.
- Active campaign jobs and their associated credentials are held only in server memory for the duration of the send job.
- Completed and cancelled jobs are automatically purged from memory after 15 minutes.

## Scope

Outreacio is a self-hosted automation application. Users and deployers are responsible for securing their hosting environment, including:
- Enforcing HTTPS encryption on public endpoints.
- Setting appropriate session secrets and environment configurations.
- Restricting network access to authorized operators.
