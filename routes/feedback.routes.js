const express = require("express");
const router = express.Router();

const FeedbackController = require("../controllers/feedback.controller");

const authMiddleware = require("../middlewares/auth.middleware");


/* ================= CREATE PATIENT FEEDBACK ================= */

router.post("/patient", authMiddleware, FeedbackController.createPatientFeedback);

router.post("/doctor", authMiddleware, FeedbackController.createDoctorFeedback);

router.get("/patient-feedbacks", FeedbackController.getAllPatientFeedbacks);

router.get("/doctor-feedbacks", FeedbackController.getAllDoctorFeedbacks);

module.exports = router;