const sequelize = require("../config/database");

const User = require("../models/User");
const Role = require("../models/Role");
const UserRoleMapping = require("../models/User_role_mapping");

class DashboardService {

/* =====================================================
   DASHBOARD COUNT
===================================================== */

static async getDashboardCount() {

  const t = await sequelize.transaction();

  try {

    /* ================= PATIENT COUNT ================= */

    const patientRole = await Role.findOne({
      where: { role_name: "patient" },
      transaction: t
    });

    const doctorRole = await Role.findOne({
      where: { role_name: "doctor" },
      transaction: t
    });

    const patientCount = await UserRoleMapping.count({
      where: {
        role_id: patientRole.role_id,
        status: 1
      },
      transaction: t
    });

    const doctorCount = await UserRoleMapping.count({
      where: {
        role_id: doctorRole.role_id,
        status: 1
      },
      transaction: t
    });

    await t.commit();

    return {
      success: true,
      data: {
        patientCount,
        doctorCount
      }
    };

  }

  catch (error) {

    await t.rollback();

    console.error("DASHBOARD COUNT ERROR:", error);

    return {
      success: false,
      message: "Failed to fetch dashboard count"
    };

  }

}

}

module.exports = DashboardService;