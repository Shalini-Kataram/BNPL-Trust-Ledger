# GCUL Ledger Service API Documentation

## Overview

This service provides a wrapper around Google Cloud Universal Ledger (GCUL) APIs and supporting utilities required for the BNPL Trust Ledger hackathon solution.

Current implementation includes:

- Ledger health verification
- Account lookup
- Account manager and token manager information retrieval
- Transaction lookup
- Public key retrieval
- KMS signing helpers
- CreateAccount payload generation

---

# Base URL

```text
http://localhost:8083
```

---

# Endpoints

## 1. Health Check

### Request

```http
GET /ledger/health
```

### Purpose

Verifies service availability.

### Sample Response

```json
{
  "status": "UP"
}
```

---

## 2. Get Ledger Information

### Request

```http
GET /ledger/info
```

### Purpose

Returns ledger configuration and manager information.

### Sample Response

```json
{
  "network": "gcul-pilot-testing",
  "projectId": "719603056384",
  "accountManagerId": "1:ACT:GBP:...",
  "tokenManagerId": "1:TKN:GBP:...",
  "issuanceLimit": "300000000000"
}
```

---

## 3. Get Account Details

### Request

```http
GET /ledger/accounts/:accountId
```

### Example

```http
GET /ledger/accounts/1:ACT:GBP:xxxx
```

### Purpose

Returns ledger account details.

---

## 4. Get Account Manager And Token Manager

### Request

```http
GET /ledger/accounts
```

### Purpose

Returns:

- Account Manager details
- Token Manager details

### Sample Response

```json
{
  "accountManager": {},
  "tokenManager": {}
}
```

---

## 5. Query Transaction

### Request

```http
GET /ledger/transactions/:digest
```

### Example

```http
GET /ledger/transactions/abcd1234
```

### Purpose

Queries transaction status using transaction digest.

---

## 6. Retrieve Public Key

### Request

```http
GET /ledger/public-key
```

### Purpose

Returns the public key associated with the credit-passport-key KMS key.

### Sample Response

```json
{
  "publicKey": "-----BEGIN PUBLIC KEY-----..."
}
```

---

## 7. Test KMS Signing

### Request

```http
GET /ledger/test/sign
```

### Purpose

Verifies Cloud KMS signing functionality.

### Sample Response

```json
{
  "digest": "...",
  "signature": "..."
}
```

---

## 8. Test Client Transaction Signing

### Request

```http
POST /ledger/test/sign-client-transaction
```

### Request Body

```json
{
  "serializedClientTransactionBase64": "..."
}
```

### Sample Response

```json
{
  "serializedClientTransactionBase64": "...",
  "digestHex": "...",
  "senderSignatureBase64": "..."
}
```

---

## 9. Create Account Payload Builder

### Request

```http
GET /ledger/test/create-account-payload
```

### Purpose

Generates a GCUL CreateAccount payload.

### Sample Response

```json
{
  "public_key": "...",
  "key_format": "KEY_FORMAT_PEM_EC_P256_SHA256",
  "roles": [
    "ROLE_PAYER",
    "ROLE_RECEIVER"
  ],
  "account_status": "ACCOUNT_STATUS_ACTIVE",
  "account_comment": "BNPL Customer 001",
  "token_manager_id": "1:TKN:GBP:..."
}
```

---

## 10. Create Client Transaction Payload

### Request

```http
GET /ledger/test/client-transaction-payload
```

### Purpose

Generates a CreateAccount ClientTransaction object.

### Sample Response

```json
{
  "sender_id": "1:ACT:GBP:...",
  "sequence_number": 0,
  "chained_unit": false,
  "create_account_transaction": {}
}
```

---

## 11. Submit Transaction

### Request

```http
POST /ledger/transactions/submit
```

### Request Body

```json
{
  "serializedSignedTransaction": "..."
}
```
### Create Customer Request

```http
POST /ledger/customers
```

Creates a customer CreateAccount transaction model.

Request:

```json
{
  "customerName": "BNPL Customer 001"
}
```

---

### Generate ClientTransaction Payload

```http
GET /ledger/test/client-transaction-payload
```

Returns CreateAccount ClientTransaction JSON.

---

### Verify Proto Loading

```http
GET /ledger/test/proto
```

Verifies GCUL protobuf definitions are correctly loaded.

---

### Serialize ClientTransaction

```http
POST /ledger/test/serialize-client-transaction
```

Request:

```json
{
  "customerName": "BNPL Customer 001"
}
```

Returns:

```json
{
  "serializedClientTransactionBase64": "...",
  "serializedClientTransactionHex": "...",
  "byteLength": 320
}
```

---

### Build SignedTransaction

```http
POST /ledger/test/build-signed-transaction
```

Request:

```json
{
  "serializedClientTransactionBase64": "..."
}
```

Returns serialized SignedTransaction protobuf.

---

### Create Signed Customer Transaction

```http
POST /ledger/test/create-signed-customer-transaction
```

End-to-end flow:

- CreateAccount Payload
- ClientTransaction Serialization
- KMS Signing
- SignedTransaction Serialization

Returns:

```json
{
  "serializedClientTransactionBase64": "...",
  "serializedSignedTransactionBase64": "...",
  "clientTransactionDigestHex": "..."
}
```

---

### Submit Signed Transaction

```http
POST /ledger/transactions/submit
```

Submits SignedTransaction to GCUL.

Request:

```json
{
  "serializedSignedTransaction": "..."
}
```


### Notes

Currently validates integration with GCUL submitTransaction endpoint.

A valid protobuf SignedTransaction is still required.

---

# Current Status

## Completed

### GCUL Connectivity

- QueryAccount integration
- QueryTransactionState integration
- Endpoint configuration and authentication

### Cloud KMS Integration

- Public key retrieval
- Transaction signing
- SHA-256 digest generation

### Protobuf Integration

- GCUL proto loading
- CreateAccount payload creation
- ClientTransaction serialization
- SignedTransaction serialization

### Business APIs

- Customer account creation request builder
- Transaction payload generation
- End-to-end signed transaction creation

### Transaction Lifecycle

Implemented:

CreateAccount Payload
↓
ClientTransaction
↓
Protobuf Serialization
↓
SignedTransaction
↓
GCUL SubmitTransaction

## Current Observation

GCUL successfully parses the submitted SignedTransaction and validates the transaction structure.

Transaction processing currently reaches signature verification, confirming that:

- ClientTransaction protobuf generation is valid
- SignedTransaction protobuf generation is valid
- SubmitTransaction API integration is valid

Further confirmation of the expected signing model for the hackathon environment is in progress.

## New Endpoints

### POST /ledger/customers

Generate customer CreateAccount transaction model.

### GET /ledger/test/proto

Verify protobuf loading.

### GET /ledger/test/client-transaction-payload

Generate ClientTransaction payload.

### POST /ledger/test/serialize-client-transaction

Serialize ClientTransaction protobuf.

### POST /ledger/test/build-signed-transaction

Generate SignedTransaction protobuf.

### POST /ledger/test/create-signed-customer-transaction

Complete end-to-end flow:

CreateAccount
↓
ClientTransaction
↓
Serialization
↓
Signing
↓
SignedTransaction