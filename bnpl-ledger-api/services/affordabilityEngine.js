function checkEligibility({

 currentExposure,

 requestedAmount,

 monthlyIncome,

 riskScore

}){

 const futureExposure =
  currentExposure +
  requestedAmount;

 const exposureRatio =
 futureExposure /
 monthlyIncome;

 let decision =
 "APPROVE";

 let reason =
 "Healthy affordability";

 if(
    exposureRatio > 0.7 ||
    riskScore < 40
 ){

    decision =
    "REJECT";

    reason =
    "Affordability threshold exceeded";
 }
 else if(
    exposureRatio > 0.4 ||
    riskScore < 70
 ){

    decision =
    "REVIEW";

    reason =
    "Manual review required";
 }

 return {

   currentExposure,

   requestedAmount,

   futureExposure,

   exposureRatio,

   riskScore,

   decision,

   reason
 };
}

module.exports =
checkEligibility;