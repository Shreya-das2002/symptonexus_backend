const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/patient");
const Admin = require("../models/Admin_user");
const PatientDetails = require("../models/Patient_Details");
const DomainLookup = require("../models/Domain_lookup");

class AuthService {

  // ===================== LOGIN =====================
  static async login(email, password) {

    const user = await User.findOne({ where: { user_name: email } });
    if (!user) return { success: false, message: "User ID is not valid" };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { success: false, message: "Password not match" };

    let role = "";
    let profile = null;
    const userType = Number(user.user_type);

    if (userType === 5) {
      role = "patient";
      profile = await Patient.findOne({ where: { email } });
    } else if (userType === 4) {
      role = "doctor";
      profile = await Doctor.findOne({ where: { email } });
    } else {
      role = "admin";
      profile = await Admin.findOne({ where: { email } });
    }

    if (!profile) return { success: false, message: "Profile not found" };

    const token = jwt.sign(
      { user_id: user.user_id, user_type: user.user_type },
      process.env.JWT_SECRET || "my_secret_key",
      { expiresIn: "1d" }
    );

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
        }]
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

    return {
      success: true,
      data: { token, role, user: userData }
    };
  }

  // ===================== SIGNUP =====================
  static async signupPatient(payload) {

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

    const emailExists = await User.findOne({ where: { user_name: email } });
    if (emailExists)
      return { success: false, message: "Email already registered" };

    if (password !== confirm_password)
      return { success: false, message: "Passwords do not match" };

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
      first_name,
      middle_name,
      last_name,
      email,
      phone_no: phone
    });

    // Convert gender text → numeric lookup ID
    let genderId = null;

    if (gender) {
      const lookup = await DomainLookup.findOne({
        where: {
          domain_type: "gender",
          domain_value: gender
        }
      });

      if (!lookup) {
        throw new Error("Invalid gender value");
      }

      genderId = lookup.domain_lookup_id;
    }

    await PatientDetails.create({
      patient_id: patient.patient_id,
      gender: genderId
    });

    await User.create({
      user_name: email,
      password: hashedPassword,
      user_type: 5,
      ref_id: patient.patient_id,
      status: "Active"
    });

    // Build clean response with gender text
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
  }
}

module.exports = AuthService;
