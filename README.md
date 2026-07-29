# Credit Blockers – BNPL Trust Ledger

Reboot Hyderabad 2026 Hackathon Submission

## Team
Credit Blockers

## Problem Statement
Build a trusted Buy Now Pay Later (BNPL) ecosystem using Google Cloud technologies and Universal Ledger to provide transparency, consent tracking, and trusted credit decisions.

## Solution Overview
BNPL Trust Ledger enables:

- Customer consent capture
- Credit passport verification
- Trust-based BNPL approval decisions
- Immutable audit trail using Google Cloud Universal Ledger (GCUL)
- Merchant verification of customer trust status

## Architecture

Frontend:
- React

Backend:
- Node.js / Express

Google Cloud Services:
- Cloud Run
- Google Cloud Universal Ledger (GCUL)
- Cloud KMS
- Google Cloud APIs

## Repository Structure

```
bnpl-ledger-ui/
bnpl-ledger-api/
providers/
```

## Key Features

### Consent Management
Customers provide consent before credit assessment.

### Trust Ledger
Critical approval events are recorded in GCUL.

### Credit Assessment
Customer credit profile is evaluated before approval.

### Auditability
All important business decisions can be verified through the ledger.

## Demo Flow

1. Customer applies for BNPL
2. Customer provides consent
3. Credit profile is evaluated
4. Approval decision is generated
5. Decision is recorded in GCUL
6. Merchant verifies the outcome

## Running Locally

### Backend

```bash
cd bnpl-ledger-api
npm install
npm start
```

### Frontend

```bash
cd bnpl-ledger-ui
npm install
npm start
```

## Deployment

Frontend URL:
[BNPL Trust Ledger UI](https://bnpl-ledger-ui-719603056384.us-central1.run.app/)

Backend URL:
[BNPL Trust Ledger API](https://bnpl-ledger-api-719603056384.us-central1.run.app/)

## Team
Credit Blockers

Reboot Hyderabad 2026 Hackathon