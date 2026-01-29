const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/patient");
const Admin = require("../models/Admin_user");
const PatientDetails = require("../models/Patient_Details");
const DomainLookup = require("../models/Domain_lookup");
const ControlMaster = require("../models/Control_master");
const ControlRoleMapping = require("../models/Control_role_mapping");

/* ================= ROLE MAP ================= */
const ROLE_MAP = {
  "patient": 5,
  "doctor": 4,
  "super admin": 1,
  "standard admin": 2,
  "guest admin": 3
};

class AuthService {

  /* ===================== LOGIN ===================== */
  static async login(email, password, roleFromUI) {
    const t = await sequelize.transaction();

    try {
      let normalizedRole = roleFromUI?.toLowerCase();

if (normalizedRole === "admin") {
  normalizedRole = "super admin"; // default admin login
}

      const user = await User.findOne({
        where: { user_name: email },
        transaction: t
      });

      
      if (!user) {
        await t.rollback();
        return { success: false, message: "User ID is not valid" };
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        await t.rollback();
        return { success: false, message: "Password not match" };
      }

      if (
        !normalizedRole ||
        !ROLE_MAP[normalizedRole] ||
        Number(user.user_type) !== ROLE_MAP[normalizedRole]
      ) {
        await t.rollback();
        return {
          success: false,
          message: `This account is not registered as ${normalizedRole}`
        };
      }

      /* ================= LOAD PROFILE ================= */
      const userType = Number(user.user_type);
      let role = "";
      let profile = null;

      if (userType === 5) {
        role = "patient";
        profile = await Patient.findOne({ where: { email }, transaction: t });

      } else if (userType === 4) {
        role = "doctor";
        profile = await Doctor.findOne({ where: { email }, transaction: t });

      } else if ([1, 2, 3].includes(userType)) {
        role =
          userType === 1 ? "super admin" :
          userType === 2 ? "standard admin" :
          "guest admin";

        profile = await Admin.findOne({ where: { email }, transaction: t });
      }

      if (!profile) {
        await t.rollback();
        return { success: false, message: "Profile not found" };
      }

      /* ================= LOAD DETAILS ================= */
      let details = null;

      if (role === "patient") {
        details = await PatientDetails.findOne({
          where: { patient_id: profile.patient_id },
          include: [{
            model: DomainLookup,
            as: "genderLookup",
            attributes: ["domain_value"]
          }],
          transaction: t
        });
      }

      /* ================= LOAD SIDENAV MENUS ================= */
const menus = await ControlMaster.findAll({
  include: [{
    model: ControlRoleMapping,
    where: { role_id: Number(user.user_type) },
    attributes: []
  }],
  where: {
    control_type: "menu",
    status: "Active"
  },
  order: [["control_master_id", "ASC"]],
  transaction: t
});

      /* ================= BUILD RESPONSE ================= */
      let userData = {
        email: profile.email,
        role
      };

      if (role === "patient") {
        userData = {
          ...userData,
          patient_id: profile.patient_id,
          first_name: profile.first_name,
          middle_name: profile.middle_name,
          last_name: profile.last_name,
          phone_no: profile.phone_no,
          gender: details?.genderLookup?.domain_value || ""
        };
      }

      if (role === "doctor") {
        userData = {
          ...userData,
          doctor_id: profile.doctor_id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_no: profile.phone_no
        };
      }

      if (role.includes("admin")) {
        userData = {
          ...userData,
          admin_id: profile.admin_id,
          name: profile.name
        };
      }

      /* ================= TOKEN ================= */
      const tokenPayload = {
        user_id: user.user_id,
        user_type: user.user_type,
        role
      };

      if (role === "patient") tokenPayload.patient_id = profile.patient_id;
      if (role === "doctor") tokenPayload.doctor_id = profile.doctor_id;
      if (role.includes("admin")) tokenPayload.admin_id = profile.admin_id;

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      await t.commit();

      return {
        success: true,
        data: { token, role, user: userData,  menus  }
      };

    } catch (error) {
      await t.rollback();
      console.error("LOGIN ERROR:", error);
      return { success: false, message: "Login failed" };
    }
  }

  /* ===================== SIGNUP (PATIENT) ===================== */
  static async signupPatient(payload) {
    const t = await sequelize.transaction();

    try {
      const {
        first_name,
        middle_name,
        last_name,
        email,
        phone,
        password,
        confirm_password,
        gender
      } = payload;

      if (!email || !phone)
        return { success: false, message: "Missing required fields" };

      const emailExists = await User.findOne({
        where: { user_name: email },
        transaction: t
      });

      if (emailExists) {
        await t.rollback();
        return { success: false, message: "Email already registered" };
      }

      if (password !== confirm_password) {
        await t.rollback();
        return { success: false, message: "Password do not match" };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const patient = await Patient.create({
        first_name,
        middle_name,
        last_name,
        email,
        phone_no: phone
      }, { transaction: t });

      let genderId = null;
      if (gender) {
        const lookup = await DomainLookup.findOne({
          where: { domain_type: "gender", domain_value: gender },
          transaction: t
        });
        genderId = lookup?.domain_lookup_id || null;
      }

      await PatientDetails.create({
        patient_id: patient.patient_id,
        gender: genderId
      }, { transaction: t });

      await User.create({
        user_name: email,
        password: hashedPassword,
        user_type: 5,
        ref_id: patient.patient_id,
        status: "Active"
      }, { transaction: t });

      await t.commit();

      return { success: true };

    } catch (error) {
      await t.rollback();
      console.error("SIGNUP ERROR:", error);
      return { success: false, message: error.message };
    }
  }
}

module.exports = AuthService;
