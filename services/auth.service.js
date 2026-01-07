const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/patient");
const Admin = require("../models/Admin_user");
const PatientDetails = require("../models/Patient_Details");

class AuthService {

  static async login(email, password) {

    // Step-1: find user
    const user = await User.findOne({ where: { user_name: email } });

    if (!user) {
      return { success: false, message: "User ID is not valid" };
    }

    // Step-2: check password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return { success: false, message: "Password not match" };
    }

    // Step-3: determine role & load profile
    let role = "";
    let profile = null;
    const userType = Number(user.user_type);

    switch (userType) {
      case 5:
        role = "patient";
        profile = await Patient.findOne({ where: { email } });
        break;

      case 4:
        role = "doctor";
        profile = await Doctor.findOne({ where: { email } });
        break;

      case 1:
      case 2:
      case 3:
        role = "admin";
        profile = await Admin.findOne({ where: { email } });
        break;

      default:
        return { success: false, message: "Invalid user type" };
    }

    if (!profile) {
      return { success: false, message: "Profile not found" };
    }

    // Step-4: create token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_name: user.user_name,
        user_type: user.user_type
      },
      process.env.JWT_SECRET || "my_secret_key",
      { expiresIn: "1d" }
    );

    return {
      success: true,
      data: {
        token,
        role,
        user: profile
      }
    };
  }

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

    if (!email || !phone) {
      return { success: false, message: "Missing required fields" };
    }

    const emailExists = await User.findOne({ where: { user_name: email } });
    if (emailExists) {
      return { success: false, message: "Email already registered" };
    }

    if (password !== confirm_password) {
      return { success: false, message: "Passwords do not match" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
      first_name,
      middle_name,
      last_name,
      email,
      phone,
      gender
    });

    await PatientDetails.create({
      patient_id: patient.patient_id
    });

    await User.create({
      user_name: email,
      password: hashedPassword,
      user_type: 5,
      ref_id: patient.patient_id,
      gender,
      status: "Active"
    });

    return {
      success: true,
      data: { patient }
    };
  }
}

module.exports = AuthService;
