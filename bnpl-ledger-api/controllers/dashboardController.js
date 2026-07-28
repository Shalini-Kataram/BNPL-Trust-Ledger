const {
 getExposurePassport
} =
require("../services/exposureAggregator");

const calculateRisk =
require("../services/riskEngine");

async function dashboard(
 req,
 res
){

 const customerHash =
 req.params.customerHash;

 const providers =
 await getExposurePassport(
   customerHash
 );

 let totalExposure = 0;

 let activePlans = 0;

 let monthlyCommitment = 0;

 let defaults = 0;

 let missed = 0;

 providers.forEach(provider=>{

   if(provider.error){
      return;
   }

   totalExposure +=
   provider.exposure;

   activePlans +=
   provider.activePlans.length;

   monthlyCommitment +=
   provider.monthlyCommitment;

   defaults +=
   provider.defaults || 0;

   missed +=
   provider.missedInstallments || 0;
 });

 const riskScore =
 calculateRisk(
   providers
 );

 res.json({

   customerHash,

   trustScore:
   riskScore,

   riskLevel:
   riskScore >= 80
   ? "LOW"
   : riskScore >= 50
   ? "MEDIUM"
   : "HIGH",

   totalExposure,

   activePlans,

   monthlyCommitment,

   missedInstallments:
   missed,

   defaults,

   providers
 });
}

module.exports = {
 dashboard
};