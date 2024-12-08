import crypto from "crypto";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const salt_key = process.env.SALT_KEY;
const merchant_id = process.env.MERCHANT_ID;

export const getOrderStatus = async (req, res) => {
    const merchantTransactionId = req.query.id;
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchant_id}/${merchantTransactionId}${salt_key}`;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + '###' + keyIndex;

    const options = {
        method: "GET",
        url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
        // url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchant_id}/${merchantTransactionId}`,
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
};
