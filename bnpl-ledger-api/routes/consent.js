const router =
require("express").Router();

const {
  grantConsent
} =
require("../controllers/consentController");

router.post(
  "/",
  grantConsent
);

module.exports = router;