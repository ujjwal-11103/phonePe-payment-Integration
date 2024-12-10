import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const salt_key = process.env.SALT_KEY;
const merchant_id = process.env.MERCHANT_ID;

export const getOrderStatus = async (req, res) => {

    const { id: merchantTransactionId, email } = req.query; // Access both id and email from query parameters
    console.log("Id :", merchantTransactionId);
    console.log("Email :", email);

    const keyIndex = 1;
    const string = `/pg/v1/status/${merchant_id}/${merchantTransactionId}${salt_key}`;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + '###' + keyIndex;

    const options = {
        method: "GET",
        // url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchant_id}/${merchantTransactionId}`,
        url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchant_id}/${merchantTransactionId}`,
        headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            "X-MERCHANT-ID": `${merchant_id}`,
        },
    };

    try {
        const response = await axios.request(options);
        console.log("Payment Status Response:", response.data);

        //Payment Mail confirmation
        if (response.data.success) {
            // Payment success: send confirmation email
            const emailData = {
                email,
                subject: "Payment Successful",
                message: `Your payment with transaction ID ${merchantTransactionId} was successful. Thank you!`,
                html: `<p>Your payment with transaction ID <strong> ${merchantTransactionId} </strong> was successful. Thank you!</p>`
            };

            try {
                await axios.post("https://phonepe-payment-integration-server.onrender.com/auth/send-confirmation-email", emailData);
                console.log("Confirmation email sent successfully.");
            } catch (emailError) {
                console.error("Error sending email:", emailError.message);
            }
        } else {
            // Payment Unsuccess: send confirmation email
            console.log("Payment failed.");
            const emailData = {
                email,
                subject: "Payment Unsuccessful",
                message: `Your payment with transaction ID ${merchantTransactionId} was unsuccessful !`,
                html: `<p>Your payment with transaction ID <strong> ${merchantTransactionId} </strong> was Unsuccessful. Thank you!</p>`
            };

            try {
                await axios.post("https://phonepe-payment-integration-server.onrender.com/auth/send-confirmation-email", emailData);
                console.log("Confirmation email sent successfully.");
            } catch (emailError) {
                console.error("Error sending email:", emailError.message);
            }
        }

        // redirection
        // const url = response.data.success ? `http://localhost:3000/success` : `http://localhost:3000/failure`;
        const url = response.data.success ? `https://jobbie.io/success` : `https://jobbie.io/failure`;
        return res.redirect(url);

    } catch (error) {
        console.error("Error checking payment status:", error);
        if (error.response) {
            console.error("Response Data:", error.response.data);
            console.error("Response Status:", error.response.status);
        }
        return res.status(500).send({ message: "Error checking payment status", success: false }).redirect("https://jobbie.io/failure");;
    }
};
