const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

/* ================= IMPORT MODELS ================= */

const User = require("../models/User");
const Admin = require("../models/Admin_user");
const DomainLookup = require("../models/Domain_lookup");

const Role = require("../models/Role"); // ✅ REQUIRED
const UserRoleMapping = require("../models/User_role_mapping"); // ✅ REQUIRED


class AdminService {

  /* =====================================================
     CREATE ADMIN
  ===================================================== */

  static async createAdmin(payload, createdBy = null) {

    const t = await sequelize.transaction();

    try {

      const {
        first_name,
        middle_name,
        last_name,
        email,
        phone_no,
        admin_type,   // role_id (1,2,3)
        gender,
        password
      } = payload;



      /* ================= CHECK EMAIL EXISTS ================= */

      const userExists = await User.findOne({

        where: { user_name: email },
        transaction: t

      });

      if (userExists) {

        await t.rollback();

        return {
          success: false,
          message: "Email already exists"
        };

      }



      /* ================= GET ROLE ================= */

      const role = await Role.findOne({

        where: { role_id: admin_type },
        transaction: t

      });

      if (!role) {

        await t.rollback();

        return {
          success: false,
          message: "Invalid admin role"
        };

      }



      /* ================= GET GENDER ================= */

      let genderId = null;

      if (gender) {

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

        genderId = genderLookup.domain_lookup_id;

      }



      /* ================= CREATE ADMIN PROFILE ================= */

      const admin = await Admin.create({

        first_name,
        middle_name,
        last_name,
        email,
        phone_no,
        gender: genderId,
        status: "Active",
        created_by: createdBy

      }, { transaction: t });



      /* ================= CREATE USER LOGIN ================= */

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({

        user_name: email,
        password: hashedPassword,
        user_type: role.role_id,     // keep for compatibility
        ref_id: admin.admin_user_id,
        status: "Active",
        created_by: createdBy

      }, { transaction: t });



      /* ================= ASSIGN ROLE (CRITICAL) ================= */

      await UserRoleMapping.create({

        user_id: newUser.user_id,
        role_id: role.role_id,
        status: 1

      }, { transaction: t });



      /* ================= COMMIT ================= */

      await t.commit();



      /* ================= RESPONSE ================= */

      return {

        success: true,

        message: "Admin created successfully",

        data: {

          user_id: newUser.user_id,

          admin_user_id: admin.admin_user_id,

          first_name: admin.first_name,
          middle_name: admin.middle_name,
          last_name: admin.last_name,

          email: admin.email,
          phone_no: admin.phone_no,

          gender: gender || null,

          role_id: role.role_id,
          role: role.role_name,

          created_on: admin.created_on

        }

      };

    }

    catch (error) {

      await t.rollback();

      console.error("CREATE ADMIN ERROR:", error);

      return {

        success: false,
        message: error.message

      };

    }

  }


  /* =====================================================
     OPTIONAL FIX FOR OLD USERS
  ===================================================== */

  static async fixMissingRoleMappings() {

    try {

      const users = await User.findAll();

      for (const user of users) {

        const exists = await UserRoleMapping.findOne({

          where: { user_id: user.user_id }

        });

        if (!exists && user.user_type) {

          await UserRoleMapping.create({

            user_id: user.user_id,
            role_id: user.user_type,
            status: 1

          });

        }

      }

      return {

        success: true,
        message: "Missing role mappings fixed"

      };

    }

    catch (error) {

      console.error(error);

      return {

        success: false,
        message: error.message

      };

    }

  }

}

module.exports = AdminService;
