const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/admin.controller");

router.post("/create", AdminController.createAdmin);

module.exports = router;
