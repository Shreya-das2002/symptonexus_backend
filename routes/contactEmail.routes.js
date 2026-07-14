const express = require("express");
const ContactEmailController = require("../controllers/contactEmail.controller");

const router = express.Router();

/* ================= CONTACT EMAIL ROUTE ================= */

router.post(
  "/send-message",
  ContactEmailController.sendContactMessage
);

module.exports = router;