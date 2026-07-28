const {
  getLedgerMessageType
} = require("./proto-service");

const {
  signBytes
} = require("./kms-service");

async function buildSignedTransactionFromClientTransaction(
  serializedClientTransactionBase64
) {
  const SignedTransaction =
    await getLedgerMessageType("SignedTransaction");

  const serializedClientTransactionBytes =
    Buffer.from(
      serializedClientTransactionBase64,
      "base64"
    );

  const signResult =
    await signBytes(
      serializedClientTransactionBytes
    );

  const signedTransactionPayload = {
    serialized_client_transaction:
      serializedClientTransactionBytes,

    sender_signature:
      Buffer.from(
        signResult.signatureBase64,
        "base64"
      )
  };

  const verificationError =
    SignedTransaction.verify(
      signedTransactionPayload
    );

  if (verificationError) {
    throw new Error(
      `SignedTransaction verification failed: ${verificationError}`
    );
  }

  const signedTransactionMessage =
    SignedTransaction.fromObject(
      signedTransactionPayload
    );

  const serializedSignedTransactionBytes =
    SignedTransaction
      .encode(signedTransactionMessage)
      .finish();

  return {
    signedTransactionPayload: {
      serialized_client_transaction:
        serializedClientTransactionBase64,

      sender_signature:
        signResult.signatureBase64
    },

    serializedSignedTransactionBase64:
      Buffer
        .from(serializedSignedTransactionBytes)
        .toString("base64"),

    serializedSignedTransactionHex:
      Buffer
        .from(serializedSignedTransactionBytes)
        .toString("hex"),

    clientTransactionDigestHex:
      signResult.digestHex,

    byteLength:
      serializedSignedTransactionBytes.length
  };
}

module.exports = {
  buildSignedTransactionFromClientTransaction
};