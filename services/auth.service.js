const sequelize = require("../config/database"); 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/patient");
const Admin = require("../models/Admin_user");
const PatientDetails = require("../models/Patient_Details");
const DomainLookup = require("../models/Domain_lookup");
const { SUCCESS } = require("../constants/statusCodes");

class AuthService {

  // ===================== LOGIN =====================
 static async login(email, password) {
  const t = await sequelize.transaction();

  try {
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

    let role = "";
    let profile = null;

    if (+user.user_type === 5) {
      role = "patient";
      profile = await Patient.findOne({
        where: { email },
        transaction: t
      });
    } else if (+user.user_type === 4) {
      role = "doctor";
      profile = await Doctor.findOne({
        where: { email },
        transaction: t
      });
    } else {
      role = "admin";
      profile = await Admin.findOne({
        where: { email },
        transaction: t
      });
    }

    if (!profile) {
      await t.rollback();
      return { success: false, message: "Profile not found" };
    }

    let userData = {
      email: profile.email,
      role
    };

    if (role === "patient") {
      const details = await PatientDetails.findOne({
        where: { patient_id: profile.patient_id },
        include: [{
          model: DomainLookup,
          as: "genderLookup",
          attributes: ["domain_value"]
        }],
        transaction: t
      });

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

    const token = jwt.sign(
      { user_id: user.user_id, user_type: user.user_type },
      process.env.JWT_SECRET || "my_secret_key",
      { expiresIn: "1d" }
    );

    await t.commit();

    return {
      success: true,
      data: { token, role, user: userData }
    };

  } catch (error) {
    await t.rollback();
    console.error("LOGIN TRANSACTION ERROR:", error);

    return {
      success: false,
      message: "Login failed"
    };
  }
}


  // ===================== SIGNUP =====================
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

    if (emailExists)
      return { success: false, message: "Email already registered" };

    if (password !== confirm_password)
      return { success: false, message: "Passwords do not match" };

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1️⃣ Patient
    const patient = await Patient.create({
      first_name,
      middle_name,
      last_name,
      email,
      phone_no: phone
    }, { transaction: t });

    // 2️⃣ Gender lookup
    let genderId = null;

    if (gender) {
      const lookup = await DomainLookup.findOne({
        where: {
          domain_type: "gender",
          domain_value: gender
        },
        transaction: t
      });

      if (!lookup) {
        throw new Error("Invalid gender value");
      }

      genderId = lookup.domain_lookup_id;
    }

    // 3️⃣ Patient details
    await PatientDetails.create({
      patient_id: patient.patient_id,
      gender: genderId
    }, { transaction: t });

    // 4️⃣ User
    await User.create({
      user_name: email,
      password: hashedPassword,
      user_type: 5,
      ref_id: patient.patient_id,
      status: "Active"
    }, { transaction: t });

    await t.commit();

    // Fetch response (outside transaction)
    const patientDetails = await PatientDetails.findOne({
      where: { patient_id: patient.patient_id },
      include: [{
        model: DomainLookup,
        as: "genderLookup",
        attributes: ["domain_value"]
      }]
    });

    return {
      success: true,
      patient: {
        patient_id: patient.patient_id,
        first_name: patient.first_name,
        middle_name: patient.middle_name,
        last_name: patient.last_name,
        email: patient.email,
        phone_no: patient.phone_no,
        gender: patientDetails?.genderLookup?.domain_value || ""
      }
    };

  } catch (error) {
    await t.rollback();
    console.error("SIGNUP TRANSACTION ERROR:", error);

    return {
      success: false,
      message: error.message || "Signup failed"
    };
  }
}
}

module.exports = AuthService;
