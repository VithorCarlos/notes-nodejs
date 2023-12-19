const AppError = require("../utils/appError");
const sqliteConnection = require("../database/sqlite");
const { hash, compare } = require("bcrypt");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const database = await sqliteConnection();

    const checkUser = await database.get(
      "SELECT email FROM users WHERE email = (?)",
      [email]
    );

    if (checkUser) {
      throw new AppError("User already exists", 400);
    }
    const hashedPassword = await hash(password, 8);

    await database.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    response.status(201).json();
  }

  async update(request, response) {
    const { id } = request.params;
    const { name, email, password, old_password } = request.body;

    const database = await sqliteConnection();

    const user = await database.get(
      "SELECT * FROM users WHERE id = (?)",
      [id]
    );

    if (!user) {
      throw new AppError("Users not exists");
    }

    const getUserByEmail = await database.get(
      "SELECT email FROM users WHERE email = (?)",
      [email]
    );

    if (getUserByEmail && getUserByEmail.email === email) {
      throw new AppError("E-mail already exists");
    }

    if (password && !old_password) {
      throw new AppError("Old password is required!");
    }

    if (password && old_password) {
      const checkOldPassword = await compare(
        old_password,
        user.password
      );

      if (!checkOldPassword) {
        throw new AppError("The old password is not true");
      }

      if (checkOldPassword && password === old_password) {
        throw new AppError("This password has been used another time");
      }

      user.password =  await hash(password, 8);
    }

    user.name = name ?? user.name
    user.email = name ?? user.email

    await database.run(
      `UPDATE users SET
      name = ?, 
      email = ?, 
      password = ?, 
      updated_at = DATETIME("NOW") 
      WHERE id = ?`,
      [user.name, user.email, user.password, id]
    );

    response.json();
  }
}

module.exports = UsersController;
