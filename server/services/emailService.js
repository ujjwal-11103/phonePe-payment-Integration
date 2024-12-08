import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail", // Use Gmail or another email provider
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASSWORD, // Your email password or app password
    },
});

export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to, // Receiver address
            subject, // Subject line
            text, // Plain text body
            html, // HTML body
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        return { success: true, info };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};
