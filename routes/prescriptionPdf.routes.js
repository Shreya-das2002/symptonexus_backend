const express = require("express");
const router = express.Router();

const PrescriptionPdfController = require("../controllers/prescriptionPdf.controller");
const authMiddleware = require("../middlewares/auth.middleware");


/* DOWNLOAD PRESCRIPTION PDF */
router.post("/prescription", authMiddleware, PrescriptionPdfController.generatePrescriptionPdf);

module.exports = router;