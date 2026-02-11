// routes/doctor.routes.js
const express = require("express");
const router = express.Router();

const DoctorController = require("../controllers/doctor.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// CREATE DOCTOR
router.post("/create", DoctorController.createDoctor);
router.get("/pending-doctors", DoctorController.getPendingDoctors);
router.put("/update-status", authMiddleware, DoctorController.updateDoctorStatus);

module.exports = router;
