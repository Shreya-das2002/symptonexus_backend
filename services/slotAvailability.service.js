const sequelize = require("../config/database");
const DoctorAvailability = require("../models/Doctor_Availablity");

class DoctorAvailabilityService {

  static async upsertSlot(payload, userId) {

    const t = await sequelize.transaction();

    try {

      const { doctor_id, date, slot_count, fees } = payload;

      /* VALIDATION */

      if (!doctor_id || !date || !slot_count || !fees) {
        await t.rollback();
        return {
          success: false,
          message: "All fields are required"
        };
      }

      /* CHECK EXISTING SLOT */

      const existing = await DoctorAvailability.findOne({
        where: { doctor_id, date },
        transaction: t
      });

      let result;

      /* UPDATE CASE */

      if (existing) {

        result = await existing.update({
          slot_count,
          fees,
          updated_by: userId,
          updated_on: new Date()
        }, { transaction: t });

      }

      /* CREATE CASE */

      else {

        result = await DoctorAvailability.create({
          doctor_id,
          date,
          slot_count,
          fees,
          status: 1,
          created_by: userId,
          updated_by: userId
        }, { transaction: t });

      }

      await t.commit();

      return {
        success: true,
        message: existing
          ? "Slot updated successfully"
          : "Slot added successfully",
        data: result
      };

    } catch (error) {

      await t.rollback();

      console.error("UPSERT SLOT ERROR:", error);

      return {
        success: false,
        message: error.message
      };

    }

  }

}

module.exports = DoctorAvailabilityService;