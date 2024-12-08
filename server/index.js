import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import orderRoutes from "./routes/orderRoutes.js";
import statusRoutes from "./routes/statusRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/order", orderRoutes);
app.use("/status", statusRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Server is running");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

export default app;
