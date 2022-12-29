const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const PlanRouter = require("./routers/plans");


const app = express();

app.use(express.json());
app.use(userRouter);
app.use(PlanRouter);


module.exports = app;