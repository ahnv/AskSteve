import express from "express";
import bodyParser from "body-parser";
import logger from "./util/logger";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bluebird from "bluebird";
import { MONGODB_URI } from "./util/secrets";

dotenv.config({ path: ".env" });

import * as homeController from "./controllers/home";
import * as webhookController from "./controllers/webhook";
import { Messages } from "./controllers/message";

const app = express();

const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
});

app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", homeController.index);
app.get("/messages", Messages.read);
app.get("/messages/:id", Messages.read);
app.delete("/messages/:id", Messages.delete);

app.get("/webhook", webhookController.Webhook.verify);
app.post("/webhook", webhookController.Webhook.post);

export default app;