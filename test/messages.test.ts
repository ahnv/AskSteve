import request from "supertest";
import app from "../src/app";
import { Messages } from "../src/controllers/message";
import { MessageModel } from "../src/models/Message";
import { Types } from "mongoose";

describe("GET /messages", () => {
  it("should return 200 OK", () => {
    return request(app).get("/messages")
      .expect(200);
  });
});

describe("CREATE message, DELETE message", () =>{
  it("should create a message in database and then delete it", async () => {
    const message: MessageModel = await Messages.create("TESTING_SENDER_ID", "TESTING_MESSAGE");
    if (message){
      return request(app).delete("/messages/" + message._id).expect(200);
    }
  });
});
