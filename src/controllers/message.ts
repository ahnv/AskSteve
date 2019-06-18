import { Request, Response, NextFunction } from "express";
import mongoose, { mongo } from "mongoose";
import Message, { MessageModel } from "../models/Message";

export class Messages{

    static async create(sender_psid: string, text: string) {
        return await new Message({ sender_psid, text }).save();
    }

    static async read(req: Request, res: Response) {
        let query = {};
        try {
          if (req.params.id) query = { _id: mongoose.Types.ObjectId(req.params.id) };
        } catch (e) {}
        Message.find(query).then((data: MessageModel[]) => {
          res.json(data);
        });
    }

    static async delete(req: Request, res: Response) {
      const message = await Message.findByIdAndRemove(req.params.id);
      return res.send(200);
    }
}