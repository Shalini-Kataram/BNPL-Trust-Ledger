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

 const missedInstallments =
 customer.ledgerEvents.filter(
     e =>
      e.eventType ===
      "MISSED_INSTALLMENT"
 ).length;

 res.json({

    provider:
    customer.provider,

    customerHash:
    customer.customerHash,

    exposure,

    activePlans:
    customer.activePlans,

    monthlyCommitment,

    missedInstallments,

    ledgerEvents:
    customer.ledgerEvents

 });

});

module.exports = router;