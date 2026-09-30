# Security and privacy

This app has no server and no accounts. All data stays in the user's browser
(IndexedDB). The main risks are code that sends data off the device, and
problems with backup import.

## Report a problem

Please do **not** open a public issue for a security or privacy problem.
Use GitHub's private report instead: open the **Security** tab of this
repository and click **Report a vulnerability**.

Include:

- What the problem is and where it is (file or screen).
- Steps to reproduce it.
- What data could be exposed.

We aim to reply within 7 days.

## In scope

- Any code path that sends user data off the device.
- Cross-site scripting through imported backup files or custom food names.
- Supply-chain risks in dependencies or the build workflow.
