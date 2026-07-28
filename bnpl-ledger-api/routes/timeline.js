const router =
require("express").Router();

const {
  getTimeline
} =
require("../controllers/timelineController");

router.get(
  "/:customerHash",
  getTimeline
);

module.exports = router;