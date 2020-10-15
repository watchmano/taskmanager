// Require:
const mailgun = require("mailgun-js");

// Send an email:
//
const DOMAIN = 'watchmano@naver.com';
const mg = mailgun({apiKey: process.env.MAILGUNJS_API_KEY, domain: DOMAIN});

const sendWelcomeEmail = (email, name) => {
  mg.messages().send({
    from: 'Mark Jung <watchmano@naver.com>',
    to: email,
    subject: 'Thanks for Signing Up!',
    text: `Welcome ${name}. Use our app to manage your tasks~! LOL`
  }, (error, body) => {
    console.log(body);
  })
}

const sendCancelationEmail = (email, name) => {
  mg.messages().send({
    from: 'Mark Jung <watchmano@naver.com>',
    to: email,
    subject: 'We will miss you',
    text: `Good-Bye ${name}. Your memory will not soon be forgot here. Come back when you feel like.`
  }, (error, body) => {
    console.log(body);
  })
}

sendWelcomeEmail('lifeisegg11@daum.net', 'mark')

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}




/*
const client = new postmark.ServerClient(process.env.POSTMARK_API_KEY)

const sendWelcomeEmail = (email, name) => {
  client.sendEmail({
    "To": email,
    "From": "lifeisegg11@daum.net",
    "Subject": "Thanks for Joining in!",
    "TextBody": `Welcome to the app, ${name}. Let me know how you get along with the app.`
  })
}

const sendCancelationEmail = (email, name) => {
  client.sendEmail({
    "To": email,
    "From": "lifeisegg11@daum.net",
    "Subject": "Good bye",
    "TextBody": `Good Bye dear ${name}. Let me know if you change your mind.`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}
*/