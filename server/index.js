const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

let salt_key = process.env.SALT_KEY;
let merchant_id = process.env.MERCHANT_ID;

// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.post("/order", async (req, res) => {
    try {
        console.log("Request Body:", req.body);
        const merchantTransactionId = req.body.transactionId;
        const data = {
            merchantId: merchant_id,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: req.body.MUID,
            name: req.body.name,
            amount: req.body.amount * 100, // Amount in paise/cents
            redirectUrl: `http://localhost:8000/status/?id=${merchantTransactionId}`,
            redirectMode: 'POST',
            mobileNumber: req.body.number,
            paymentInstrument: {
                type: 'PAY_PAGE',
            },
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
            },
            data: {
                request: payloadMain,
            },
        };

        try {
            const response = await axios.request(options);
            console.log("Response from PhonePe:", response.data);
            return res.json(response.data);
        } catch (error) {
            console.error("Payment  Error:", error);
            if (error.response) {
                console.error("Response Data:", error.response.data);
                console.error("Response Status:", error.response.status);
                return res.status(error.response.status).send({ message: error.response.data.message || "Error making payment request", success: false });
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
    const merchantId = merchant_id;
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    const options = {
        method: 'GET',
        url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`,
        },
    };

    try {
        const response = await axios.request(options);
        console.log("Payment Status Response:", response.data);
        if (response.data.success === true) {
            const url = `http://localhost:3000/success`;
            return res.redirect(url);
        } else {
            const url = `http://localhost:3000/failure`;
            return res.redirect(url);
        }
    } catch (error) {
        console.error("Error checking payment status:", error);
        if (error.response) {
            console.error("Response Data:", error.response.data);
            console.error("Response Status:", error.response.status);
        }
        return res.status(500).send({ message: "Error checking payment status", success: false });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
