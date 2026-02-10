// routes/doctor.routes.js
const express = require("express");
const router = express.Router();

const DoctorController = require("../controllers/doctor.controller");

// CREATE DOCTOR
router.post("/create", DoctorController.createDoctor);

module.exports = router;
