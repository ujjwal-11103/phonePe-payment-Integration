import { sendEmail } from "../services/emailService.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    console.log("Received registration:", { name, email, password });

    // Simulate user registration (e.g., save to DB here)
    const confirmationEmail = {
      to: email,
      subject: "Welcome to Our Service!",
      text: `Hi ${name},\n\nThank you for registering! We're excited to have you on board.`,
      html: `<p>Hi <strong>${name}</strong>,</p>
             <p>Thank you for registering! We're excited to have you on board.</p>`,
    };

    const emailResult = await sendEmail(confirmationEmail);

    if (!emailResult.success) {
      return res.status(500).json({ message: "Registration successful, but email failed to send." });
    }

    res.status(200).json({ message: "Registration successful! Confirmation email sent." });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Registration failed", error });
  }
};


// Email related
export const sendMailService = async (req, res) => {
  const { email, subject, message, html } = req.body;

  try {
    const emailResult = await sendEmail({
      to: email,
      subject,
      text: message,
      html
    });

    if (!emailResult.success) {
      return res.status(500).json({ message: "Email failed to send." });
    }

    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email.", error });
  }
}



