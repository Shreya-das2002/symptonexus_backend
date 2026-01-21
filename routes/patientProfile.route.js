const router = require("express").Router();
const controller = require("../controllers/patientProfile.controller");

const response = require("../middlewares/response.middleware");

router.get("/profile", response, controller.getProfile);
router.post("/profile", response, controller.saveProfile);

module.exports = router;