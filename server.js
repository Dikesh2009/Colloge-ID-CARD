const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const XLSX = require("xlsx");
const cors = require("cors");
const QRCode = require("qrcode");

const app = express();

// ✅ IMPORTANT MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  // 👈 YE ADD KIYA HAI
app.use(express.static("public"));

let users = [];
let otpStore = {};

// 📸 Upload setup
const storage = multer.diskStorage({
  destination: "./public/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".jpg");
  }
});
const upload = multer({ storage });

// 📩 SEND OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "governmentpolytechnic2025@gmail.com",
      pass: "lyjk sgfe mqrk mmjn" // 👈 yaha apna app password daal
    }
  });

  await transporter.sendMail({
    from: "governmentpolytechnic2025@gmail.com",
    to: email,
    subject: "OTP Verification",
    text: `Your OTP is ${otp}`
  });

  res.json({ msg: "OTP Sent" });
});

// ✅ VERIFY OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    res.json({ success: true });
  } else {
    res.json({ msg: "Wrong OTP" });
  }
});

// 🚫 DUPLICATE + SAVE + QR
app.post("/submit", upload.single("photo"), (req, res) => {
  const { enrollment, mobile, email, name, address } = req.body;

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

// 📊 EXPORT EXCEL
app.get("/export", (req, res) => {
  const ws = XLSX.utils.json_to_sheet(users);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  XLSX.writeFile(wb, "students.xlsx");

  res.send("Excel Downloaded");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on " + PORT));
