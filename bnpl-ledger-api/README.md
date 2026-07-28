# BNPL Exposure Ledger Backend

## Overview

This backend simulates a consent-driven BNPL Exposure Network.

The solution enables Lloyds to:

- Capture customer consent
- Query participating BNPL providers
- Aggregate BNPL exposure
- Generate an Exposure Passport
- Calculate affordability and risk
- Produce lending decisions
- Maintain an auditable event ledger
- Simulate future GCUL integration

---

## Architecture

```text
Customer
   |
   ▼
Consent API
   |
   ▼
Exposure Passport API
   |
   ▼
Exposure Aggregator
   |
   ├── Klarna
   ├── ClearPay
   └── Zilch
   |
   ▼
Risk Engine
   |
   ▼
Affordability Engine
   |
   ▼
Decision Engine
   |
   ▼
Ledger
   |
   ▼
Audit Timeline
```

---

## Technology Stack

- Node.js
- Express.js
- Axios
- File-based Ledger
- Event-Driven Architecture

---

## Project Structure

```text
bnpl-ledger-backend/

├── app.js
│
├── constants
│   └── eventTypes.js
│
├── controllers
│   ├── consentController.js
│   ├── passportController.js
│   ├── eligibilityController.js
│   ├── dashboardController.js
│   └── timelineController.js
│
├── routes
│   ├── consent.js
│   ├── passport.js
│   ├── eligibility.js
│   ├── dashboard.js
│   ├── timeline.js
│   └── ledger.js
│
├── services
│   ├── ledgerService.js
│   ├── hashService.js
│   ├── exposureAggregator.js
│   ├── riskEngine.js
│   ├── affordabilityEngine.js
│   └── providerRegistry.js
│
├── data
│   └── ledger.json
│
└── package.json
```

---

## Setup

### Install Dependencies

```bash
npm install
```

### Create Ledger File

```text
data/ledger.json
```

Contents:

```json
[]
```

### Start Backend

```bash
npm run dev
```

or

```bash
node app.js
```

Expected:

```text
Lloyds Exposure Engine Running On Port 3000
```

---

## API Endpoints

### Health Check

```http
GET /
```

Response

```json
{
  "service": "BNPL Exposure Ledger"
}
```

---

### Consent API

```http
POST /consent
```

Request

```json
{
  "pan": "ABCDE1234F",
  "mobile": "9999999999"
}
```

Response

```json
{
  "success": true,
  "consent": true,
  "customerHash": "..."
}
```

Ledger Event Generated:

```text
CONSENT_GRANTED
```

---

### Exposure Passport

```http
POST /passport
```

Request

```json
{
  "customerHash": "CUS123"
}
```

Response

```json
{
  "summary": {
    "totalExposure": 1000,
    "totalMonthlyCommitment": 250,
    "totalActivePlans": 3
  },
  "creditHealth": {
    "riskScore": 53,
    "riskLevel": "HIGH"
  }
}
```

Ledger Event Generated:

```text
EXPOSURE_QUERY
```

---

### Dashboard API

```http
GET /dashboard/:customerHash
```

Returns:

- Trust Score
- Risk Level
- Exposure
- Active Plans
- Monthly Commitments
- Provider Breakdown

---

### Eligibility API

```http
POST /eligibility
```

Request

```json
{
  "customerHash": "CUS123",
  "requestedAmount": 1200,
  "monthlyIncome": 3000
}
```

Response

```json
{
  "decision": "REJECT"
}
```

Ledger Events Generated:

```text
AFFORDABILITY_CHECK

LOAN_APPROVED
or
LOAN_REJECTED
```

---

### Timeline API

```http
GET /timeline/:customerHash
```

Returns customer audit history.

Example:

```json
[
  {
    "eventType": "CONSENT_GRANTED"
  },
  {
    "eventType": "EXPOSURE_QUERY"
  }
]
```

---

### Ledger APIs

Get all ledger events:

```http
GET /ledger
```

Get ledger events for customer:

```http
GET /ledger/customer/:customerHash
```

Clear ledger:

```http
DELETE /ledger
```

---

## Event Types

```text
CONSENT_GRANTED
CONSENT_REVOKED

NEW_PURCHASE
PARTIAL_REPAYMENT
ON_TIME_PAYMENT
MISSED_INSTALLMENT
DEFAULT
PLAN_CLOSED

EXPOSURE_QUERY
AFFORDABILITY_CHECK

LOAN_APPROVED
LOAN_REJECTED
```

---

## Future GCUL Integration

The current implementation uses a file-based ledger.

When GCUL access becomes available, only:

```text
services/ledgerService.js
```

needs to be replaced.

The following APIs remain unchanged:

```text
/consent
/passport
/dashboard
/eligibility
/timeline
```