const crypto = require("crypto");
const {
  KeyManagementServiceClient
} = require("@google-cloud/kms");

const kmsClient = new KeyManagementServiceClient();

const USER_KMS_KEY_VERSION =
  "projects/ltc-hack2026-team17/locations/global/keyRings/gcul-hackathon/cryptoKeys/credit-passport-key/cryptoKeyVersions/1";

async function signBytes(payloadBytes) {
  const digest = crypto
    .createHash("sha256")
    .update(payloadBytes)
    .digest();

  const [response] = await kmsClient.asymmetricSign({
    name: USER_KMS_KEY_VERSION,
    digest: {
      sha256: digest
    }
  });

  return {
    digestHex: digest.toString("hex"),
    signatureBase64: Buffer
      .from(response.signature)
      .toString("base64")
  };
}

async function signText(text) {
  return signBytes(Buffer.from(text));
}

module.exports = {
  signBytes,
  signText
};