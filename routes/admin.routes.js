const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/admin.controller");

router.post("/create", AdminController.createAdmin);

router.get("/alladmins", AdminController.getAllAdmins);

module.exports = router;
