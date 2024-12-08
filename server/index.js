import express from "express";
import cors from "cors";
import crypto from "crypto";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

const salt_key = process.env.SALT_KEY;
const merchant_id = process.env.MERCHANT_ID;

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.post("/order", async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const { transactionId, MUID, name, amount, number } = req.body;

        const merchantTransactionId = transactionId;
        const data = {
            merchantId: merchant_id,
            merchantTransactionId,
            merchantUserId: MUID,
            name,
            amount: amount * 100, // Amount in paise/cents
            // redirectUrl: `http://localhost:3000/status/?id=${merchantTransactionId}`,
            redirectUrl: `http://localhost:3000/failure`,
            redirectMode: "REDIRECT",
            mobileNumber: number,
            paymentInstrument: {
                type: "PAY_PAGE",
            },
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString("base64");
        const saltIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        const sha256 = crypto.createHash("sha256").update(string).digest("hex");
        const checksum = sha256 + '###' + saltIndex;


        console.log("Payload :" + payloadMain);
        console.log("Checksum :" + checksum);

        // const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
        const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";

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
});

app.post("/status", async (req, res) => {
    const merchantTransactionId = req.query.id;
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchant_id}/${merchantTransactionId}${salt_key}`;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + '###' + keyIndex;

    const options = {
        method: "GET",
        // url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
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
        const url = response.data.success ? `http://localhost:3000/success` : `http://localhost:3000/failure`;
        return res.redirect(url);
    } catch (error) {
        console.error("Error checking payment status:", error);
        if (error.response) {
            console.error("Response Data:", error.response.data);
            console.error("Response Status:", error.response.status);
        }
        return res.status(500).send({ message: "Error checking payment status", success: false });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
