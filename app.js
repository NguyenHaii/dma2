require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const productRoutes = require("./routes/productRoutes");
const jwt = require("jsonwebtoken");
const Product = require("./models/Product");

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use("/api", productRoutes);



// Login endpoint - tạo token (demo, không có DB)
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    // DEMO: hard-coded user
    if (username === "admin" && password === "123456") {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Kết nối MongoDB thành công");

    // 👉 Kiểm tra xem đã có dữ liệu chưa
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log("📦 Chưa có sản phẩm nào. Đang thêm dữ liệu mẫu...");

      await Product.insertMany([
        {
          name: "Áo thun nam",
          price: 150000,
          description: "Áo thun nam cotton 100%"
        },
        {
          name: "Quần jeans nữ",
          price: 350000,
          description: "Quần jeans co giãn cao cấp"
        },
        {
          name: "Giày sneaker",
          price: 500000,
          description: "Sneaker phong cách Hàn Quốc"
        }
      ]);

      console.log("✅ Đã thêm dữ liệu mẫu!");
    } else {
      console.log("✅ Database đã có dữ liệu, không cần seed.");
    }

    // 👉 Khởi động server sau khi seed
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error("❌ Kết nối MongoDB thất bại:", err));
