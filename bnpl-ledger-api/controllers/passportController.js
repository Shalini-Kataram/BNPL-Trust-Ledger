const ledger =
require("../services/ledgerService");

const {
 getExposurePassport
} =
require("../services/exposureAggregator");

const calculateRisk =
require("../services/riskEngine");

const eventTypes =
require("../constants/eventTypes");

async function getPassport(
 req,
 res
){

 try {

   const {
     customerHash
   } = req.body;

   const providers =
   await getExposurePassport(
      customerHash
   );

   let totalExposure = 0;

   let totalMonthlyCommitment = 0;

   let totalActivePlans = 0;

   let totalMissedInstallments = 0;

   let totalDefaults = 0;

   let totalPartialRepayments = 0;

   providers.forEach(provider => {

      if(provider.error){
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
   });

   const riskScore =
   calculateRisk(
      providers
   );

   let riskLevel = "LOW";

   if(riskScore < 70){
      riskLevel = "MEDIUM";
   }

   if(riskScore < 40){
      riskLevel = "HIGH";
   }

   await ledger.publish({

      customerHash,

      provider:"LLOYDS",

      eventType:
      eventTypes.EXPOSURE_QUERY
   });

   res.json({

      customerHash,

      summary: {

         totalExposure,

         totalMonthlyCommitment,

         totalActivePlans,

         totalMissedInstallments,

         totalDefaults,

         totalPartialRepayments
      },

      creditHealth: {

         riskScore,

         riskLevel
      },

      providers,

      recommendations: [

         totalExposure > 1000
         ? "High BNPL exposure detected"
         : "Exposure within healthy range",

         totalMissedInstallments > 0
         ? "Missed instalments found"
         : "Good repayment track record"
      ]

   });

 } catch(error){

    res.status(500).json({
      message:error.message
    });
 }
}

module.exports = {
 getPassport
};