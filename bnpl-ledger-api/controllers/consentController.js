const {
  getExposurePassport
} = require("../services/exposureAggregator");

const calculateRisk =
require("../services/riskEngine");

const checkEligibility =
require("../services/affordabilityEngine");

const {
  getLloydsBankingProfile
} = require("../services/lloydsBankingDataService");

const ledger =
require("../services/ledgerService");

const eventTypes =
require("../constants/eventTypes");

function resolveFinalDecision(
  assessmentDecision,
  trustScore
) {

  if (assessmentDecision === "APPROVE") {
    return "APPROVED";
  }

  if (assessmentDecision === "REJECT") {
    return "REJECTED";
  }

  if (assessmentDecision === "REVIEW") {
    return trustScore >= 60
      ? "APPROVED"
      : "REJECTED";
  }

  return null;
}

function toNegativeRiskScore(
  trustScore
) {

  return 100- trustScore;
}

async function publishFinalDecision(
  accountId,
  finalDecision,
  requestedAmount
) {

  if (!finalDecision) {
    return;
  }

  await ledger.publish({
    customerHash: accountId,
    provider: "LLOYDS",
    eventType:
      finalDecision === "APPROVED"
        ? eventTypes.LOAN_APPROVED
        : eventTypes.LOAN_REJECTED,
    amount:
      finalDecision === "APPROVED"
        ? requestedAmount
        : undefined
  });
}

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

    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: "accountId is required"
      });
    }

    const profile =
      getLloydsBankingProfile(accountId);

    const requestedAmount =
      Number(totalAmount || 0);

    const lloydsOnlyAssessment =
      checkEligibility({
        currentExposure:
          profile.internalExposure,
        requestedAmount,
        monthlyIncome:
          profile.monthlyIncome,
        riskScore:
          profile.internalRiskScore
      });

    if (!consent) {

      const finalDecision =
        resolveFinalDecision(
          lloydsOnlyAssessment.decision,
          lloydsOnlyAssessment.riskScore
        );

      const internalDecision =
        finalDecision || "REJECTED";

      const internalDecisionReason =
        internalDecision === "APPROVED"
          ? "Auto approved based on risk/trust score"
          : "Auto rejected based on risk/trust score";

      await ledger.publish({
        customerHash: accountId,
        provider: "LLOYDS",
        eventType:
          eventTypes.AFFORDABILITY_CHECK,
        metadata: {
          mode:
            "LLOYDS_INTERNAL_ONLY",
          assessment:
            lloydsOnlyAssessment
        }
      });

      await publishFinalDecision(
        accountId,
        finalDecision,
        requestedAmount
      );

      return res.json({

        success: true,

        consentGranted: false,

        accountId,

        emiOpted,

        productDetails,

        totalAmount,

        paymentOption,

        message:
          "Consent not provided. Affordability assessed using Lloyds internal banking data only.",

        dataSources: {
          lloydsBankingData: true,
          gculBnplData: false
        },

        affordabilityAssessment: {
          mode:
            "LLOYDS_INTERNAL_ONLY",
          currentExposure:
            lloydsOnlyAssessment.currentExposure,
          requestedAmount:
            lloydsOnlyAssessment.requestedAmount,
          futureExposure:
            lloydsOnlyAssessment.futureExposure,
          exposureRatio:
            lloydsOnlyAssessment.exposureRatio,
          riskScore:
            toNegativeRiskScore(
              lloydsOnlyAssessment.riskScore
            ),
          trustScore:
            lloydsOnlyAssessment.riskScore,
          decision:
            internalDecision,
          reason:
            internalDecisionReason
        },

        finalDecision,

        aggregatedExposure: null,

        providers: []
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

    const successfulProviders =
      providers.filter(provider => !provider.error);

    const externalRiskScore =
      successfulProviders.length > 0
        ? calculateRisk(successfulProviders)
        : profile.internalRiskScore;

    const consentEnrichedAssessment =
      checkEligibility({
        currentExposure:
          profile.internalExposure + totalExposure,
        requestedAmount,
        monthlyIncome:
          profile.monthlyIncome,
        riskScore:
          Math.min(
            profile.internalRiskScore,
            externalRiskScore
          )
      });

    const finalDecision =
      resolveFinalDecision(
        consentEnrichedAssessment.decision,
        consentEnrichedAssessment.riskScore
      );

    const bnplDecision =
      finalDecision || "REJECTED";

    const bnplDecisionReason =
      bnplDecision === "APPROVED"
        ? "Auto approved based on risk/trust score"
        : "Auto rejected based on risk/trust score";

    await ledger.publish({
      customerHash: accountId,
      provider: "LLOYDS",
      eventType:
        eventTypes.CONSENT_GRANTED
    });

    await ledger.publish({
      customerHash: accountId,
      provider: "LLOYDS",
      eventType:
        eventTypes.AFFORDABILITY_CHECK,
      metadata: {
        mode:
          "LLOYDS_PLUS_GCUL",
        lloydsOnlyAssessment,
        consentEnrichedAssessment
      }
    });

    await publishFinalDecision(
      accountId,
      finalDecision,
      requestedAmount
    );

    return res.json({

      success: true,

      consentGranted: true,

      accountId,

      emiOpted,

      productDetails,

      totalAmount,

      paymentOption,

      dataSources: {
        gculBnplData: true
      },

      bnplData: {
        riskScore:
          toNegativeRiskScore(
            externalRiskScore
          ),
        trustScore:
          externalRiskScore,
        riskDecision:
          bnplDecision,
        riskReason:
          bnplDecisionReason
      },

      finalDecision,

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