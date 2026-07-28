# Mock BNPL Provider Services

## Overview

The providers simulate participating BNPL lenders in the Exposure Network.

Current lenders:

- Klarna
- ClearPay
- Zilch

Each provider exposes customer BNPL data using a standard API.

The Lloyds backend queries these services to build a unified Exposure Passport.

---

## Architecture

```text
                Lloyds Backend

                       |
        --------------------------------
        |              |              |
        ▼              ▼              ▼

     Klarna       ClearPay         Zilch
     3001          3002            3003
```

---

## Project Structure

```text
providers/

├── klarna-service
│   ├── app.js
│   ├── routes
│   │   └── exposure.js
│   └── data
│       └── customerData.js
│
├── clearpay-service
│   ├── app.js
│   ├── routes
│   │   └── exposure.js
│   └── data
│       └── customerData.js
│
└── zilch-service
    ├── app.js
    ├── routes
    │   └── exposure.js
    └── data
        └── customerData.js
```

---

## Starting Services

Open three terminals.

### Klarna

```bash
cd providers/klarna-service

npm install

node app.js
```

Expected:

```text
Klarna running on port 3001
```

---

### ClearPay

```bash
cd providers/clearpay-service

npm install

node app.js
```

Expected:

```text
ClearPay running on port 3002
```

---

### Zilch

```bash
cd providers/zilch-service

npm install

node app.js
```

Expected:

```text
Zilch running on port 3003
```

---

## Provider API

### Exposure API

```http
GET /exposure/:customerHash
```

Example:

```http
GET /exposure/CUS123
```

Example Response:

```json
{
  "provider": "Klarna",
  "customerHash": "CUS123",
  "exposure": 500,
  "monthlyCommitment": 120,
  "activePlans": [],
  "ledgerEvents": []
}
```

---

## Customer Profiles

### CUS100

Healthy Customer

Characteristics:

```text
Low Exposure
On-Time Payments
Closed Plans
```

Expected Outcome:

```text
APPROVE
```

---

### CUS200

Medium Risk Customer

Characteristics:

```text
Medium Exposure
One Missed Installment
```

Expected Outcome:

```text
REVIEW
```

---

### CUS300

High Risk Customer

Characteristics:

```text
High Exposure
Multiple Missed Payments
Default Event
```

Expected Outcome:

```text
REJECT
```

---

### CUS123

Primary Demo Customer

Exposure Breakdown:

```text
Klarna     £500
ClearPay   £300
Zilch      £200
```

Total Exposure:

```text
£1000
```

---

## Supported Ledger Events

### Positive Events

```text
ON_TIME_PAYMENT

PARTIAL_REPAYMENT

PLAN_CLOSED
```

---

### Negative Events

```text
MISSED_INSTALLMENT

DEFAULT
```

---

### Exposure Events

```text
NEW_PURCHASE

PARTIAL_REPAYMENT

PLAN_CLOSED
```

---

## Provider Onboarding

New providers can join by exposing:

```http
GET /exposure/:customerHash
```

and registering in:

```text
backend/services/providerRegistry.js
```

Example:

```javascript
{
  provider: "NewProvider",
  url: "http://localhost:3010"
}
```

No additional backend changes are required.

---

## Demo Scenario

Customer purchases:

```text
iPhone
£1200
```

Current BNPL Exposure:

```text
Klarna     £500
ClearPay   £300
Zilch      £200
```

The Lloyds backend calls all providers, aggregates exposure, generates an Exposure Passport, and proceeds to affordability assessment.

This simulates how a future GCUL-connected ecosystem would provide real-time cross-lender visibility.