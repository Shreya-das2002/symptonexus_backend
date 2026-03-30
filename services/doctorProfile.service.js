const Doctor = require("../models/Doctor");
const DoctorDetails = require("../models/Doctor_Details");
const DoctorExperience = require("../models/Doctor_Experience");
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

class DoctorProfileService {
  async saveDoctorProfile(payload) {
    const t = await sequelize.transaction();

    try {
      const {
        doctor_id,
        dob,
        licence_number,
        registration_number,
        experience,
        bio,
        current_address,
        permanent_address,
        experiences,
      } = payload;

      if (!doctor_id) {
        throw new Error("DOCTOR_ID_REQUIRED");
      }

      /* ================= CHECK EXISTING ================= */

      const existingDetails = await DoctorDetails.findOne({
        where: { doctor_id },
        transaction: t,
      });

      /* ================= ADDRESS ================= */

      let currentAddressId = existingDetails?.current_address_id ?? null;
      let permanentAddressId = existingDetails?.permanent_address_id ?? null;

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

      /* ================= SAVE DOCTOR DETAILS ================= */

      const detailsData = {
        doctor_id,
        dob,
        experience,
        licence_number,
        registration_number,
        sort_desc: bio,
        current_address_id: currentAddressId,
        permanent_address_id: permanentAddressId,
      };

      if (existingDetails) {
        await DoctorDetails.update(detailsData, {
          where: { doctor_id },
          transaction: t,
        });
      } else {
        await DoctorDetails.create(detailsData, { transaction: t });
      }

      /* ================= EXPERIENCE ================= */

      if (experiences && experiences.length > 0) {
        await DoctorExperience.destroy({
          where: { doctor_id },
          transaction: t,
        });

        const expData = experiences.map((exp) => ({
          doctor_id,
          start_date: exp.start_date,
          end_date: exp.end_date,
          organization_name: exp.organization_name,
          key_experience: exp.designation,
          experience_desc: exp.responsibilities,
        }));

        await DoctorExperience.bulkCreate(expData, { transaction: t });
      }

      /* ================= RESPONSE ================= */

      const user = await Doctor.findOne({
        where: { doctor_id },
        transaction: t,
      });

      const details = await DoctorDetails.findOne({
        where: { doctor_id },
        transaction: t,
      });

      await t.commit();

      return {
        success: true,
        user: user.toJSON(),
        doc_profile: details.toJSON(),
      };

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}

module.exports = new DoctorProfileService();