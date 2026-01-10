const router = require("express").Router();
const controller = require("../controllers/patientProfile.controller");
const auth = require("../middlewares/response.middleware");

router.get("/profile", auth, controller.getProfile);
router.post("/profile", auth, controller.saveProfile);

module.exports = router;
