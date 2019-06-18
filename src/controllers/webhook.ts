import { Response, Request } from "express";
import request from "request";
import Message from "../models/Message";
import { Messages } from "./message";

export class Webhook {

  private static users: any = {};

  static async handleMessage(sender_psid: any, received_message: any) {
    let response;
    const message: string = received_message.text.toLowerCase();
    if (message) {
      await Messages.create(sender_psid, message);
      if (!this.users[sender_psid]) this.users[sender_psid] = { id: sender_psid };
      if (message == "hi") {
        response = { "text": "What is your First Name ?" };
      } else {
        if (this.users[sender_psid].previousResponse && this.users[sender_psid].previousResponse.text == "What is your First Name ?") {
          this.users[sender_psid].name = message;
          response = { "text": "What is your Birthdate [YYYY-MM-DD] ?" };
        } else if (this.users[sender_psid].previousResponse && this.users[sender_psid].previousResponse.text == "What is your Birthdate [YYYY-MM-DD] ?") {
          const birthdate = new Date(message);
          if (birthdate instanceof Date && !isNaN(birthdate.getTime())) {
            this.users[sender_psid].birthdate = birthdate;
            response = {
              "text": "Would you like to know how many days till his next birthday ?",
              "quick_replies": [
                {
                  "content_type": "text",
                  "title": "Yes",
                  "payload": "ANSWER_YES"
                }, {
                  "content_type": "text",
                  "title": "No",
                  "payload": "ANSWER_NO"
                }
              ]
            };
          } else {
            response = { "text": "What is your Birthdate [YYYY-MM-DD] ?" };
          }
        } else if (this.users[sender_psid].previousResponse && this.users[sender_psid].previousResponse.text == "Would you like to know how many days till his next birthday ?") {
          if (message.toLowerCase().match(/y/g)) {
            const dt1 = new Date();
            let dt2 = new Date(this.users[sender_psid].birthdate.setFullYear(dt1.getFullYear()));
            if (dt1.getTime() > dt2.getTime()) { dt2 = new Date(dt2.setFullYear(dt1.getFullYear() + 1)); }
            const diffDays = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
            response = { "text": `There are ${diffDays} days left until your next birthday.` };
          } else {
            response = { "text": `Goodbye.` };
          }
        } else {
          response = { "text": `You sent the message: "${message}".` };
        }
      }
    }
    this.users[sender_psid].previousResponse = response;
    return { sender_psid, response };
  }


  static verify(req: Request, res: Response) {
    const VERIFY_TOKEN = "QXNrU3RldmUK";
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }

  static async post(req: Request, res: Response) {
    const body = req.body;
    if (body.object === "page") {
      for (let i = 0; i < body.entry.length; i++) {
        const entry = body.entry[i];
        const webhook_event = entry.messaging[0];
        const sender_psid = webhook_event.sender.id;
        if (webhook_event.message) {
          const response: any = await Webhook.handleMessage(sender_psid, webhook_event.message);
          await Webhook.callSendAPI(response.sender_psid, response.response);
        }
      }
      res.status(200).send("EVENT_RECEIVED");
    } else {
      res.sendStatus(404);
    }
  }

  static callSendAPI(sender_psid: any, response: any) {
    return new Promise((resolve, reject) => {
      const request_body = {
        "recipient": {
          "id": sender_psid
        },
        "message": response
      };
      request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.FACEBOOK_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
      }, (err, res, body) => {
        if (!err) {
          resolve("Message Sent!");
        }
      });
    });
  }
}