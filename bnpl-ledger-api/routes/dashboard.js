const router =
require("express").Router();

const {
 dashboard
} =
require("../controllers/dashboardController");

router.get(
"/:customerHash",
dashboard
);

module.exports = router;