const AdminUser = require("../models/Admin_user");
const AdminUserDetails = require("../models/Admin_user_Details");
const Address = require("../models/Address");
const sequelize = require("../config/database");

/* ================= ADDRESS BUILDER ================= */

const buildAddress = (addr) => {
  if (!addr) return null;

  return {
    address_line_1: addr.address_line_1 || null,
    address_line_2: addr.address_line_2 || null,
    city: addr.city || null,
    district: addr.district || null,
    state: addr.state || null,
    country: addr.country || null,
    pin: addr.pin || null,
    status: "Active",
  };
};

/* ================= SERVICE ================= */

class AdminProfileService {
  async saveAdminProfile(payload) {
    const t = await sequelize.transaction();

    try {
      const {
        admin_user_id,
        dob,
        current_address,
        permanent_address,
      } = payload;

      if (!admin_user_id) {
        throw new Error("ADMIN_USER_ID_REQUIRED");
      }

      /* ================= EXISTING DETAILS ================= */

      const existingDetails = await AdminUserDetails.findOne({
        where: { admin_user_id },
        transaction: t,
      });

      let currentAddressId =
        existingDetails?.current_address_id ?? null;

      let permanentAddressId =
        existingDetails?.permanent_address_id ?? null;

      /* ================= CURRENT ADDRESS ================= */

      if (current_address) {
        const data = buildAddress(current_address);

        if (currentAddressId) {
          await Address.update(data, {
            where: { address_id: currentAddressId },
            transaction: t,
          });
        } else {
          const addr = await Address.create(data, { transaction: t });
          currentAddressId = addr.address_id;
        }
      }

      /* ================= PERMANENT ADDRESS ================= */

      if (permanent_address) {
        const data = buildAddress(permanent_address);

        if (permanentAddressId) {
          await Address.update(data, {
            where: { address_id: permanentAddressId },
            transaction: t,
          });
        } else {
          const addr = await Address.create(data, { transaction: t });
          permanentAddressId = addr.address_id;
        }
      }

      /* ================= SAVE DETAILS ================= */

      const data = {
        dob,
        current_address_id: currentAddressId,
        permanent_address_id: permanentAddressId,
      };

      if (existingDetails) {
        await AdminUserDetails.update(data, {
          where: { admin_user_id },
          transaction: t,
        });
      } else {
        await AdminUserDetails.create(
          { admin_user_id, ...data },
          { transaction: t }
        );
      }

      /* ================= FETCH FINAL ================= */

      const user = await AdminUser.findOne({
        where: { admin_user_id },
        transaction: t,
      });

      const details = await AdminUserDetails.findOne({
        where: { admin_user_id },
        transaction: t,
      });

      await t.commit();

      return {
        success: true,
        user: user.toJSON(),
        profile: details.toJSON(),
      };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new AdminProfileService();