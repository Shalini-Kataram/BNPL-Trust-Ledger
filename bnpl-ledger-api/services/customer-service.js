const {
  buildCreateAccountPayload
} = require("../builders/createAccountBuilder");

const {
  buildCreateAccountClientTransaction
} = require("../builders/clientTransactionBuilder");

const {
  getPublicKey
} = require("./ledger-service");

const {
  ledgerConfig
} = require("../config/ledger-config");

async function createCustomerRequest(
  customerName
) {
  const publicKey =
    await getPublicKey();

  const createAccountPayload =
    buildCreateAccountPayload({
      publicKey,
      comment: customerName,
      tokenManagerId:
        ledgerConfig.tokenManagerId
    });

  const clientTransaction =
    buildCreateAccountClientTransaction({
      senderId:
        ledgerConfig.accountManagerId,

      sequenceNumber: 0,

      createAccountPayload
    });

  return clientTransaction;
}

module.exports = {
  createCustomerRequest
};