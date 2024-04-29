import nodemailer from "nodemailer"


const sendEmail = (email:any) => {
    console.log("Check", process.env.SMTPSERVER);
    const opts: any = {
        host: process.env.SMTPSERVER,
        port: process.env.SMTPPORT,
        secure: false, // upgrade later with STARTTLS
        auth: {
            user: process.env.SMTPUSER,
            pass: process.env.SMTPPASSWORD,
        }
    }
    const transport = nodemailer.createTransport(opts);
    /*for (let i = 0; i < email.attachments.length; i++) {
        console.log("** SEND EMAIL **", email.attachments[i].content, typeof (email.attachments[i].content))
        console.log("** SEND EMAIL **", typeof (email.attachments[i].content.data))
    }*/
    return new Promise(async (resolve, reject) => {
        await transport.sendMail({
            from: process.env.SMTPUSER,
            to: email.to,
            subject: email.subject,
            text: email.text,
            html: email.html,
            attachments: email.attachments,
            list:email.list
        }).then((ret) => {
            resolve("Email Sent")
        }).catch((err) => {
            console.log(err)
            reject(err)
        });
    })
};

export default sendEmail