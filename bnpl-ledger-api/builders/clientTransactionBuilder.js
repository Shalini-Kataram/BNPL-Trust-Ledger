function buildCreateAccountClientTransaction({
  senderId,
  sequenceNumber,
  createAccountPayload
}) {
  return {
    sender_id: senderId,
    sequence_number: sequenceNumber,
    chained_unit: false,
    create_account_transaction: createAccountPayload
  };
}

module.exports = {
  buildCreateAccountClientTransaction
};