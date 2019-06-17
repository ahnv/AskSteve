import { Response, Request } from "express";
import request from "request";

function handleMessage(sender_psid: any, received_message: any) {
  let response;

  if (received_message.text) {
    response = {
      "text": `You sent the message: "${received_message.text}".`
    }
  }
  callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid: any, response: any) {
  const request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.FACEBOOK_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log("message sent!")
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}

export let postWebhook = (req: Request, res: Response) => {
  const body = req.body;
  if (body.object === "page") {
    body.entry.forEach((entry: any) => {
      const webhook_event = entry.messaging[0];
      const sender_psid = webhook_event.sender.id;
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        // handlePostback(sender_psid, webhook_event.postback);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
};

export const verifyWebhook = (req: Request, res: Response) => {
  const VERIFY_TOKEN = "QXNrU3RldmUK";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};