const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const Doctor = require("../models/Doctor");
const DoctorDetails = require("../models/Doctor_Details");
const DoctorSpecialization = require("../models/Doctor_specalization");

const User = require("../models/User");
const Role = require("../models/Role");
const UserRoleMapping = require("../models/User_role_mapping");
const DomainLookup = require("../models/Domain_lookup");


class DoctorService {

  static async createDoctor(payload, createdBy = null) {

    const t = await sequelize.transaction();

    try {

      const {
        first_name,
        middle_name,
        last_name,
        email,
        phone_no,
        gender,
        specialization,
        password,
        confirm_password
      } = payload;


      /* VALIDATION */

      if (!first_name || !last_name || !email || !phone_no ||
          !gender || !specialization || !password || !confirm_password) {

        await t.rollback();

        return {
          success: false,
          message: "All required fields are required"
        };
      }


      /* PASSWORD CHECK */

      if (password !== confirm_password) {

        await t.rollback();

        return {
          success: false,
          message: "Password mismatch"
        };
      }


      /* EMAIL CHECK */

      const existingUser = await User.findOne({
        where: { user_name: email },
        transaction: t
      });

      if (existingUser) {

        await t.rollback();

        return {
          success: false,
          message: "Email already exists"
        };
      }


      /* GENDER CHECK */

      const genderLookup = await DomainLookup.findOne({
        where: {
          domain_type: "gender",
          domain_value: gender
        },
        transaction: t
      });

      if (!genderLookup) {

        await t.rollback();

        return {
          success: false,
          message: "Invalid gender"
        };
      }


      /* SPECIALIZATION CHECK */

      const specializationLookup = await DomainLookup.findOne({
        where: {
          domain_type: "specialization",
          domain_value: specialization
        },
        transaction: t
      });

      if (!specializationLookup) {

        await t.rollback();

        return {
          success: false,
          message: "Invalid specialization"
        };
      }


      /* ROLE CHECK */

      const role = await Role.findOne({
        where: { role_name: "doctor" },
        transaction: t
      });

      if (!role) {

        await t.rollback();

        return {
          success: false,
          message: "Doctor role not found"
        };

      }


      /* CREATE DOCTOR */

      const doctor = await Doctor.create({

        first_name,
        middle_name,
        last_name,
        email,
        phone_no,
        status: "Pending",
        created_by: createdBy

      }, { transaction: t });


      /* CREATE DOCTOR DETAILS */

      await DoctorDetails.create({

        doctor_id: doctor.doctor_id,
        gender: genderLookup.domain_value

      }, { transaction: t });


      /* CREATE SPECIALIZATION */

      await DoctorSpecialization.create({

        doctor_id: doctor.doctor_id,
        specialization_id: specializationLookup.domain_value,
        status: 1

      }, { transaction: t });


      /* HASH PASSWORD */

      const hashedPassword = await bcrypt.hash(password, 10);


      /* CREATE USER */

      const user = await User.create({

        user_name: email,
        password: hashedPassword,
        user_type: role.role_id,
        ref_id: doctor.doctor_id,
        status: "Pending",
        created_by: createdBy

      }, { transaction: t });


      /* ROLE MAPPING */

      await UserRoleMapping.create({

        user_id: user.user_id,
        role_id: role.role_id,
        status: 1

      }, { transaction: t });


      await t.commit();


      return {

        success: true,
        message: "Doctor created successfully",
        data: {
          doctor_id: doctor.doctor_id,
          email: doctor.email,
          status: doctor.status
        }

      };

    }

    catch (error) {

      await t.rollback();

      console.error("CREATE DOCTOR ERROR:", error);

      return {
        success: false,
        message: error.message
      };

    }

  }

}

module.exports = DoctorService;
