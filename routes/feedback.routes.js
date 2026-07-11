const express = require("express");
const router = express.Router();

const FeedbackController = require("../controllers/feedback.controller");

const authMiddleware = require("../middlewares/auth.middleware");


/* ================= CREATE PATIENT FEEDBACK ================= */

router.post("/patient", authMiddleware, FeedbackController.createPatientFeedback);

/* ================= CREATE DOCTOR FEEDBACK ================= */

router.post("/doctor", authMiddleware, FeedbackController.createDoctorFeedback);

module.exports = router;