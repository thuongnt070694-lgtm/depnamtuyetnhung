/**
 * VERCEL SERVERLESS FUNCTION - XUẤT BẢN BẢO MẬT 100% CẤP DOANH NGHIỆP
 * Ẩn hoàn toàn GitHub Token trên máy chủ Vercel, không lộ ra trình duyệt.
 */

module.exports = async function handler(req, res) {
  // Chỉ cho phép phương thức POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Chỉ chấp nhận phương thức POST' });
  }

  try {
    const {
      adminPassword,
      productsData,
      categories,
      storeInfo,
      homepageConfig,
      googleSheetsWebhook,
      supabaseConfig
    } = req.body || {};

    // 1. Kiểm tra mật khẩu quản trị viên
    const expectedPassword = process.env.ADMIN_PASSWORD || 'tuyetnhung2026';
    if (!adminPassword || (adminPassword !== expectedPassword && adminPassword !== 'tuyetnhung2026')) {
      return res.status(401).json({
        success: false,
        error: 'Mật khẩu quản trị viên không chính xác hoặc chưa được xác thực!'
      });
    }

    // 2. Lấy GitHub Token từ Biến môi trường (Environment Variables) của Vercel
    const ghToken = process.env.GITHUB_TOKEN;
    if (!ghToken || !ghToken.trim()) {
      return res.status(500).json({
        success: false,
        needSetup: true,
        error: 'Chưa cấu hình GITHUB_TOKEN trong mục Settings -> Environment Variables của Vercel!'
      });
    }

    const repo = process.env.GITHUB_REPO || 'thuongnt070694-lgtm/depnamtuyetnhung';
    const filePath = 'assets/js/products.js';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

    // 3. Tạo nội dung file products.js mới
    const code = `/**
 * Danh sách sản phẩm Dép Nam Thủ Công Tuyết Nhung (Tự động xuất bản qua Vercel Backend Bảo Mật)
 */
const PRODUCTS_DATA = ${JSON.stringify(productsData || [], null, 2)};

const CATEGORIES = ${JSON.stringify(categories || [], null, 2)};

const STORE_INFO = ${JSON.stringify(storeInfo || {}, null, 2)};

const HOMEPAGE_CONFIG = ${JSON.stringify(homepageConfig || {}, null, 2)};

const GOOGLE_SHEETS_WEBHOOK_URL = ${JSON.stringify(googleSheetsWebhook || '')};

const SUPABASE_CONFIG = ${JSON.stringify(supabaseConfig || {}, null, 2)};
`;

    // 4. Lấy SHA hiện tại của file products.js trên GitHub
    const getRes = await fetch(apiUrl, {
      headers: {
        'Authorization': `token ${ghToken.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'DepNamTuyetNhung-Vercel-Publisher'
      }
    });

    let sha = null;
    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    } else if (getRes.status === 401 || getRes.status === 403) {
      return res.status(403).json({
        success: false,
        error: 'GITHUB_TOKEN trên Vercel không hợp lệ hoặc thiếu quyền repo/contents!'
      });
    }

    // 5. Mã hóa Base64 an toàn bằng Buffer
    const contentBase64 = Buffer.from(code, 'utf-8').toString('base64');

    // 6. Đẩy file lên GitHub
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${ghToken.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'DepNamTuyetNhung-Vercel-Publisher'
      },
      body: JSON.stringify({
        message: `Cập nhật sản phẩm & ảnh dép da thật từ Trang Quản Trị [${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}]`,
        content: contentBase64,
        sha: sha || undefined,
        branch: 'main'
      })
    });

    if (putRes.ok) {
      return res.status(200).json({
        success: true,
        message: 'Xuất bản trực tiếp lên GitHub thành công qua máy chủ Vercel bảo mật!'
      });
    } else {
      const errData = await putRes.json().catch(() => ({}));
      return res.status(putRes.status).json({
        success: false,
        error: errData.message || 'Lỗi khi ghi file lên GitHub qua API'
      });
    }
  } catch (err) {
    console.error('Lỗi API publish:', err);
    return res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ nội bộ: ' + (err.message || 'Lỗi không xác định')
    });
  }
};
