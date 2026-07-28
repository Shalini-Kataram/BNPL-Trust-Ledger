const {
  generateCustomerHash
} = require("../services/hashService");

const ledger =
require("../services/ledgerService");

const events =
require("../constants/eventTypes");

async function grantConsent(
  req,
  res
) {

  const {
    pan,
    mobile
  } = req.body;

  const customerHash =
    generateCustomerHash(
      pan,
      mobile
    );

  await ledger.publish({

    customerHash,

    eventType:
      events.CONSENT_GRANTED,

    provider:
      "LLOYDS"
  });

  res.json({

    success: true,

    customerHash,

    consent: true
  });
}

module.exports = {
  grantConsent
};