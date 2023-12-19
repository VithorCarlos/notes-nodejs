require("express-async-errors");
const runMigrations = require("./database/sqlite/migrations");
const express = require("express");
const AppError = require("./utils/appError");
const app = express();

const routes = require("./routes");

runMigrations();
app.use(express.json());

app.use(routes);

app.use((error, request, response, next) => {
  //erro gerado pelo client
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
  }

  console.error(error);

  return response.status(500).json({
    status: "error",
    message: "Internal server error",
  });
});

app.listen(3333, () => console.log("server is runnig at port:" + 3333));
