const express = require("express");
const router = express.Router();

const DoctorAvailabilityController = require("../controllers/slotAvailability.controller");

/* ADD / UPDATE SLOT */
router.post("/slot-booking", DoctorAvailabilityController.upsertSlot);

module.exports = router;