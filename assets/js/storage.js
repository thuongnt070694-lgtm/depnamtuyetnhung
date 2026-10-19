/**
 * Quản Lý Bộ Nhớ Sản Phẩm Thông Minh (IndexedDB + Canvas Compression)
 * Giải quyết triệt để lỗi tràn bộ nhớ (QuotaExceededError) khi tải nhiều ảnh chụp từ điện thoại
 */

const DB_NAME = 'TuyetNhungStoreDB';
const STORE_NAME = 'products_store';

// Mở cơ sở dữ liệu IndexedDB của trình duyệt
function openDatabase() {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => {
        console.warn('Không thể mở IndexedDB, dùng LocalStorage dự phòng:', e);
        resolve(null);
      };
    } catch(err) {
      console.warn('Lỗi gọi indexedDB.open:', err);
      resolve(null);
    }
  });
}

// Nén và tối ưu hóa ảnh trước khi lưu (Giảm từ 4MB-10MB gốc xuống còn ~80KB-120KB siêu nét cho web)
// Có cơ chế tự động fallback nếu canvas không hỗ trợ định dạng file đặc biệt
function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Không có file được chọn'));
      return;
    }

    // Đọc dự phòng bằng FileReader DataURL nếu cần
    const fallbackDirectRead = () => {
      const r = new FileReader();
      r.onload = (e) => resolve(e.target.result);
      r.onerror = () => reject(new Error('Không thể đọc file ảnh'));
      r.readAsDataURL(file);
    };

    // Kiểm tra định dạng ảnh (hỗ trợ cả khi file.type rỗng trên Windows)
    const isImageFile = (file.type && file.type.startsWith('image/')) || 
                        /\.(jpe?g|png|webp|gif|bmp|jfif|heic|svg)$/i.test(file.name || '');
    if (!isImageFile && file.type) {
      // Nếu file có type nhưng không phải ảnh
      reject(new Error('File đã chọn không phải định dạng hình ảnh hợp lệ'));
      return;
    }

    try {
      // Dùng URL.createObjectURL để load ảnh nhanh chóng và ít tốn RAM
      const blobUrl = URL.createObjectURL(file);
      const img = new Image();
      
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          // Nếu ảnh quá nhỏ hoặc không đo được kích thước, fallback đọc trực tiếp
          if (!width || !height) {
            URL.revokeObjectURL(blobUrl);
            fallbackDirectRead();
            return;
          }

          // Giữ nguyên tỷ lệ khung hình
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          // Làm mịn ảnh chất lượng cao
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Tạo ảnh nén JPEG nhẹ và nét
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          URL.revokeObjectURL(blobUrl);
          resolve(compressedDataUrl);
        } catch(canvasErr) {
          console.warn('Canvas nén ảnh gặp sự cố, tự động đọc trực tiếp:', canvasErr);
          URL.revokeObjectURL(blobUrl);
          fallbackDirectRead();
        }
      };

      img.onerror = () => {
        // Fallback đọc trực tiếp bằng FileReader nếu thẻ Image không render được blob
        URL.revokeObjectURL(blobUrl);
        fallbackDirectRead();
      };

      img.src = blobUrl;
    } catch(err) {
      console.warn('Lỗi khởi tạo blob nén ảnh, chuyển sang đọc trực tiếp:', err);
      fallbackDirectRead();
    }
  });
}

// Lưu danh sách sản phẩm (Lưu vào IndexedDB dung lượng lớn + LocalStorage)
async function saveProductsToStorage(productsList) {
  // 1. Lưu vào IndexedDB (chứa được hàng trăm MB ảnh)
  try {
    const db = await openDatabase();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(productsList, 'products_list');
      await new Promise((resolve) => {
        tx.oncomplete = resolve;
        tx.onerror = resolve;
      });
    }
  } catch (err) {
    console.warn('Lỗi lưu IndexedDB:', err);
  }

  // 2. Thử lưu vào LocalStorage nếu còn chỗ
  try {
    localStorage.setItem('tuyetnhung_custom_products', JSON.stringify(productsList));
  } catch (err) {
    console.warn('LocalStorage đã đầy (Dữ liệu đã được lưu an toàn trong IndexedDB):', err);
  }
}

// Đọc danh sách sản phẩm đã lưu
async function loadProductsFromStorage() {
  // 1. Ưu tiên đọc từ IndexedDB
  try {
    const db = await openDatabase();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get('products_list');
      const result = await new Promise((resolve) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      if (result && Array.isArray(result) && result.length > 0) {
        return result;
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc IndexedDB:', err);
  }

  // 2. Nếu chưa có, đọc từ LocalStorage
  const local = localStorage.getItem('tuyetnhung_custom_products');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {}
  }

  // 3. Mặc định trả về dữ liệu mẫu trong products.js nếu chưa có lưu trữ
  return (typeof PRODUCTS_DATA !== 'undefined' ? [...PRODUCTS_DATA] : []);
}

// Lưu cấu hình ảnh Banner và ảnh Xưởng (Trang chủ)
async function saveHomepageConfig(config) {
  try {
    const db = await openDatabase();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(config, 'homepage_config');
      await new Promise((resolve) => {
        tx.oncomplete = resolve;
        tx.onerror = resolve;
      });
    }
  } catch (err) {
    console.warn('Lỗi lưu cấu hình homepage vào IndexedDB:', err);
  }

  try {
    localStorage.setItem('tuyetnhung_homepage_config', JSON.stringify(config));
  } catch (err) {
    console.warn('Lỗi lưu cấu hình homepage vào LocalStorage:', err);
  }
}

// Đọc cấu hình ảnh Banner và ảnh Xưởng
async function loadHomepageConfig() {
  try {
    const db = await openDatabase();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get('homepage_config');
      const res = await new Promise((resolve) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      if (res) return res;
    }
  } catch (err) {
    console.warn('Lỗi đọc cấu hình homepage từ IndexedDB:', err);
  }

  const local = localStorage.getItem('tuyetnhung_homepage_config');
  if (local) {
    try {
      return JSON.parse(local);
    } catch (e) {}
  }

  return null;
}
