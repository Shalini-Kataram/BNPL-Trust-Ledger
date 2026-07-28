const router =
require("express").Router();

const customers =
require("../data/customerData");

router.get(
"/:customerHash",
(req,res)=>{

 const customer =
   customers[
     req.params.customerHash
   ];

 if(!customer){

   return res.status(404).json({
      message:"Customer not found"
   });
 }

 const exposure =
 customer.activePlans.reduce(
   (sum, plan) =>
      sum + plan.amount,
   0
 );

 const monthlyCommitment =
 customer.activePlans.reduce(
   (sum, plan) =>
      sum + plan.monthlyPayment,
   0
 );

 const partialRepayments =
 customer.ledgerEvents.filter(
   e =>
    e.eventType ===
    "PARTIAL_REPAYMENT"
 ).length;

 const closedPlans =
 customer.ledgerEvents.filter(
   e =>
    e.eventType ===
    "PLAN_CLOSED"
 ).length;

 res.json({

   provider:
    customer.provider,

   customerHash:
    customer.customerHash,

   exposure,

   monthlyCommitment,

   partialRepayments,

   closedPlans,

   activePlans:
    customer.activePlans,

   ledgerEvents:
    customer.ledgerEvents

 });

});

module.exports = router;