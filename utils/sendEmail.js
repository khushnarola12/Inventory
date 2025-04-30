const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service:'gmail', // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "khushnarola08@gmail.com",
    pass: "aofkvwwjvdflwjzr",
  },
});


let sendEmail = async(to,subject,data)=>{
    return await transporter.sendMail({
        from: '<khushnarola08@gmail.com>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: data, // plain text body
        // html: "<b>Hello world?</b>", // html body
      });
}

module.exports = sendEmail