import express from "express";
import serverless from "serverless-http";
const app = express();

const authRouter = require("../../../server/src/authRoutes");

app.use(express.json());

app.use("/auth", authRouter);

module.exports.handler = serverless(app);
