const {
  getPatientProfileService,
} = require("../services/patientProfile.service");

const sequelize = require("../config/database"); // adjust path if needed

exports.getPatientProfile = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    try {
      const { patient_id } = req.params;

      const { user, profile } =
        await getPatientProfileService(patient_id, transaction);

      await transaction.commit();

      return res.json({
        success: true,
        data: {
          token: req.headers.authorization || null,
          role: "patient",
          user,
          profile,
          errorcode: null,
        },
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error(error);

    return res.status(404).json({
      success: false,
      data: {
        token: null,
        role: "patient",
        user: null,
        profile: null,
        errorcode: error.message || "UNKNOWN_ERROR",
      },
    });
  }
};
