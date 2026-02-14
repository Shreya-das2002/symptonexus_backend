const express = require("express");

const router = express.Router();

const upload = require("../config/multer");

const applyDoctorController = require("../controllers/applyDoctor.controller");

router.post(
  "/apply-doctor",
  upload.single("cv"),
  applyDoctorController.applyDoctor
);

module.exports = router;
