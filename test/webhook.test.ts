import request from "supertest";
import app from "../src/app";
import { Webhook } from "../src/controllers/webhook";

describe("GET /webhook", () => {
  it("should return 200 OK", () => {
    return request(app).get("/webhook?hub.verify_token=QXNrU3RldmUK&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe")
        .expect("CHALLENGE_ACCEPTED")
        .expect(200);
  });
  it("should return 403 OK", () => {
    return request(app).get("/webhook?hub.verify_token=VERIFY_TOKEN&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe")
      .expect(403);
  });
});


describe("TEST handleMessage", () => {
    it(`send message to ${process.env["TEST_USER"]}`, async () => {
        return expect(await(Webhook.callSendAPI(process.env["TEST_USER"], { "text": "test" }))).toEqual("Message Sent!");
    });
});

describe("TEST handleMessage", () => {
    it("Check hi response", async () => {
        return expect(await Webhook.handleMessage("TESTING_ID", { "text": "hi" })).toEqual({ response: { "text": "What is your First Name ?" }, sender_psid: "TESTING_ID" });
    });
    it("Check name response", async () => {
        await Webhook.handleMessage("TESTING_ID", { "text": "hi" });
        return expect(await Webhook.handleMessage("TESTING_ID", { "text": "testName" })).toEqual({ response: { "text": "What is your Birthdate [YYYY-MM-DD] ?" }, sender_psid: "TESTING_ID" });
    });
    it("Check birthdate response", async () => {
        await Webhook.handleMessage("TESTING_ID", { "text": "hi" });
        await Webhook.handleMessage("TESTING_ID", { "text": "testName" });
        return expect(await Webhook.handleMessage("TESTING_ID", { "text": "1997-01-01" })).toEqual({ response: { "text": "Would you like to know how many days till his next birthday ?", "quick_replies": [{"content_type": "text","title": "Yes","payload": "ANSWER_YES"}, {"content_type": "text","title": "No","payload": "ANSWER_NO"}]}, sender_psid: "TESTING_ID" });
    });
    it("Check wrong birthdate response", async () => {
        await Webhook.handleMessage("TESTING_ID", { "text": "hi" });
        await Webhook.handleMessage("TESTING_ID", { "text": "testName" });
        return expect(await Webhook.handleMessage("TESTING_ID", { "text": "1997-24-24" })).toEqual({ response: { "text": "What is your Birthdate [YYYY-MM-DD] ?" }, sender_psid: "TESTING_ID" });
    });
    it("Check Days Left No response", async () => {
        await Webhook.handleMessage("TESTING_ID", { "text": "hi" });
        await Webhook.handleMessage("TESTING_ID", { "text": "testName" });
        await Webhook.handleMessage("TESTING_ID", { "text": "1997-01-01" });
        return expect(await Webhook.handleMessage("TESTING_ID", { "text": "no" })).toEqual({ response: { "text": "Goodbye." }, sender_psid: "TESTING_ID" });
    });
    it("Check Days Left No response", async () => {
        return expect(await Webhook.handleMessage("TESTING_ID", { "text": "Response test" })).toEqual({ response: { "text": "You sent the message: \"response test\"." }, sender_psid: "TESTING_ID" });
    });
});

describe("POST /webhook", () => {
    it("should return 200 OK", () => {
        return request(app).post("/webhook")
          .send({"object": "page", "entry": [{"id": process.env["BOT_USER_ID"], "messaging": [{"sender": {"id": process.env["TEST_USER"]}, "recipient": {"id": process.env["BOT_USER_ID"]}, "message": {"text": "POST API Test"}}]}]})
          .expect("EVENT_RECEIVED")
          .expect(200);
      });
    it("should return 404 OK", () => {
      return request(app).post("/webhook")
        .expect(404);
    });
});
