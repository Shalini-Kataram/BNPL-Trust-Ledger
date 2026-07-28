const router =
require("express").Router();

const {
  checkEligibility
} =
require("../controllers/eligibilityController");

router.post(
  "/",
  checkEligibility
);

module.exports = router;