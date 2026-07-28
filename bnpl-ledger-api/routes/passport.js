const router =
require("express").Router();

const {
  getPassport
} =
require("../controllers/passportController");

router.post(
  "/",
  getPassport
);

module.exports = router;