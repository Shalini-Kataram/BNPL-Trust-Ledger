const ledger =
require("../services/ledgerService");

async function getTimeline(
  req,
  res
) {

  const customerHash =
    req.params.customerHash;

  const events =
    await ledger.getCustomerEvents(
      customerHash
    );

  res.json(events);
}

module.exports = {
  getTimeline
};