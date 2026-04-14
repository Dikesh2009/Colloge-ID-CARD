const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const XLSX = require("xlsx");
const cors = require("cors");
const QRCode = require("qrcode");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ✅ ROOT FIX (IMPORTANT)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

let users = [];
let otpStore = {};

// upload
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".jpg");
  }
});
const upload = multer({ storage });

// OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "OTP",
    text: `Your OTP is ${otp}`
  });

  res.json({ msg: "OTP Sent" });
});

// verify
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    res.json({ success: true });
  } else {
    res.json({ msg: "Wrong OTP" });
  }
});

// submit
app.post("/submit", upload.single("photo"), (req, res) => {
  const { name, enrollment, mobile, email, address } = req.body;

  let exists = users.find(
    u => u.enrollment == enrollment || u.mobile == mobile || u.email == email
  );

  if (exists) {
    return res.json({ msg: "❌ Already Registered" });
  }

  const qrData = `${name} | ${enrollment} | ${mobile}`;

  QRCode.toDataURL(qrData, (err, qrImage) => {
    const user = {
      name,
      enrollment,
      mobile,
      email,
      address,
      photo: req.file.filename,
      qr: qrImage
    };

    users.push(user);

    res.json({ msg: "✅ ID Created", data: user });
  });
});

// excel
app.get("/export", (req, res) => {
  const ws = XLSX.utils.json_to_sheet(users);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  XLSX.writeFile(wb, "students.xlsx");

  res.send("Excel Done");
});

// PORT FIX
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
