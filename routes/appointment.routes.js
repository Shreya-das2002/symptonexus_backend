const express = require("express");
const router = express.Router();

const AppointmentController = require("../controllers/appointment.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/create", authMiddleware, AppointmentController.createAppointment);
router.get("/list", authMiddleware, AppointmentController.getAllAppointments);
router.get("/slot-management-list", authMiddleware, AppointmentController.getSlotManagementList);
router.get("/pending-list", authMiddleware, AppointmentController.getPendingAppointmentsByAdmin);
router.put("/update-status", authMiddleware, AppointmentController.updateAppointmentStatus);
router.put("/cancel-appointment", authMiddleware, AppointmentController.cancelAppointment);
router.put("/assign-appointment-time", authMiddleware, AppointmentController.assignAppointmentTime);
router.put("/update-consultation-status", authMiddleware, AppointmentController.updateConsultationStatus);

module.exports = router;