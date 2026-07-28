function buildCreateAccountPayload({
  publicKey,
  comment,
  tokenManagerId
}) {
  return {
    public_key: publicKey,

    // key_format:
      // "KEY_FORMAT_PEM_EC_P256_SHA256",
    key_format: 2,

    // roles: [
    //   "ROLE_PAYER",
    //   "ROLE_RECEIVER"
    // ],

    // account_status:
    //   "ACCOUNT_STATUS_ACTIVE",

    account_comment:
      comment,

    token_manager_id:
      tokenManagerId
  };
}

module.exports = {
    buildCreateAccountPayload
}