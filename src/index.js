const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const todoHandler = require("./routeHandler/todoHandler");
const userHandler = require("./routeHandler/userHandler");
const clientHandler = require("./routeHandler/clientHandler");
const callHandler = require("./routeHandler/callHandler");
var cors = require('cors');

// express app initialization
const app = express();
app.use(cors());

dotenv.config()
app.use(express.json());

// database connection with mongoose
mongoose
  .connect("mongodb connection", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connection successful"))
  .catch((err) => console.log(err));

// application routes
// app.use("/todo", todoHandler);
app.use("/user", userHandler);
app.use("/client", clientHandler);
app.use("/call", callHandler);

// default error handler
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: err });
}


app.use(errorHandler);

// ,'192.168.8.99'

app.listen(4001, '139.162.44.140', async () => {
  console.log("app listening at port 3001");
});






