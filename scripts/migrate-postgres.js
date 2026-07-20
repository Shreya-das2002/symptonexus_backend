require("dotenv").config();

const sequelize = require("../config/database");

async function migratePostgres() {
  const transaction = await sequelize.transaction();

  try {
    const queryInterface = sequelize.getQueryInterface();
    const [
      userRoleMappingColumns,
      specializationColumns,
      domainLookupColumns,
      adminUserColumns,
      doctorDetailColumns,
      doctorColumns,
    ] = await Promise.all([
      queryInterface.describeTable("user_role_mappings"),
      queryInterface.describeTable("doctor_specializations"),
      queryInterface.describeTable("domain_lookups"),
      queryInterface.describeTable("admin_users"),
      queryInterface.describeTable("doctor_details"),
      queryInterface.describeTable("doctors"),
    ]);

    if (userRoleMappingColumns.status.type.startsWith("CHARACTER")) {
      await sequelize.query(`
        ALTER TABLE "user_role_mappings"
        ALTER COLUMN "status" DROP DEFAULT,
        ALTER COLUMN "status" TYPE INTEGER USING CASE
          WHEN "status" IS NULL THEN NULL
          WHEN LOWER(TRIM("status")) IN ('active', '1', 'true') THEN 1
          WHEN LOWER(TRIM("status")) IN ('inactive', '0', 'false') THEN 0
          ELSE NULL
        END,
          ALTER COLUMN "status" SET DEFAULT 1;
      `, { transaction });
    }

    if (specializationColumns.status.type.startsWith("CHARACTER")) {
      await sequelize.query(`
        ALTER TABLE "doctor_specializations"
        ALTER COLUMN "status" DROP DEFAULT,
        ALTER COLUMN "status" TYPE INTEGER USING CASE
          WHEN "status" IS NULL THEN NULL
          WHEN LOWER(TRIM("status")) IN ('active', '1', 'true') THEN 1
          WHEN LOWER(TRIM("status")) IN ('inactive', '0', 'false') THEN 0
          ELSE NULL
        END,
          ALTER COLUMN "status" SET DEFAULT 1;
      `, { transaction });
    }

    if (domainLookupColumns.domain_value.type.startsWith("CHARACTER")) {
      await sequelize.query(`
        ALTER TABLE "domain_lookups"
          ALTER COLUMN "domain_value" TYPE INTEGER
          USING NULLIF(TRIM("domain_value"), '')::INTEGER;
      `, { transaction });
    }

    // AdminUser.gender is joined to DomainLookup.domain_value during login.
    // Keep both columns as INTEGER so PostgreSQL can perform that join.
    if (adminUserColumns.gender.type.startsWith("CHARACTER")) {
      await sequelize.query(`
        ALTER TABLE "admin_users"
          ALTER COLUMN "gender" TYPE INTEGER
          USING NULLIF(TRIM("gender"), '')::INTEGER;
      `, { transaction });
    }

    // These values also join DomainLookup.domain_value in doctor, appointment,
    // and feedback list queries.
    if (specializationColumns.specialization_id.type.startsWith("CHARACTER")) {
      await sequelize.query(`
        ALTER TABLE "doctor_specializations"
          ALTER COLUMN "specialization_id" TYPE INTEGER
          USING NULLIF(TRIM("specialization_id"), '')::INTEGER;
      `, { transaction });
    }

    if (doctorDetailColumns.gender.type.startsWith("CHARACTER")) {
      await sequelize.query(`
        ALTER TABLE "doctor_details"
          ALTER COLUMN "gender" TYPE INTEGER
          USING NULLIF(TRIM("gender"), '')::INTEGER;
      `, { transaction });
    }

    // Doctors created by a logged-in user are filtered by numeric user ID.
    if (doctorColumns.created_by.type.startsWith("CHARACTER")) {
      await sequelize.query(`
        ALTER TABLE "doctors"
          ALTER COLUMN "created_by" TYPE INTEGER
          USING NULLIF(TRIM("created_by"), '')::INTEGER;
      `, { transaction });
    }

    await transaction.commit();
    console.log("PostgreSQL type migration completed");
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await sequelize.close();
  }
}

migratePostgres().catch((error) => {
  console.error("PostgreSQL type migration failed:", error.message);
  process.exit(1);
});
