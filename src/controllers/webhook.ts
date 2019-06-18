import { Response, Request } from "express";
import request from "request";

const users: any = {};

const previousResponse: any = {};

function handleMessage(sender_psid: any, received_message: any) {
  let response;
  if (received_message.text) {
    if (!users[sender_psid]) users[sender_psid] = { id: sender_psid };
    if (received_message.text == "Hi"){
      response = {
        "text": "What is your First Name ?"
      };
    } else {
      if (previousResponse[sender_psid]) {
        if (previousResponse[sender_psid].text == "What is your First Name ?"){
          users[sender_psid].name = received_message.text;
          response = {
            "text": "What is your Birthdate [YYYY-MM-DD] ?"
          };
        }

        if (previousResponse[sender_psid].text == "What is your Birthdate [YYYY-MM-DD] ?") {
          const birthdate = new Date(received_message.text);
          if (birthdate instanceof Date && !isNaN(birthdate.getTime())) {
            users[sender_psid].birthdate = birthdate;
            response = {
              "text": "Would you like to know how many days till his next birthday ?",
              "quick_replies":[
                {
                  "content_type": "text",
                  "title": "Yes",
                  "payload": "ANSWER_YES"
                },{
                  "content_type": "text",
                  "title": "No",
                  "payload": "ANSWER_NO"
                }
              ]
            };
          } else {
            response = {
              "text": "What is your Birthdate [YYYY-MM-DD] ?"
            };
          }
        }
        if (previousResponse[sender_psid].text == "Would you like to know how many days till his next birthday ?") {
          if (received_message.text == "Yes"){
            response = {
              "text": `There are <N> days left until your next birthday.`
            }
          } else {
            response = {
              "text": `Goodbye.`
            }
          }
          
        }
      } else {
        response = {
          "text": `You sent the message: "${received_message.text}".`
        };
      }
    }
  }
  previousResponse[sender_psid] = response;
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