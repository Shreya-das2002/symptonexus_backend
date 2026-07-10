const express = require("express");
const router = express.Router();

const FeedbackController = require("../controllers/feedback.controller");

const authMiddleware = require("../middlewares/auth.middleware");


/* ================= CREATE PATIENT FEEDBACK ================= */

router.post("/create", authMiddleware, FeedbackController.createPatientFeedback);


module.exports = router;