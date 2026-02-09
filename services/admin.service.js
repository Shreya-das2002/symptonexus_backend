const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

/* ================= IMPORT MODELS ================= */

const User = require("../models/User");
const Admin = require("../models/Admin_user");
const DomainLookup = require("../models/Domain_lookup");

const Role = require("../models/Role");
const UserRoleMapping = require("../models/User_role_mapping");


class AdminService {

  /* =====================================================
     CREATE ADMIN (ONLY ROLE 2 AND 3 ALLOWED)
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
        admin_type,
        gender,
        password
      } = payload;


      /* ===== RESTRICT ROLE CREATION ===== */

      if (![2, 3].includes(admin_type)) {

        await t.rollback();

        return {
          success: false,
          message: "Super Admin can create only Standard Admin or Guest Admin"
        };

      }


      /* ===== CHECK EMAIL EXISTS ===== */

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


      /* ===== GET ROLE ===== */

      const role = await Role.findByPk(admin_type, {

        transaction: t

      });

      if (!role) {

        await t.rollback();

        return {
          success: false,
          message: "Invalid role"
        };

      }


      /* ===== GET GENDER ===== */

      let genderId = null;

      if (gender) {

        const genderLookup = await DomainLookup.findOne({

          where: {
            domain_type: "gender",
            domain_value: gender
          },

          transaction: t

        });

        genderId = genderLookup?.domain_lookup_id || null;

      }


      /* ===== CREATE ADMIN PROFILE ===== */

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


      /* ===== CREATE USER LOGIN ===== */

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({

        user_name: email,
        password: hashedPassword,
        user_type: role.role_id,
        ref_id: admin.admin_user_id,
        status: "Active",
        created_by: createdBy

      }, { transaction: t });


      /* ===== PERMANENT ROLE SYNC (UPSERT) ===== */

      await UserRoleMapping.upsert({

        user_id: newUser.user_id,
        role_id: role.role_id,
        status: 1

      }, { transaction: t });


      await t.commit();


      /* ===== RESPONSE ===== */

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
     AUTO SYNC ROLE MAPPING FOR ALL USERS
  ===================================================== */

  static async syncAllRoleMappings() {

    try {

      const users = await User.findAll();

      for (const user of users) {

        if (!user.user_type) continue;

        await UserRoleMapping.upsert({

          user_id: user.user_id,
          role_id: user.user_type,
          status: 1

        });

      }

      return {

        success: true,
        message: "All role mappings synced successfully"

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



  /* =====================================================
     GET ALL ADMINS WITH PERMANENT ROLE FIX
  ===================================================== */

  static async getAllAdmins() {

  try {

    const admins = await Admin.findAll({

      attributes: [
        "admin_user_id",
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "phone_no",
        "created_on"
      ],

      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "user_type"],

          where: {
            user_type: [2, 3]  // ✅ FILTER ONLY ADMINS
          },

          include: [
            {
              model: Role,
              as: "roles",
              attributes: ["role_id", "role_name"]
            }
          ]
        }
      ]

    });

    const result = admins.map(admin => ({

      admin_user_id: admin.admin_user_id,

      first_name: admin.first_name,
      middle_name: admin.middle_name,
      last_name: admin.last_name,

      email: admin.email,
      phone_no: admin.phone_no,

      role: admin.user?.roles?.[0]?.role_name || "Unknown",

      created_on: admin.created_on

    }));


    return {
      success: true,
      data: result
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
