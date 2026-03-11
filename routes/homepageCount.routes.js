const express = require("express");

const router = express.Router();

const DashboardController = require("../controllers/homepageCount.controller");

router.get(
  "/dashboard-count",
  DashboardController.getDashboardCount
);

module.exports = router;