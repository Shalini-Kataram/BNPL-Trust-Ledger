const router =
require("express").Router();

const ledger =
require("../services/ledgerService");

router.get(
"/",
async(req,res)=>{

 const events =
 await ledger.getAllEvents();

 res.json(events);
});

router.get(
"/customer/:customerHash",
async(req,res)=>{

 const events =
 await ledger.getCustomerEvents(
   req.params.customerHash
 );

 res.json(events);
});

router.delete(
"/",
async(req,res)=>{

 await ledger.clearLedger();

 res.json({
   success:true,
   message:"Ledger cleared"
 });
});

module.exports = router;
