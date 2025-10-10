// server.js
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const twilio = require("twilio");

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// Load users from JSON
function loadUsers() {
  return JSON.parse(fs.readFileSync("users.json", "utf-8"));
}

function saveUsers(users) {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

// Đăng nhập
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.json({ success: false, message: "Tài khoản không tồn tại" });
  }

  if (!user.verified) {
    return res.json({ success: false, message: "Tài khoản chưa xác thực" });
  }

  if (user.password !== password) {
    return res.json({ success: false, message: "Sai mật khẩu" });
  }

  return res.json({ success: true, message: "Đăng nhập thành công" });
});

// Đăng ký
app.post("/register", async (req, res) => {
  const { username, password, phone } = req.body;
  const users = loadUsers();

  if (users.find(u => u.username === username)) {
    return res.json({ success: false, message: "Tên đăng nhập đã tồn tại" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  // Gửi SMS bằng Twilio
try {
  await client.messages.create({
    body: `Mã xác thực của bạn là: ${otp}`,
    from: process.env.TWILIO_PHONE,
    to: phone
  });
} catch (err) {
  console.error("Lỗi Twilio:", err); // 👉 In lỗi ra terminal
  return res.json({ success: false, message: "Không gửi được SMS" });
}


  // Lưu tạm OTP vào server (demo)
  // Trong thực tế: nên dùng DB hoặc Redis + thời gian hết hạn
  fs.writeFileSync(`otp-${username}.txt`, JSON.stringify({ otp, username, password, phone }));

  res.json({ success: true, message: "Mã xác thực đã gửi. Kiểm tra SMS." });
});

// Xác nhận OTP (thêm route nếu cần)
app.post("/verify", (req, res) => {
  const { username, otp } = req.body;
  const data = JSON.parse(fs.readFileSync(`otp-${username}.txt`, "utf-8"));
  const users = loadUsers();

  if (data.otp == otp) {
    users.push({ username: data.username, password: data.password, phone: data.phone, verified: true });
    saveUsers(users);
    fs.unlinkSync(`otp-${username}.txt`);
    return res.json({ success: true, message: "Xác thực thành công" });
  } else {
    return res.json({ success: false, message: "Sai mã xác thực" });
  }
});

app.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});
