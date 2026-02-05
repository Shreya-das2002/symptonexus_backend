const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Admin = require("../models/Admin_user");
const DomainLookup = require("../models/Domain_lookup");

class AdminService {

  /* ===================== CREATE ADMIN ===================== */
  static async createAdmin(payload, createdBy = null) {
    const t = await sequelize.transaction();

    try {
      const {
        first_name,
        middle_name,
        last_name,
        email,
        phone_no,
        admin_type, // 1,2,3
        gender,
        password
      } = payload;

      /* ================= VALIDATIONS ================= */

      const userExists = await User.findOne({
        where: { user_name: email },
        transaction: t
      });

      if (userExists) {
        await t.rollback();
        return { success: false, message: "Email already exists" };
      }

      const adminTypeLookup = await DomainLookup.findOne({
        where: {
          domain_type: "user_type",
          domain_value: admin_type
        },
        transaction: t
      });

      if (!adminTypeLookup) {
        await t.rollback();
        return { success: false, message: "Invalid admin type" };
      }

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
          return { success: false, message: "Invalid gender" };
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

      /* ================= CREATE LOGIN ================= */

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        user_name: email,
        password: hashedPassword,
        user_type: admin_type,
        ref_id: admin.admin_user_id,   // ✅ FIXED
        status: "Active",
        created_by: createdBy
      }, { transaction: t });

      await t.commit();

      return {
        success: true,
        message: "Admin created successfully",
        data: {
            admin_user_id: admin.admin_user_id,
            first_name: admin.first_name,
            middle_name: admin.middle_name,
            last_name: admin.last_name,
            email: admin.email,
            phone_no: admin.phone_no,
            gender: admin.gender,
            user_type: admin_type
        }
      };

    } catch (error) {
      await t.rollback();
      console.error("CREATE ADMIN ERROR:", error);
      return { success: false, message: "Failed to create admin" };
    }
  }

 static async getAllAdmins() {
    return await Admin.findAll({
      attributes: [
        "admin_user_id",
        "first_name",
        "last_name",
        "email",
        "created_on"
      ],
      include: [
        {
          model: User,
          as: "user",
          required: false,   // safe
          attributes: ["user_type"] // ONLY THIS
        }
      ]
    });
  }
}

module.exports = AdminService;
