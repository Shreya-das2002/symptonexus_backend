const express = require("express");
const router = express.Router();

const AcknowledgementPdfController = require("../controllers/acknowledgementPdf.controller");

/* =====================================================
   ACKNOWLEDGEMENT PDF ROUTES
===================================================== */

/* DOWNLOAD ACKNOWLEDGEMENT PDF */
router.get(
  "/:appointment_id",
  AcknowledgementPdfController.generateAcknowledgementPdf
);

module.exports = router;