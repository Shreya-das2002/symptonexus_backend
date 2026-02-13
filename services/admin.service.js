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
      department_id,
      gender,
      password,
      confirm_password,
    } = payload;

    /* VALIDATIONS */

    if (!first_name || !email || !password || !confirm_password || !admin_type) {

      await t.rollback();

      return {
        success: false,
        message: "Required fields missing"
      };

    }

    if (password !== confirm_password) {

      await t.rollback();

      return {
        success: false,
        message: "Password mismatch"
      };

    }

    if (![2, 3].includes(admin_type)) {

      await t.rollback();

      return {
        success: false,
        message: "Invalid admin type"
      };

    }

    if (admin_type == 2 && !department_id) {

  await t.rollback();

  return {
    success: false,
    message: "Department is required for Standard Admin"
  };

}

    /* CHECK EMAIL */

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

    /* GET ROLE */

    const role = await Role.findByPk(admin_type, {
      transaction: t
    });

    /* GET GENDER */

    let genderId = null;

    if (gender) {

      const genderLookup = await DomainLookup.findOne({

        where: {
          domain_type: "gender",
          domain_value: gender
        },

        transaction: t

      });

      genderId = genderLookup?.domain_lookup_id;

    }

    /* CREATE ADMIN */

    const admin = await Admin.create({

      first_name,
      middle_name,
      last_name,
      email,
      phone_no,
      gender: genderId,
      department_id: admin_type == 2 ? department_id : null,
      status: "Active",
      created_by: createdBy

    }, { transaction: t });

    /* CREATE USER */

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({

      user_name: email,
      password: hashedPassword,
      user_type: role.role_id,
      ref_id: admin.admin_user_id,
      status: "Active",
      created_by: createdBy

    }, { transaction: t });

    /* ROLE MAPPING */

    await UserRoleMapping.create({

      user_id: newUser.user_id,
      role_id: role.role_id,
      status: 1

    }, { transaction: t });

    /* COMMIT TRANSACTION */

    await t.commit();

    /* FETCH CREATOR ROLE AFTER COMMIT */

  const creatorRole = await Role.findByPk(createdBy, {
  attributes: ["role_name"]
});

    /* RESPONSE */

    return {

      success: true,

      message: "Admin created successfully",

      data: {

        admin_user_id: admin.admin_user_id,

        first_name: admin.first_name,

        last_name: admin.last_name,

        email: admin.email,

        role: role.role_name,


        created_by: creatorRole?.role_name || null

      }

    };

  }

  catch (error) {

    if (t && !t.finished) {
      await t.rollback();
    }

    console.error("CREATE ADMIN ERROR:", error);

    return {
      success: false,
      message: error.message
    };

  }

}

  /* =====================================================
     GET ALL ADMINS
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
              user_type: [1, 2, 3]
            },

            include: [
              {
                model: UserRoleMapping,
                as: "UserRoleMappings",

                attributes: ["role_id"],

                include: [
                  {
                    model: Role,
                    as: "Role",

                    attributes: ["role_id", "role_name"]
                  }
                ]
              }
            ]
          }
        ]

      });


      /* =====================================================
         FORMAT RESPONSE
      ===================================================== */

      const result = admins.map(admin => ({

        admin_user_id: admin.admin_user_id,

        first_name: admin.first_name,
        middle_name: admin.middle_name,
        last_name: admin.last_name,

        email: admin.email,

        phone_no: admin.phone_no,

        role:
          admin.user?.UserRoleMappings?.[0]?.Role?.role_name
          || "Unknown",

        created_on: admin.created_on

      }));


      return {

        success: true,

        data: result

      };

    }

    catch (error) {

      console.error("GET ADMINS ERROR:", error);

      return {

        success: false,

        message: error.message

      };

    }

  }


}

module.exports = AdminService;
