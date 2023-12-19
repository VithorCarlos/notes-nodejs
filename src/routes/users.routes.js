const { Router } = require("express");
const UsersController = require("../controllers/UsersController")

const usersRoutes = Router();

function middleware(request, response, next) {
  next()
}

const usersController = new UsersController()

usersRoutes.post("/", middleware, usersController.create);

usersRoutes.put("/:id", usersController.update);

module.exports = usersRoutes;
