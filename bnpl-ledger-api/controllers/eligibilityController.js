const ledger =
require("../services/ledgerService");

const {
 getExposurePassport
} =
require("../services/exposureAggregator");

const calculateRisk =
require("../services/riskEngine");

const checkEligibility =
require("../services/affordabilityEngine");

const eventTypes =
require("../constants/eventTypes");

async function checkEligibilityController(
 req,
 res
){

 const {

   customerHash,

   requestedAmount,

   monthlyIncome

 } = req.body;

 const providers =
 await getExposurePassport(
    customerHash
 );

 const totalExposure =
 providers.reduce(
   (sum,p)=>
      sum +
      (p.exposure || 0),
   0
 );

 const riskScore =
 calculateRisk(providers);

 const result =
 checkEligibility({

   currentExposure:
   totalExposure,

   requestedAmount,

   monthlyIncome,

   riskScore
 });

 await ledger.publish({

   customerHash,

   provider:"LLOYDS",

   eventType:
   eventTypes.AFFORDABILITY_CHECK,

   metadata:
   result
 });

 if(
   result.decision ===
   "APPROVE"
 ){

    await ledger.publish({

      customerHash,

      provider:"LLOYDS",

      eventType:
      eventTypes.LOAN_APPROVED,

      amount:
      requestedAmount
    });

 } else {

    await ledger.publish({

      customerHash,

      provider:"LLOYDS",

      eventType:
      eventTypes.LOAN_REJECTED
    });
 }

 res.json(result);
}

module.exports = {
 checkEligibility:
 checkEligibilityController
};