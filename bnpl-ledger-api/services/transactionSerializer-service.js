const {
  getLedgerMessageType
} = require("./proto-service");

const {
  getPublicKey
} = require("./ledger-service");

const {
  buildCreateAccountPayload
} = require("../builders/createAccountBuilder");

const {
  buildCreateAccountClientTransaction
} = require("../builders/clientTransactionBuilder");

const {
  ledgerConfig
} = require("../config/ledger-config");

async function serializeCreateAccountClientTransaction(customerName) {
  const ClientTransaction =
    await getLedgerMessageType("ClientTransaction");

  const publicKey =
    await getPublicKey();

  const createAccountPayload =
    buildCreateAccountPayload({
      publicKey,
      comment: customerName,
      tokenManagerId: ledgerConfig.tokenManagerId
    });

  // Important: public_key is bytes in proto, so convert PEM string to Buffer.
  createAccountPayload.public_key =
    Buffer.from(createAccountPayload.public_key, "utf8");

  const clientTransactionPayload =
    buildCreateAccountClientTransaction({
      senderId: ledgerConfig.accountManagerId,
      sequenceNumber: 0,
      createAccountPayload
    });

  const verificationError =
    ClientTransaction.verify(clientTransactionPayload);

  if (verificationError) {
    throw new Error(
      `ClientTransaction verification failed: ${verificationError}`
    );
  }

  const clientTransactionMessage =
    ClientTransaction.fromObject(clientTransactionPayload);

  const serializedBytes =
    ClientTransaction
      .encode(clientTransactionMessage)
      .finish();

  return {
    payload: clientTransactionPayload,
    serializedClientTransactionBase64:
      Buffer.from(serializedBytes).toString("base64"),
    serializedClientTransactionHex:
      Buffer.from(serializedBytes).toString("hex"),
    byteLength:
      serializedBytes.length
  };
}

module.exports = {
  serializeCreateAccountClientTransaction
};