# Security policy

MyDay keeps a family's money and plans, so security reports get priority over everything else.

## Reporting a vulnerability

**Please don't open a public issue.** Report it privately through GitHub: the repository's **Security** tab → **Report a vulnerability**. Only the maintainer sees the report.

Include what you can:

- what an attacker can do, and what they need first (an account, a family invite, network position);
- steps or a request that reproduces it;
- the version (Settings → What's new) or commit you tested.

You'll get a reply within a week. Once a fix is released, the report is published as a GitHub advisory and you're credited, unless you'd rather not be.

## Supported versions

Only the latest release gets security fixes. Self-hosted instances update by pulling the new image, see the README.

## Scope

In scope: the app and its API, the Docker images and the compose setup from this repository.

Out of scope: instances run by other people, reports that need a compromised device or server, missing hardening headers without a demonstrated attack, rate limits on endpoints that don't take secrets, and denial of service by flooding.
