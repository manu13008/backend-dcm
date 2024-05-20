const mongoose = require("mongoose");

CONNECTION_STRING = process.env.CONNECTION_STRING;
console.log(process.env.CONNECTION_STRING);

mongoose
  .connect(CONNECTION_STRING, { connectTimeoutMS: 2000 })
  .then(() => console.log("Database connected"))
  .catch((error) => console.error(error));
