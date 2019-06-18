import { Request, Response } from "express";
import Message from "../models/Message";
import { MessageModel } from "../models/Message";
import mongoose from "mongoose";

export let index = (req: Request, res: Response) => {
  res.json({
    title: "Home"
  });
};
