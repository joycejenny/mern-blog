const express = require("express");
// const app = express();

const cors = require("cors");
const { default: mongoose } = require("mongoose");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const salt = bcrypt.genSaltSync(10);
const secret = "asdfghjklasdfghjkl";

const corsOptions = {
  origin: "http://localhost:3000/",
  optionsSuccessStatus: 200, 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://your-client-domain.com");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true"); // if you're using credentials
  next();
});
app.options("/register", cors(corsOptions));
app.use(cookieParser());

mongoose.connect(
  "mongodb+srv://aeniolajoyce:BPCGuRhdTlfMBHnB@cluster0.rsvuoze.mongodb.net/?retryWrites=true&w=majority"
);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });

  const passOk = bcrypt.compareSync(password, userDoc.password);
  // res.json(passOk);
  if (passOk) {
    // logged in
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie("token", token).json("ok");
    });
  } else {
    res.status(400).json("wrong credentials");
  }
});

app.get("profile", (req, res) => {
  res.json(req.cookies);
});

app.listen(1230);
