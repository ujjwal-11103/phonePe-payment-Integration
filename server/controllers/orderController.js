import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


const salt_key = process.env.SALT_KEY;
const merchant_id = process.env.MERCHANT_ID;
const email = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASSWORD;

export const createOrder = async (req, res) => {
    try {
        const { transactionId, MUID, name, amount, number } = req.body;
        const merchantTransactionId = transactionId;

        console.log("Request Body:", req.body);

        const data = {
            merchantId: merchant_id,
            merchantTransactionId,
            merchantUserId: MUID,
            name,
            amount: amount * 100,
            redirectUrl: "http://localhost:3000/success",
            redirectMode: "REDIRECT",
            mobileNumber: number,
            paymentInstrument: { type: "PAY_PAGE" },
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString("base64");
        const saltIndex = 1;
        const string = payloadMain + "/pg/v1/pay" + salt_key;
        const sha256 = crypto.createHash("sha256").update(string).digest("hex");
        const checksum = sha256 + "###" + saltIndex;

        const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
        // const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";

        const options = {
            method: "POST",
            url: prod_URL,
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                "X-VERIFY": checksum,
            },
            data: { request: payloadMain },
        };

        try {
            const response = await axios.request(options);
            console.log("Response from PhonePe:", response.data);
            console.log("Response from PhonePe:", response.data?.data?.instrumentResponse?.redirectInfo);
            return res.json(response.data);
        } catch (error) {
            console.error("Payment Error:", error);
            if (error.response) {
                console.error("Response Data:", error.response.data);
                console.error("Response Status:", error.response.status);
                return res.status(error.response.status).send({
                    message: error.response.data.message || "Error making payment request",
                    success: false,
                });
            } else {
                console.error("No Response from API:", error.message);
                return res.status(500).send({ message: "Error making payment request", success: false });
            }
        }
    } catch (error) {
        console.error("General Error:", error);
        res.status(500).send({
            message: error.message,
            success: false,
        });
    }
};
