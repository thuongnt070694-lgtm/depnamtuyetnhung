# Website Bán Hàng: Dép Nam Tuyết Nhung (Giày Dép Da Nam Thủ Công)

Website thương mại điện tử chuyên biệt dành cho thương hiệu **Dép Nam Tuyết Nhung**, chuyên dòng dép da nam thủ công, may tay, da bò thật 100%.

---

## 🌟 1. Điểm Nổi Bật Của Website

- **Giao diện chuẩn Da Thủ Công (Leather Craft Luxury):** Tông màu nâu da bò sáp, đen lịch lãm và ánh vàng kim sang trọng, tạo cảm giác tin cậy, bền bỉ và nam tính.
- **Tương thích 100% Mobile & Máy tính:** Hiển thị mượt mà trên điện thoại, máy tính bảng và màn hình lớn.
- **Giỏ hàng thông minh (Local Storage):** Lưu trữ sản phẩm, tăng/giảm số lượng, chọn Size (38 - 44), chọn màu sắc mà không bị mất khi tải lại trang.
- **Tính năng Chốt Đơn Đa Kênh Phù Hợp Thị Trường Việt Nam:**
  1. **Đặt hàng COD nhận hàng trả tiền:** Form nhập địa chỉ, họ tên, số điện thoại, ghi chú cho thợ đóng quai.
  2. **Chốt đơn 1-Click qua Zalo:** Tự động tạo tin nhắn Zalo kèm theo danh sách dép, size, địa chỉ và tổng tiền gửi thẳng cho chủ xưởng.
  3. **Quét mã VietQR động:** Tự động tạo mã QR ngân hàng khớp đúng số tiền đơn hàng để khách chuyển khoản nhanh.
- **Tính năng Tra Cứu & Tính Size Chân:** Khách hàng chỉ cần nhập chiều dài bàn chân (cm), website tự động đề xuất size chuẩn kèm mẹo cho chân bè/dày.
- **Popup Xem Nhanh (Quick View):** Phóng to ảnh chi tiết da, cấu tạo đế cao su, đường chỉ may dù số 8.
- **Hệ thống Mã Giảm Giá:** Tích hợp mã khuyến mãi `TUYETNHUNG` (giảm 10%), `FREESHIP` (hỗ trợ ship).

---

## 🚀 2. Cách Mở & Sử Dụng Ngay Lập Tức

Không cần cài đặt Node.js hay phần mềm phức tạp:
1. Mở thư mục `d:\websiteDEPNAM`.
2. Nhấp đúp chuột vào file **`index.html`** để mở trực tiếp trên Google Chrome, Cốc Cốc, Microsoft Edge hoặc Safari.

---

## ⚙️ 3. Hướng Dẫn Tùy Chỉnh Thông Tin Cửa Hàng

### A. Thay đổi Số Điện Thoại & Zalo
Mở file `assets/js/products.js`, tìm đoạn `STORE_INFO` ở cuối file:
```javascript
const STORE_INFO = {
  name: "Dép Nam Tuyết Nhung",
  hotline: "0348.789.257", // Số hotline cửa hàng
  zalo: "0348789257",       // Số điện thoại đăng ký Zalo nhận đơn
  address: "1005C Hà Huy Giáp, Phường An Phú Đông, Thành phố Hồ Chí Minh",
  email: "depnamtuyetnhung@gmail.com",
};
```
Đồng thời, bạn có thể tìm và thay thế chuỗi số `0987654321` trong `index.html` sang số của bạn.

### B. Thay đổi Tài Khoản Ngân Hàng Quét Mã VietQR
Trong file `assets/js/app.js`, tìm hàm `updateQrCode`:
```javascript
const bankId = "VCB"; // Mã ngân hàng: VCB (Vietcombank), MB (MBBank), TCB (Techcombank), ACB, ICB (VietinBank)...
const accountNo = "9988776655"; // Số tài khoản nhận tiền
const accountName = "NGUYEN THI TUYET NHUNG"; // Tên chủ tài khoản
```

### C. Thêm / Sửa Sản Phẩm Mới
Mở file `assets/js/products.js`, bạn chỉ cần copy thêm một khối sản phẩm mẫu trong mảng `PRODUCTS_DATA`:
```javascript
{
  id: 9,
  name: "Tên Mẫu Dép Mới",
  category: "quai-ngang", // 'quai-ngang', 'xongon', 'sandal', 'suc-da'
  categoryName: "Dép Quai Ngang",
  price: 390000,
  originalPrice: 490000,
  tag: "Mới Về",
  images: ["đường_dẫn_ảnh.jpg"],
  leatherType: "Da bò Mill chống xước",
  soleType: "Đế cao su đúc",
  stitching: "Khâu chỉ dù viền quanh đế",
  sizes: [38, 39, 40, 41, 42, 43],
  colors: ["Nâu Bò", "Đen"],
  description: "Mô tả chi tiết sản phẩm..."
}
```

---

## 🌐 4. Hướng Dẫn Đưa Website Lên Mạng (Miễn Phí 100%)

Bạn có thể đưa trang web lên Internet để khách hàng trên toàn quốc truy cập bất cứ lúc nào qua một trong các cách sau:

- **Cách 1: Kéo thả lên Netlify Drop (Cực nhanh - 1 phút):**
  1. Truy cập `https://app.netlify.com/drop`.
  2. Kéo toàn bộ thư mục `d:\websiteDEPNAM` thả vào trình duyệt.
  3. Netlify sẽ cung cấp ngay một đường link (ví dụ: `depnamtuyetnhung.netlify.app`) để bạn gửi cho khách hàng hoặc gắn lên Zalo / Facebook!

- **Cách 2: Đưa lên Vercel hoặc GitHub Pages:**
  Tạo repository trên GitHub và bật chức năng **GitHub Pages** (chọn nhánh `main`).

---

*Thiết kế & phát triển dành riêng cho Thương Hiệu Dép Nam Thủ Công Tuyết Nhung.*
