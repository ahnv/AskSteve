import mongoose, { Model } from "mongoose";

export type MessageModel = mongoose.Document & {
    sender_psid: string,
    text: string
};

const messageSchema: mongoose.Schema = new mongoose.Schema(
    {
        sender_psid: { type: String, trim: true, required: true },
        text: { type: String, trim: true, required: true }
    },
    { timestamps: true }
);

const Message: Model<MessageModel> = mongoose.model<MessageModel>("message", messageSchema);
export default Message;
