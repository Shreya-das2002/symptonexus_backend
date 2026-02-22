const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const Doctor = require("../models/Doctor");
const DoctorDetails = require("../models/Doctor_Details");
const DoctorSpecialization = require("../models/Doctor_specalization");

const DoctorExperience = require("../models/Doctor_experience");
const User = require("../models/User");
const Role = require("../models/Role");
const UserRoleMapping = require("../models/User_role_mapping");
const DomainLookup = require("../models/Domain_lookup");
const Admin = require("../models/Admin_user")


class DoctorService {

  /*For doctor create*/

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
        message: "Doctor created successfully and pending for approval",
        data: {
          doctor_id: doctor.doctor_id,
          first_name: doctor.first_name,
          middle_name: doctor.middle_name,
          last_name: doctor.last_name,
          phone_no: doctor.phone_no,
          gender: gender || null,
          specialization: specialization || null,
          email: doctor.email,
          status: doctor.status,
          created_by: doctor.created_by
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


  /* =====================================================
     GET PENDING DOCTORS
  ===================================================== */

  static async getPendingDoctors(userId, adminId, role) {

    try {

      let whereCondition = {
        status: "Pending"
      };

      let specializationFilter = null;


      if (role && role.toLowerCase() === "super admin") {

        // no filter

      }

else if (role && role.toLowerCase() === "standard admin") {

  const admin = await Admin.findByPk(adminId);

  if (!admin || !admin.department_id) {

    console.log("No department found for admin:", adminId);

    return {
      success: true,
      data: []
    };

  }

  specializationFilter = admin.department_id
    .split(",")
    .map(id => Number(id.trim()));


}


      else if (role && role.toLowerCase() === "guest admin") {

        whereCondition.created_by = userId;

      }



      const doctors = await Doctor.findAll({

  where: whereCondition,

  attributes: [
    "doctor_id",
    "first_name",
    "middle_name",
    "last_name",
    "email",
    "phone_no",
    "status",
    "created_on",
    "created_by"
  ],

  include: [

    {
      model: DoctorDetails,
      as: "doctor_detail",
      include: [
        {
          model: DomainLookup,
          as: "genderLookup",
          attributes: ["domain_name"],
          where: { domain_type: "gender" },
          required: false
        }
      ]
    },

    {
      model: DoctorSpecialization,
      as: "doctor_specializations",

      attributes: ["specialization_id"],   // IMPORTANT

      include: [
        {
          model: DomainLookup,
          as: "specializationLookup",
          attributes: ["domain_name"],
          where: { domain_type: "specialization" },
          required: false
        }
      ],

      required: true   // IMPORTANT
    }

  ]

});


      /* ================= FIXED FILTER ================= */
let filteredDoctors = doctors;

if (specializationFilter && specializationFilter.length > 0) {

  filteredDoctors = doctors.filter(doc => {

    const doctorSpec =
      doc.doctor_specializations?.[0]?.specialization_id;

    return specializationFilter.includes(
      Number(doctorSpec)
    );

  });

}



    const result = filteredDoctors.map(doc => ({

  doctor_id: doc.doctor_id,
  first_name: doc.first_name,
  middle_name: doc.middle_name,
  last_name: doc.last_name,
  email: doc.email,
  phone_no: doc.phone_no,

  gender:
    doc.doctor_detail?.genderLookup?.domain_name || null,

  specialization:
    doc.doctor_specializations?.[0]
    ?.specializationLookup?.domain_name || null,

  status: doc.status,
  created_on: doc.created_on,
  created_by: doc.created_by

}));


      return {

        success: true,
        data: result

      };

    }

    catch (error) {

      console.error("GET PENDING DOCTORS ERROR:", error);

      return {

        success: false,
        message: error.message

      };

    }

  }


  /* Doctor status Update */ 

static async updateDoctorStatus(doctorId, status, updatedBy) {

  const t = await sequelize.transaction();

  try {

    const doctor = await Doctor.findByPk(doctorId, { transaction: t });

    if (!doctor) {

      await t.rollback();

      return {
        success: false,
        message: "Doctor not found"
      };

    }

    let doctorNo = doctor.doctor_no;

    /* GENERATE DOCTOR NUMBER ONLY WHEN ACCEPTED */

    if (status === "Active" && !doctorNo) {

      const nextId = doctor.doctor_id.toString().padStart(4, "0");

      doctorNo = `DOC${nextId}`;

    }

    /* UPDATE DOCTOR */

    await doctor.update({

      status,
      doctor_no: doctorNo,
      updated_by: updatedBy

    }, { transaction: t });


    /* UPDATE USER STATUS */

    await User.update(

      { status },

      {
        where: { ref_id: doctorId },
        transaction: t
      }

    );


    await t.commit();

    return {

      success: true,
      message: `Doctor ${status} successfully`,
      data: {
      doctor_no: doctorNo || null,
      first_name: doctor.first_name,
      middle_name: doctor.middle_name,
      last_name: doctor.last_name,
      email: doctor.email,
      status: doctor.status
      }
    };

  }
  catch (error) {

    await t.rollback();

    return {
      success: false,
      message: error.message
    };

  }

}


/* =====================================================
          GET DOCTOR LIST (ROLE BASED)
===================================================== */

static async getDoctorList(userId, adminId, role)
{
  try {

    let whereCondition = {};

    let specializationFilter = null;


    /* SUPER ADMIN → SEE ALL DOCTORS */

    if (role && role.toLowerCase() === "super admin")
    {
      // no filter
    }


    /* STANDARD ADMIN → SEE ONLY ACTIVE + THEIR DEPARTMENT */

    else if (role && role.toLowerCase() === "standard admin")
    {

      whereCondition.status = "Active";

      const admin = await Admin.findByPk(adminId);

      if (!admin || !admin.department_id)
      {
        return {
          success: true,
          data: []
        };
      }

      specializationFilter =
        admin.department_id
        .split(",")
        .map(id => Number(id.trim()));

    }

/* GUEST ADMIN → SEE ONLY ACTIVE + THEIR CREATED DOCTORS */
else if (role && role.toLowerCase() === "guest admin") {

  whereCondition.status = "Active";    
  whereCondition.created_by = userId;  
}



    /* FETCH DOCTORS */

    const doctors = await Doctor.findAll({

      where: whereCondition,

      attributes: [
        "doctor_id",
        "doctor_no",
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "phone_no",
        "status",
        "created_on",
        "created_by"
      ],

      include: [

        {
          model: DoctorDetails,
          as: "doctor_detail",
          include: [
            {
              model: DomainLookup,
              as: "genderLookup",
              attributes: ["domain_name"],
              where: { domain_type: "gender" },
              required: false
            }
          ]
        },

        {
          model: DoctorSpecialization,
          as: "doctor_specializations",

          attributes: ["specialization_id"],

          include: [
            {
              model: DomainLookup,
              as: "specializationLookup",
              attributes: ["domain_name"],
              where: { domain_type: "specialization" },
              required: false
            }
          ],

          required: true
        },

          {
        model: DoctorExperience,
        as: "doctor_experiences",
        required: false
      }

      ],

      order: [["doctor_id", "DESC"]]

    });



    /* FILTER FOR STANDARD ADMIN */

    let filteredDoctors = doctors;

    if (specializationFilter && specializationFilter.length > 0)
    {
      filteredDoctors =
        doctors.filter(doc =>
          specializationFilter.includes(
            Number(
              doc.doctor_specializations?.[0]?.specialization_id
            )
          )
        );
    }



    /* FINAL RESPONSE */

    const result = filteredDoctors.map(doc => ({

      doctor_id: doc.doctor_id,

      doctor_no: doc.doctor_no,

      first_name: doc.first_name,

      middle_name: doc.middle_name,

      last_name: doc.last_name,

      email: doc.email,

      phone_no: doc.phone_no,

      gender:
        doc.doctor_detail?.genderLookup?.domain_name || null,

      specialization:
        doc.doctor_specializations?.[0]
        ?.specializationLookup?.domain_name || null,

      status: doc.status,

      created_on: doc.created_on,

      created_by: doc.created_by,

      doctor_details: {
      dob: doc.doctor_detail?.dob || null,
      gender: doc.doctor_detail?.genderLookup?.domain_name || null,
      licence_number: doc.doctor_detail?.licence_number || null,
      registration_number: doc.doctor_detail?.registration_number || null,
      experience: doc.doctor_detail?.experience || null,
      bio: doc.doctor_detail?.sort_desc || null },

   doctor_experiences: doc.doctor_experiences?.map(exp => ({
  organization_name: exp.organization_name,
  start_date: exp.start_date,
  end_date: exp.end_date
})) || []


    }));


    return {
      success: true,
      data: result
    };

  }

  catch (error)
  {
    console.error("GET DOCTOR LIST ERROR:", error);

    return {
      success: false,
      message: error.message
    };
  }
}

/* =====================================================
        GET HOMEPAGE DOCTORS (ONLY 3 ACTIVE)
===================================================== */

static async getHomepageDoctors()
{
  try {

    const doctors = await Doctor.findAll({

      where: {
        status: "Active"
      },

      attributes: [
        "doctor_id",
        "first_name",
        "middle_name",
        "last_name"
      ],

      include: [

        {
          model: DoctorSpecialization,
          as: "doctor_specializations",

          attributes: ["specialization_id"],

          include: [
            {
              model: DomainLookup,
              as: "specializationLookup",
              attributes: ["domain_name"],
              where: { domain_type: "specialization" },
              required: false
            }
          ],

          required: true
        }

      ],

      order: sequelize.literal("RAND()"), // random doctors

      limit: 3

    });



    const result = doctors.map(doc => ({

      doctor_id: doc.doctor_id,

      name:
        `${doc.first_name} ${doc.middle_name ?? ""} ${doc.last_name}`,

      specialization:
        doc.doctor_specializations?.[0]
        ?.specializationLookup?.domain_name || null

    }));



    return {

      success: true,

      data: result

    };

  }

  catch (error)
  {

    console.error("GET HOMEPAGE DOCTORS ERROR:", error);

    return {

      success: false,

      message: error.message

    };

  }

}

}

module.exports = DoctorService;
