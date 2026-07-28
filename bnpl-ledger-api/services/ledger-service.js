// import { GoogleAuth } from "google-auth-library";
const {
  GoogleAuth
} = require("google-auth-library");
const {
  ledgerConfig
} = require("../config/ledger-config");


const { exec } = require("child_process");
const util = require("util");

const auth = new GoogleAuth({
  scopes: [
    "https://www.googleapis.com/auth/cloud-platform"
  ]
});

const execAsync =
  util.promisify(exec);

async function queryAccount(
  accountId
) {
  const client =
    await auth.getClient();

  const token =
    await client.getAccessToken();

  const url =
    `https://universalledger.googleapis.com/v1/projects/` +
    `${ledgerConfig.projectId}` +
    `/locations/${ledgerConfig.location}` +
    `/endpoints/${ledgerConfig.network}` +
    `:queryAccount?account_id=${encodeURIComponent(accountId)}`;

  const response =
    await fetch(url, {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${token.token}`
      }
    });

  return {
    status: response.status,
    body: await response.json()
  };
}

async function queryTransactionState(
  transactionDigestHex
) {
  const client =
    await auth.getClient();

  const token =
    await client.getAccessToken();

  const url =
    `https://universalledger.googleapis.com/v1/projects/` +
    `${ledgerConfig.projectId}` +
    `/locations/${ledgerConfig.location}` +
    `/endpoints/${ledgerConfig.network}` +
    `:queryTransactionState?transaction_digest_hex=` +
    encodeURIComponent(transactionDigestHex);

  const response =
    await fetch(url, {
      method: "GET",
      headers: {
        Authorization:
          `Bearer ${token.token}`
      }
    });

  return {
    status: response.status,
    body: await response.json()
  };
}

async function getPublicKey() {

  const { stdout } =
    await execAsync(`
      gcloud kms keys versions get-public-key 1 \
      --key=credit-passport-key \
      --keyring=gcul-hackathon \
      --location=global
    `);

  return stdout;
}

async function getAccessToken() {
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

async function submitSignedTransaction(serializedSignedTransaction) {
  const token = await getAccessToken();

  const url =
    `https://universalledger.googleapis.com/v1/projects/` +
    `${ledgerConfig.projectId}` +
    `/locations/${ledgerConfig.location}` +
    `/endpoints/${ledgerConfig.network}` +
    `:submitTransaction`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      serializedSignedTransaction
    })
  });

  return {
    status: response.status,
    body: await response.json()
  };
}

module.exports = {
    queryAccount,
    queryTransactionState,
    getPublicKey,
    submitSignedTransaction
}