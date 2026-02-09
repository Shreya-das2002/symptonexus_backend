const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Role = require("../models/Role");
const UserRoleMapping = require("../models/User_role_mapping");

const Doctor = require("../models/Doctor");
const Patient = require("../models/patient");
const Admin = require("../models/Admin_user");

const PatientDetails = require("../models/Patient_Details");
const DomainLookup = require("../models/Domain_lookup");

const ControlMaster = require("../models/Control_master");
const ControlRoleMapping = require("../models/Control_role_mapping");


class AuthService {


/* =====================================================
   LOGIN
===================================================== */

static async login(email, password, roleFromUI) {

  const t = await sequelize.transaction();

  try {

    const normalizedRole = roleFromUI?.toLowerCase();

    if (!normalizedRole) {

      await t.rollback();

      return {
        success: false,
        message: "Role is required"
      };

    }


    /* ================= FIND USER ================= */

    const user = await User.findOne({

      where: { user_name: email },
      transaction: t

    });


    if (!user) {

      await t.rollback();

      return {
        success: false,
        message: "User ID is not valid"
      };

    }



    /* ================= PASSWORD CHECK ================= */

    const match = await bcrypt.compare(password, user.password);

    if (!match) {

      await t.rollback();

      return {
        success: false,
        message: "Password not match"
      };

    }



    /* ================= GET ROLE ================= */

    const roleMapping = await UserRoleMapping.findOne({

      where: {
        user_id: user.user_id,
        status: 1
      },

      include: [{
        model: Role,
        attributes: ["role_id", "role_name"]
      }],

      transaction: t

    });


    if (!roleMapping) {

      await t.rollback();

      return {
        success: false,
        message: "Role not assigned"
      };

    }


    const role_id = roleMapping.role_id;
    const role = roleMapping.Role.role_name.toLowerCase();



    /* ================= ROLE VALIDATION ================= */

    if (normalizedRole === "admin") {

      if (!["super admin", "standard admin", "guest admin"].includes(role)) {

        await t.rollback();

        return {
          success: false,
          message: "This account is not registered as admin"
        };

      }

    }

    else {

      if (normalizedRole !== role) {

        await t.rollback();

        return {
          success: false,
          message: `This account is not registered as ${normalizedRole}`
        };

      }

    }



    /* ================= LOAD PROFILE ================= */

    let profile = null;

    if (role === "patient") {

      profile = await Patient.findOne({

        where: { patient_id: user.ref_id },
        transaction: t

      });

    }

    else if (role === "doctor") {

      profile = await Doctor.findOne({

        where: { doctor_id: user.ref_id },
        transaction: t

      });

    }

    else {

      profile = await Admin.findOne({

        where: { admin_user_id: user.ref_id },
        transaction: t

      });

    }


    if (!profile) {

      await t.rollback();

      return {
        success: false,
        message: "Profile not found"
      };

    }



    /* ================= PATIENT DETAILS ================= */

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



    /* ================= LOAD MENUS ================= */

    const menus = await ControlMaster.findAll({

      include: [{
        model: ControlRoleMapping,
        where: { role_id: role_id },
        attributes: []
      }],

      where: {
        control_type: "menu",
        status: "Active"
      },

      order: [["control_master_id", "ASC"]],

      transaction: t

    });



    /* ================= BUILD USER DATA ================= */

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
        middle_name: profile.middle_name,
        last_name: profile.last_name,
        phone_no: profile.phone_no,
        gender: ""

      };

    }


    if (role.includes("admin")) {

      userData = {

        ...userData,

        admin_id: profile.admin_user_id,
        first_name: profile.first_name,
        middle_name: profile.middle_name,
        last_name: profile.last_name,
        phone_no: profile.phone_no,
        gender: profile.gender || ""

      };

    }



    /* ================= TOKEN ================= */

    const tokenPayload = {

      user_id: user.user_id,
      role_id,
      role

    };


    if (role === "patient")
      tokenPayload.patient_id = profile.patient_id;

    if (role === "doctor")
      tokenPayload.doctor_id = profile.doctor_id;

    if (role.includes("admin"))
      tokenPayload.admin_id = profile.admin_user_id;



    const token = jwt.sign(

      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" }

    );



    await t.commit();



    return {

      success: true,

      data: {

        token,
        role,
        user: userData,
        menus

      }

    };


  }

  catch (error) {

    await t.rollback();

    console.error("LOGIN ERROR:", error);

    return {

      success: false,
      message: "Login failed"

    };

  }

}



/* =====================================================
   SIGNUP PATIENT
===================================================== */

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


    if (!email || !phone) {

      await t.rollback();

      return {
        success: false,
        message: "Missing required fields"
      };

    }



    const emailExists = await User.findOne({

      where: { user_name: email },
      transaction: t

    });


    if (emailExists) {

      await t.rollback();

      return {
        success: false,
        message: "Email already registered"
      };

    }



    if (password !== confirm_password) {

      await t.rollback();

      return {
        success: false,
        message: "Password do not match"
      };

    }



    const hashedPassword = await bcrypt.hash(password, 10);



    /* ================= CREATE PATIENT ================= */

    const patient = await Patient.create({

      first_name,
      middle_name,
      last_name,
      email,
      phone_no: phone

    }, { transaction: t });



    /* ================= GENDER ================= */

    let genderId = null;

    if (gender) {

      const lookup = await DomainLookup.findOne({

        where: {
          domain_type: "gender",
          domain_value: gender
        },

        transaction: t

      });

      genderId = lookup?.domain_lookup_id || null;

    }



    await PatientDetails.create({

      patient_id: patient.patient_id,
      gender: genderId

    }, { transaction: t });



    /* ================= GET ROLE ================= */

    const role = await Role.findOne({

      where: { role_name: "patient" },
      transaction: t

    });


    if (!role) {

      await t.rollback();

      return {
        success: false,
        message: "Role not found"
      };

    }



    /* ================= CREATE USER ================= */

    const newUser = await User.create({

      user_name: email,
      password: hashedPassword,
      user_type: role.role_id,
      ref_id: patient.patient_id,
      status: "Active"

    }, { transaction: t });



    /* ================= MAP ROLE ================= */

    await UserRoleMapping.create({

      user_id: newUser.user_id,
      role_id: role.role_id,
      status: 1

    }, { transaction: t });



    await t.commit();



    return {

      success: true,
      message: "Patient registered successfully",
      data: {
    user_id: newUser.user_id,
    email: newUser.user_name,
    role: role.role_name,
    patient_id: patient.patient_id,
    first_name: patient.first_name,
    middle_name: patient.middle_name,
    last_name: patient.last_name,
    phone_no: patient.phone_no,
    gender: gender || null,
    created_on: newUser.created_on
  }

    };


  }

  catch (error) {

    await t.rollback();

    console.error("SIGNUP ERROR:", error);

    return {

      success: false,
      message: error.message

    };

  }

}


}

module.exports = AuthService;
