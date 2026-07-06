// index.js
import 'dotenv/config';
import express from "express";
import { router } from "./routes/router";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { deleteExpiredSessions } from "./auth/session";

if (!process.env.COOKIE_SECRET) {
  console.error("COOKIE_SECRET env var is required");
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
)

app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use("/api/habits", router)

app.use((req, res, next) => {
    try {
    console.log(req.path, req.method)
    next()
    } catch (e) {
      console.log(e);
    }
})

app.listen(port, () => {
  deleteExpiredSessions();
  console.log(`Example app listening on port ${port}`);

});