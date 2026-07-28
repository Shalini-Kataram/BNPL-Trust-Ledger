const {
  getExposurePassport
} = require("../services/exposureAggregator");

async function grantConsent(req, res) {

  try {

    const {
      consent,
      accountId,
      emiOpted,
      productDetails,
      totalAmount,
      paymentOption
    } = req.body;

    if (!consent) {
      return res.status(400).json({
        success: false,
        message: "Customer consent is required"
      });
    }

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: "accountId is required"
      });
    }

    // Get aggregated BNPL data
    const providers =
      await getExposurePassport(accountId);

    let totalExposure = 0;
    let totalMonthlyCommitment = 0;
    let totalActivePlans = 0;
    let totalMissedInstallments = 0;
    let totalDefaults = 0;
    let totalPartialRepayments = 0;
    let aggregateCreditLimit = 0;

    providers.forEach(provider => {

      if (provider.error) {
        return;
      }

      totalExposure +=
        provider.exposure || 0;

      totalMonthlyCommitment +=
        provider.monthlyCommitment || 0;

      totalActivePlans +=
        provider.activePlans?.length || 0;

      totalMissedInstallments +=
        provider.missedInstallments || 0;

      totalDefaults +=
        provider.defaults || 0;

      totalPartialRepayments +=
        provider.partialRepayments || 0;

      aggregateCreditLimit +=
        provider.creditLimit || 0;
    });

    return res.json({

      success: true,

      consentGranted: true,

      accountId,

      emiOpted,

      productDetails,

      totalAmount,

      paymentOption,

      aggregatedExposure: {

        aggregateCreditLimit,

        aggregateOutstandingBalance:
          totalExposure,

        totalMonthlyCommitment,

        totalActivePlans,

        totalMissedInstallments,

        totalDefaults,

        totalPartialRepayments
      },

      providers
    });

  } catch (error) {

    console.error(
      "Consent Error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  grantConsent
};