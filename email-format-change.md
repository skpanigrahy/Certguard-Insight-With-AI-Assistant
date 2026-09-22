Absolutely. I would give Copilot a **very explicit implementation prompt**, but tell it to first inspect the existing code and identify where the current email aggregation/template is built. We don't want Copilot unnecessarily refactoring the certificate discovery logic.

You can paste the following directly into Copilot Chat/Agent mode.

---

# Copilot task: Refactor CertGuardian email alert format

## Problem statement

We need to improve the **CertGuardian certificate expiry email notification format**.

### Current behavior

The current email is primarily organized by **certificate**.

For example, when a certificate is found on 20 hosts, the email shows:

```text
CERTIFICATE IS EXPIRING IN 66 DAYS

Certificate: Entrust Root Certification Authority
Expiration Date: 2026-11-27

Found in 20 hosts.

<Component 1>
  PROD hosts...
  PROD hosts...

<Component 2>
  TEST hosts...

<Component 3>
  DEV hosts...

<Component 4>
  PROD/TEST/DEV hosts...
```

The important point is that **"Found in 20 hosts" is not necessarily incorrect**. Those 20 hosts can legitimately belong to multiple components and multiple environments.

The problem is that the current email mixes:

* PROD
* TEST
* DEV
* multiple components
* certificate details
* host details

under one certificate section.

This makes the email difficult for an application team to understand and act on.

For example, the email subject/body may indicate PROD, while the body contains hosts from DEV and TEST as well.

### Important clarification

Do **not** treat the current 20-host count as a bug unless the existing code/data proves that the count itself is incorrect.

The primary problem we want to solve now is **email organization and aggregation/presentation**, not certificate discovery.

---

# Target state

Change the email structure to:

```text
SUMMARY
    ↓
ENVIRONMENT
    ↓
COMPONENT
    ↓
CERTIFICATE
    ↓
HOST COUNT
    ↓
HOST DETAILS
```

The email should remain a **single consolidated email**, but clearly separate the environments.

---

## 1. Add a summary section near the top

For each certificate alert, provide a concise summary.

Example:

```text
CERTIFICATE IS EXPIRING IN 66 DAYS

Certificate:
Entrust Root Certification Authority

Expiration Date:
2026-11-27

Affected Environments:

PROD    7 hosts / 2 components
TEST    3 hosts / 2 components
DEV    10 hosts / 4 components

TOTAL   20 hosts / 8 components
```

The numbers above are illustrative based on the current email example. Do not hardcode them.

Calculate them dynamically from the actual alert data.

### Summary requirements

For each environment calculate:

* distinct host count
* distinct component count

Also calculate:

* total distinct host count
* total distinct component count

Avoid double counting where the same host/certificate/component appears in multiple underlying records.

---

# 2. Change the detailed section to environment-first hierarchy

Instead of:

```text
Certificate
  → all hosts
      → mixed DEV/TEST/PROD
```

use:

```text
PROD
   Component
      Certificate
         Host count
         Host details

TEST
   Component
      Certificate
         Host count
         Host details

DEV
   Component
      Certificate
         Host count
         Host details
```

### Example target format

```text
--------------------------------------------------
PROD
--------------------------------------------------

Component: si-secure-proxy

Certificate: Entrust Root Certification Authority
Expiration Date: 2026-11-27

Found in 6 hosts.

Host details:
  gap.na-6x:PROD | si-secure-proxy | host-1
  gap.na-6x:PROD | si-secure-proxy | host-2
  ...
  
Component: mercury-s3-proxy-prod

Certificate: Entrust Root Certification Authority
Expiration Date: 2026-11-27

Found in 1 host.

Host details:
  gap.unknown:PROD | mercury-s3-proxy-prod | host-1


--------------------------------------------------
TEST
--------------------------------------------------

Component: si-app-control

Certificate: Entrust Root Certification Authority
Expiration Date: 2026-11-27

Found in 2 hosts.

Host details:
  ...
  

--------------------------------------------------
DEV
--------------------------------------------------

Component: mercury-s3-proxy-cr-dev

Certificate: Entrust Root Certification Authority
Expiration Date: 2026-11-27

Found in 1 host.

Host details:
  ...
```

The exact HTML formatting should follow the existing CertGuardian email style/template.

---

# 3. Preserve the existing certificate information

Do not remove existing useful certificate fields such as:

* CN
* Issuer
* Issue Date
* Expiration Date
* Thumbprint
* Serial Number
* Certificate Type

However, avoid unnecessarily repeating the same certificate information if the same certificate occurs across multiple components within the same alert.

Where practical, show the common certificate information in the summary/certificate section and use the component sections to show the affected hosts.

---

# 4. Environment must be the primary grouping

The primary grouping key should be:

```text
Environment
```

Within an environment:

```text
Environment
    └── Component/Application
            └── Certificate
                    └── Hosts
```

Do not mix DEV, TEST and PROD records within the same component section.

---

# 5. Correct aggregation without changing certificate discovery

Please inspect the existing code before making changes.

Do **not** redesign or modify certificate discovery/collection unless required to support the new grouping.

The goal is primarily to change:

```text
raw certificate data
        ↓
current email aggregation
        ↓
current email template
```

into:

```text
raw certificate data
        ↓
normalized/grouped alert model
        ↓
environment
        ↓
component
        ↓
certificate
        ↓
distinct hosts
        ↓
email template
```

If the existing model can support this cleanly, prefer a minimal refactoring rather than introducing unnecessary new architecture.

---

# 6. Be careful with counts

Do not simply use the number of database records as the host count.

Investigate the existing aggregation logic and determine the correct host identity.

Where appropriate, use a distinct host identifier.

For example:

```text
COUNT(DISTINCT hostId)
```

or the equivalent in the existing Java/domain model.

Also ensure that grouping does not accidentally multiply records because of joins or nested collections.

The following must be independently correct:

```text
environment host count
component host count
total host count
environment component count
total component count
```

---

# 7. Preserve existing behavior

The following should remain unchanged unless the existing implementation makes it impossible:

* certificate discovery
* certificate monitoring
* expiry calculation
* alert thresholds
* dashboard behavior
* existing email recipients
* existing scheduling
* existing certificate data collection
* existing security behavior

This task is primarily an **email notification presentation and aggregation refactoring**.

---

# 8. Do NOT implement the Q4 private-key/owned-certificate filtering in this task

There is a separate feature request to allow Photon configuration to control whether email alerts should be scoped to application-owned/private-key certificates.

That is a future/Q4 enhancement.

For this task, **do not add the Photon configuration or filtering behavior** unless it already exists in the code.

We want to first improve the current email structure.

The future flow will eventually be:

```text
All discovered certificates
          ↓
Photon alert configuration
          ↓
Filter/scope
          ↓
Environment
          ↓
Component
          ↓
Certificate
          ↓
Hosts
          ↓
Email
```

But this task should focus on the grouping and presentation.

---

# 9. Backward compatibility

Please inspect existing email templates/tests before modifying them.

Make sure existing email scenarios continue to work, including:

* one environment
* multiple environments
* one component
* multiple components
* one certificate
* multiple certificates
* one host
* multiple hosts
* expired certificates
* certificates nearing expiry
* certificates with no host/component data, if currently supported

Handle singular/plural text correctly:

```text
Found in 1 host.
Found in 20 hosts.
1 component
2 components
```

---

# 10. Tests

Before implementing, identify the existing unit/integration tests covering:

* email generation
* certificate alert aggregation
* certificate notification
* email templates

Update/add tests for the new grouping.

At minimum, create test coverage for:

### Scenario 1

One certificate:

```text
PROD
  Component A
    5 hosts
```

Expected:

```text
PROD: 5 hosts / 1 component
```

### Scenario 2

Same certificate across environments:

```text
PROD
  Component A → 6 hosts
  Component B → 1 host

TEST
  Component C → 2 hosts

DEV
  Component D → 10 hosts
  Component E → 1 host
```

Expected summary:

```text
PROD: 7 hosts / 2 components
TEST: 2 hosts / 1 component
DEV: 11 hosts / 2 components

TOTAL: 20 hosts / 5 components
```

And the detailed email must clearly separate:

```text
PROD
TEST
DEV
```

### Scenario 3

Same host appearing in multiple underlying records.

Ensure it isn't incorrectly counted multiple times.

---

# Implementation approach

Before changing code:

1. Identify the class/service responsible for collecting/preparing certificate alert data.
2. Identify where the current `Found in X hosts` count is calculated.
3. Identify where environment/component information is available.
4. Identify the email DTO/model.
5. Identify the email template/builder.
6. Identify existing tests.
7. Propose the smallest clean change to introduce environment-first grouping.
8. Implement it.
9. Update tests.
10. Run the relevant tests/build.

### Important

Do not blindly rewrite the existing email generation code.

First explain briefly:

```text
Current flow:
A → B → C → email

Proposed change:
A → B → new grouping model → email
```

Then implement the change.

---

## Acceptance criteria

The implementation is complete when:

* [ ] The email has a summary section.
* [ ] Summary shows hosts/components by environment.
* [ ] Summary shows overall totals.
* [ ] DEV, TEST and PROD are clearly separated.
* [ ] Detailed hierarchy is Environment → Component → Certificate → Host.
* [ ] Host counts are accurate and appropriately deduplicated.
* [ ] Existing certificate information is retained.
* [ ] Existing monitoring/discovery behavior is unchanged.
* [ ] Existing recipients/scheduling are unchanged.
* [ ] No Photon configuration is introduced as part of this task.
* [ ] Existing tests are updated.
* [ ] New tests cover multi-environment and multi-component scenarios.
* [ ] The existing email styling is preserved as much as possible.
* [ ] The solution does not introduce unnecessary architectural changes.

---

### One additional instruction I would give Copilot

After it finishes, ask it:

> **"Show me the exact files/classes you changed, why each change was necessary, and specifically explain how the host count is calculated before and after this change. Also show me one example of the generated email structure for a certificate present in PROD, TEST, and DEV."**

That last question is particularly important. It will let you verify that Copilot has **actually understood the problem rather than simply rearranging the HTML**.

And I would **not ask Copilot to implement the Q4 private-key feature at the same time**. Get this email refactoring working first. Then the Photon configuration can be added on top of this cleaner alert model.
