import {
  Sequelize,
  DataTypes,
  Model,
  fn,
  col,
  where,
} from "sequelize";
import type { Config } from "../config.js";

export class User extends Model {
  declare id: number;
  declare email: string;
  declare passwordHash: string;
  declare role: string;
  declare readonly createdAt: Date;
}

export class ClassRoom extends Model {
  declare id: number;
  declare name: string;
  declare gradeLevel: string | null;
  declare academicYear: string;
  declare readonly createdAt: Date;
}

export class Student extends Model {
  declare id: number;
  declare admissionNumber: string;
  declare firstName: string;
  declare lastName: string;
  declare dateOfBirth: string | null;
  declare parentEmail: string | null;
  declare classRoomId: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

export function setupDatabase(config: Config): Sequelize {
  const sequelize = new Sequelize({
    dialect: "mysql",
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USER,
    password: config.DB_PASSWORD === "" ? undefined : config.DB_PASSWORD,
    database: config.DB_NAME,
    logging: config.NODE_ENV === "development" ? console.log : false,
  });

  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: "password_hash",
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "admin",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
      timestamps: false,
    },
  );

  ClassRoom.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(120), allowNull: false },
      gradeLevel: { type: DataTypes.STRING(50), field: "grade_level" },
      academicYear: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: "academic_year",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      tableName: "classrooms",
      modelName: "ClassRoom",
      timestamps: false,
    },
  );

  Student.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      admissionNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: "admission_number",
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "first_name",
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "last_name",
      },
      dateOfBirth: { type: DataTypes.DATEONLY, field: "date_of_birth" },
      parentEmail: { type: DataTypes.STRING(255), field: "parent_email" },
      classRoomId: {
        type: DataTypes.INTEGER.UNSIGNED,
        field: "class_room_id",
      },
    },
    {
      sequelize,
      tableName: "students",
      modelName: "Student",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

  Student.belongsTo(ClassRoom, { foreignKey: "class_room_id", as: "classRoom" });
  ClassRoom.hasMany(Student, { foreignKey: "class_room_id", as: "students" });

  return sequelize;
}

/** Case-insensitive email match (same idea as SQL LOWER(email) = LOWER(?)). */
export function userByEmailCi(normalized: string) {
  return User.findOne({
    where: where(fn("LOWER", col("email")), fn("LOWER", normalized)),
  });
}
