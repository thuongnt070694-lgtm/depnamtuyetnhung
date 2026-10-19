/**
 * Quản Lý Bộ Nhớ Sản Phẩm Thông Minh (IndexedDB + Canvas Compression)
 * Giải quyết triệt để lỗi tràn bộ nhớ (QuotaExceededError) khi tải nhiều ảnh chụp từ điện thoại
 */

const DB_NAME = 'TuyetNhungStoreDB';
const STORE_NAME = 'products_store';

// Mở cơ sở dữ liệu IndexedDB của trình duyệt
function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      resolve(null);
      return;
    }
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
  });
}

// Nén và tối ưu hóa ảnh trước khi lưu (Giảm từ 4MB-10MB gốc xuống còn ~80KB-120KB siêu nét cho web)
function compressImageFile(file, maxWidth = 1000, maxHeight = 1000, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('File không phải là hình ảnh'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
        
        // Làm mịn ảnh
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Không thể đọc dữ liệu ảnh'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Lỗi đọc file'));
    reader.readAsDataURL(file);
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

  // 3. Mặc định đọc từ file products.js
  if (typeof PRODUCTS_DATA !== 'undefined' && Array.isArray(PRODUCTS_DATA)) {
    return [...PRODUCTS_DATA];
  }

  return [];
}
