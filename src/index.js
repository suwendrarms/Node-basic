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
  .connect("mongodb://root:1qaz2wsx@ac-qeogkhq-shard-00-00.jrn0lwo.mongodb.net:27017,ac-qeogkhq-shard-00-01.jrn0lwo.mongodb.net:27017,ac-qeogkhq-shard-00-02.jrn0lwo.mongodb.net:27017/?ssl=true&replicaSet=atlas-115ajd-shard-0&authSource=admin&retryWrites=true&w=majority", {
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

app.listen(4001, async () => {
  console.log("app listening at port 3001");
});






