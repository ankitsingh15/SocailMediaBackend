const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config("./.env");
const dbconnect = require("./dbconnect");
const authController = require("./routers/authRouter");
const morgan = require("morgan");
const postRouter = require("./routers/postRouter");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRouter = require("./routers/userRouter");
const cloudinary = require("cloudinary").v2;

//middlewares
app.use(express.json({ limit: "10mb" }));
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//morgan is use to get api hit description on terminal
app.use(morgan("common"));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use("/auth", authController);
app.use("/posts", postRouter);
app.use("/user", userRouter);

app.get("/fetch", (req, res) => {
  res.status(200).send("Ok from Server");
});

dbconnect();

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log("Listening On port", PORT);
});
