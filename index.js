import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import cookieSession from "cookie-session";
import connectDB from "./config/database.config.js";
import API from "./api/index.js";
import { generateResponse } from "./utils/helpers.js";

// initialize environment variables
dotenv.config();

// initialize express app
const app = express();

// connect to database
connectDB();

// set port
const PORT = process.env.PORT || 5011;

// initialize http server
const httpServer = createServer(app);

// set up middlewares
app.use(express.json());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIE_KEY],
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
}));
app.use(cors({ origin: "*", credentials: true }));

app.get('/', (req, res) => generateResponse(null, `${process.env.APP_NAME} API - Health check passed`, res));

new API(app).registerGroups();

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.yellow.bold);
});
