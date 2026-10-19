/**
 * Danh sách sản phẩm Dép Nam Thủ Công Tuyết Nhung
 * Dữ liệu mẫu phong phú với ảnh chất lượng cao và thông tin chi tiết
 */
const PRODUCTS_DATA = [
  {
    id: 1,
    name: "Dép Quai Ngang Da Bò Sáp Cổ Điển - TN01",
    category: "quai-ngang",
    categoryName: "Dép Quai Ngang",
    price: 380000,
    originalPrice: 480000,
    tag: "Bán Chạy Nhất",
    isBestSeller: true,
    rating: 5,
    reviewsCount: 142,
    images: [
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"
    ],
    leatherType: "Da bò sáp Crazy Horse (càng đi càng bóng đẹp)",
    soleType: "Đế cao su nhiệt dẻo đúc nguyên khối, xẻ rãnh chống trơn trượt",
    stitching: "Khâu viền chỉ dù số 8 thủ công 100% quanh thân đế",
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: ["Nâu Cà Phê", "Nâu Bò", "Đen Huyền"],
    description: "Mẫu dép quai ngang kinh điển được chế tác từ da bò sáp tự nhiên dày 2.0mm. Thiết kế ôm vừa vặn mu bàn chân, lót đệm mút cao cấp êm ái khi đi bộ lâu. Thợ may Tuyết Nhung khâu chỉ dù thủ công từng mũi, đảm bảo không bao giờ bung tróc đế dù đi mưa nắng."
  },
  {
    id: 2,
    name: "Dép Kẹp Xỏ Ngón Da Bò Hạt Cao Cấp - TN02",
    category: "xongon",
    categoryName: "Dép Kẹp (Xỏ Ngón)",
    price: 350000,
    originalPrice: 450000,
    tag: "Mẫu Mới",
    isNew: true,
    rating: 4.9,
    reviewsCount: 89,
    images: [
      "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80"
    ],
    leatherType: "Da bò hạt Mill nhập khẩu mềm mại, chống nhăn xước",
    soleType: "Đế cao su phíp nhẹ, bám dính tốt trên mọi bề mặt ướt",
    stitching: "Quai kẹp gia cố 2 lớp đệm dù chịu lực giật mạnh",
    sizes: [38, 39, 40, 41, 42, 43],
    colors: ["Nâu Bò Sáng", "Đen Nhám"],
    description: "Dép kẹp xỏ ngón bản quai êm, thiết kế kẹp ngón được bọc da mềm không gây đau rát kẽ ngón chân kể cả trong những ngày đầu đi. Phong cách phóng khoáng, cực kỳ thích hợp dạo phố, đi biển, cà phê cuối tuần."
  },
  {
    id: 3,
    name: "Dép Quai Chéo Da Bò Pullup Độc Bản - TN03",
    category: "quai-ngang",
    categoryName: "Dép Quai Ngang",
    price: 420000,
    originalPrice: 550000,
    tag: "Thủ Công Tinh Xảo",
    isBestSeller: true,
    rating: 5,
    reviewsCount: 118,
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80"
    ],
    leatherType: "Da bò Pull-up phủ sáp bóng nhẹ, vân da tự nhiên độc bản",
    soleType: "Đế công thái học (Arch Support) nâng đỡ vòm chân",
    stitching: "Chỉ sáp nhập khẩu chống nước, may kép chịu lực",
    sizes: [39, 40, 41, 42, 43, 44],
    colors: ["Nâu Socola", "Vàng Bò Vintage"],
    description: "Thiết kế quai chéo hiện đại tạo điểm nhấn nam tính lịch lãm. Mặt lót chân bằng da thật dập chìm logo Tuyết Nhung, thấm hút mồ hôi chân tuyệt đối, đi thoáng mát không gây mùi hôi."
  },
  {
    id: 4,
    name: "Dép Quai Hậu Nam Sandal Da Bò Khâu Viền - TN04",
    category: "sandal",
    categoryName: "Sandal / Quai Hậu",
    price: 460000,
    originalPrice: 590000,
    tag: "Bảo Hành 12 Tháng",
    isBestSeller: false,
    rating: 4.8,
    reviewsCount: 76,
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=800&q=80"
    ],
    leatherType: "Da bò Nappa cao cấp chọn lọc từng tấm nguyên cọng",
    soleType: "Đế kép PU + Cao su tăng chiều cao êm ái 3.5cm",
    stitching: "Đai khóa đồng đúc chống gỉ sét, khóa dán siêu bền",
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: ["Đen Tuyền", "Nâu Da Bò"],
    description: "Mẫu sandal thanh lịch phù hợp cho học sinh, sinh viên, giáo viên, nhân viên văn phòng hoặc dạo phố. Quai hậu có thể tùy chỉnh hoặc tháo gập linh hoạt thành dép lê tiện dụng 2 trong 1."
  },
  {
    id: 5,
    name: "Dép Sục Da Nam Bịt Mũi Phong Cách Quý Tộc - TN05",
    category: "suc-da",
    categoryName: "Dép Sục Da Nam",
    price: 490000,
    originalPrice: 650000,
    tag: "Sang Trọng Lịch Lãm",
    isBestSeller: true,
    rating: 5,
    reviewsCount: 95,
    images: [
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=800&q=80"
    ],
    leatherType: "Da bò sáp dầu đanh dẻo, bề mặt láng mịn sang trọng",
    soleType: "Đế cao su phíp vân gỗ cao cấp, chống trượt công nghệ mới",
    stitching: "Viền khâu may tay thủ công kỹ thuật Goodyear cổ điển",
    sizes: [38, 39, 40, 41, 42, 43],
    colors: ["Đen Bóng", "Nâu Cổ Điển", "Xanh Navy"],
    description: "Sự kết hợp hoàn hảo giữa vẻ trang trọng của đôi giày tây và sự tiện lợi, thoải mái của dép lê. Phối cùng quần tây, quần kaki hay jeans đều cực kỳ tôn dáng và đẳng cấp."
  },
  {
    id: 6,
    name: "Dép Quai Bản To Da Bò Khóa Kim Loại Đồng - TN06",
    category: "quai-ngang",
    categoryName: "Dép Quai Ngang",
    price: 395000,
    originalPrice: 500000,
    tag: "Được Yêu Thích",
    isBestSeller: false,
    rating: 4.9,
    reviewsCount: 64,
    images: [
      "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80"
    ],
    leatherType: "Da bò Mill dập vân sỏi mạnh mẽ, chịu nước cực tốt",
    soleType: "Đế đệm khí chống sốc gót chân khi di chuyển nhiều",
    stitching: "Khóa đồng đúc chống oxy hóa bền bỉ theo năm tháng",
    sizes: [39, 40, 41, 42, 43],
    colors: ["Nâu Bò Tự Nhiên", "Đen Đậm"],
    description: "Mẫu quai to phong cách Đức mạnh mẽ, có khóa đồng tăng giảm độ rộng theo độ dày mu bàn chân. Lớp lót da lộn êm ái chống bí mồ hôi kể cả trong mùa hè nóng nực."
  },
  {
    id: 7,
    name: "Dép Xỏ Ngón Da Bò Chữ Y Đơn Giản Tinh Tế - TN07",
    category: "xongon",
    categoryName: "Dép Kẹp (Xỏ Ngón)",
    price: 330000,
    originalPrice: 420000,
    tag: "Giá Tốt Xưởng",
    isBestSeller: false,
    rating: 4.7,
    reviewsCount: 52,
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=800&q=80"
    ],
    leatherType: "Da bò cật mộc 100%, bóng sáng tự nhiên",
    soleType: "Đế cao su nhiệt dẻo chống mài mòn cao",
    stitching: "Mối nối gia cố đinh tán đồng cao cấp",
    sizes: [38, 39, 40, 41, 42, 43, 44],
    colors: ["Vàng Bò", "Nâu Đậm"],
    description: "Dành riêng cho các quý ông thích sự gọn nhẹ, thanh thoát nhưng vẫn toát lên chất da bò mộc mạc đẳng cấp. Xưởng Tuyết Nhung tự cắt rập và hoàn thiện tỉ mỉ từng đôi."
  },
  {
    id: 8,
    name: "Dép Sandal Hai Quai Khóa Cài Da Thật - TN08",
    category: "sandal",
    categoryName: "Sandal / Quai Hậu",
    price: 450000,
    originalPrice: 580000,
    tag: "Đa Năng",
    isBestSeller: false,
    rating: 4.8,
    reviewsCount: 43,
    images: [
      "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"
    ],
    leatherType: "Da bò Veg-tan (thuộc thảo mộc an toàn cho da chân)",
    soleType: "Đế cao su xốp EVA đàn hồi giảm tải trọng lượng",
    stitching: "Khâu tay toàn bộ chu vi đế",
    sizes: [39, 40, 41, 42, 43],
    colors: ["Nâu Vintage", "Đen Mờ"],
    description: "Đôi sandal lý tưởng cho những chuyến đi du lịch dài ngày hay công việc thường ngày đòi hỏi đi lại nhiều. Da mềm như bơ, không gây cọ xát gót chân."
  }
];

// Danh mục sản phẩm
const CATEGORIES = [
  { id: "all", name: "Tất Cả Sản Phẩm", count: 8 },
  { id: "quai-ngang", name: "Dép Quai Ngang", count: 3 },
  { id: "xongon", name: "Dép Kẹp (Xỏ Ngón)", count: 2 },
  { id: "sandal", name: "Sandal & Quai Hậu", count: 2 },
  { id: "suc-da", name: "Dép Sục Da Nam", count: 1 }
];

// Thông tin cửa hàng
const STORE_INFO = {
  name: "Dép Nam Tuyết Nhung",
  slogan: "Giày Dép Da Nam Thủ Công - Tự Làm Tại Xưởng",
  hotline: "0348.789.257",
  zalo: "0348789257", // Số Zalo để chuyển hướng chat
  address: "1005C Hà Huy Giáp, Phường An Phú Đông, Thành phố Hồ Chí Minh",
  email: "depnamtuyetnhung@gmail.com",
  workingHours: "08:00 - 21:30 (Cả Thứ 7 & Chủ Nhật)",
  warrantyText: "Bảo hành 12 tháng da & chỉ khâu trọn đời đế",
  shippingText: "Miễn phí giao hàng toàn quốc từ 2 đôi"
};
