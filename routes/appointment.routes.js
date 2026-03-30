const express = require("express");
const router = express.Router();

const AppointmentController = require("../controllers/appointment.controller");

router.post("/create", AppointmentController.createAppointment);

module.exports = router;