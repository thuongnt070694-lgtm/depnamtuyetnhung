/**
 * Ứng dụng Bán Hàng Dép Nam Tuyết Nhung
 * Xử lý logic Giỏ hàng, Bộ lọc, Modal Đặt hàng COD, Chốt đơn Zalo & Tính Size
 */

// State quản lý toàn cục
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'default';
let cart = JSON.parse(localStorage.getItem('tuyetnhung_cart')) || [];
let activeQuickViewProduct = null;
let selectedQuickViewSize = null;
let appliedDiscount = 0; // % giảm giá

let loadedProducts = typeof PRODUCTS_DATA !== 'undefined' ? [...PRODUCTS_DATA] : [];

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof loadProductsFromStorage === 'function') {
    loadedProducts = await loadProductsFromStorage();
  }
  await applyHomepageConfig();
  initCategories();
  renderProducts();
  updateCartBadge();
  setupEventListeners();
});

// Tự động cập nhật nếu tab khác thay đổi dữ liệu
window.addEventListener('storage', async () => {
  if (typeof loadProductsFromStorage === 'function') {
    loadedProducts = await loadProductsFromStorage();
    renderProducts();
  }
  initCategories();
  await applyHomepageConfig();
});

// Hàm áp dụng tỷ lệ khung ảnh linh hoạt & chuẩn 100% bằng CSS aspect-ratio
function applyBoxAspect(box, img, ratio) {
  if (!box) return;
  box.classList.remove('aspect-[4/5]', 'aspect-square', 'aspect-[4/3]', 'aspect-[16/9]', 'aspect-[3/2]', 'aspect-[3/4]', 'aspect-[9/16]', 'aspect-auto', 'min-h-[220px]', 'min-h-[260px]', 'min-h-[300px]');

  const r = (ratio || 'auto').toString().trim();

  if (r === 'auto') {
    const updateAuto = () => {
      if (img && img.naturalWidth && img.naturalHeight) {
        box.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
      } else {
        box.style.aspectRatio = 'auto';
      }
    };
    if (img) {
      if (img.complete && img.naturalWidth) {
        updateAuto();
      } else {
        img.addEventListener('load', updateAuto);
      }
    }
  } else if (r === '1/1' || r === '1:1') {
    box.style.aspectRatio = '1 / 1';
  } else if (r === '16/9' || r === '16:9') {
    box.style.aspectRatio = '16 / 9';
  } else if (r === '4/3' || r === '4:3') {
    box.style.aspectRatio = '4 / 3';
  } else if (r === '3/2' || r === '3:2') {
    box.style.aspectRatio = '3 / 2';
  } else if (r === '4/5' || r === '4:5') {
    box.style.aspectRatio = '4 / 5';
  } else if (r === '3/4' || r === '3:4') {
    box.style.aspectRatio = '3 / 4';
  } else if (r === '9/16' || r === '9:16') {
    box.style.aspectRatio = '9 / 16';
  } else if (r.includes('/')) {
    box.style.aspectRatio = r.replace('/', ' / ');
  } else if (r.includes(':')) {
    box.style.aspectRatio = r.replace(':', ' / ');
  } else {
    box.style.aspectRatio = r;
  }
}

// Tải và áp dụng cấu hình ảnh Banner & Xưởng da
async function applyHomepageConfig() {
  let config = null;
  if (typeof loadHomepageConfig === 'function') {
    config = await loadHomepageConfig();
  }
  if (!config && typeof HOMEPAGE_CONFIG !== 'undefined') {
    config = HOMEPAGE_CONFIG;
  }

  const heroBox = document.getElementById('hero-featured-box');
  const heroImg = document.getElementById('hero-featured-img');
  const heroName = document.getElementById('hero-featured-name');
  const heroPrice = document.getElementById('hero-featured-price');
  const heroOrigPrice = document.getElementById('hero-featured-original-price');
  const storyBox1 = document.getElementById('story-box-1');
  const storyBox2 = document.getElementById('story-box-2');
  const story1 = document.getElementById('story-img-1');
  const story2 = document.getElementById('story-img-2');

  const isCustomHero = config && config.heroImage && !config.heroImage.includes('photo-1603808033192-082d6919d3e1');

  if (isCustomHero) {
    if (heroImg && config.heroImage) heroImg.src = config.heroImage;
    if (heroName && config.heroTitle) heroName.innerText = config.heroTitle;
    if (heroPrice && config.heroPrice) heroPrice.innerText = formatCurrency(config.heroPrice);
    if (heroOrigPrice && config.heroOriginalPrice) heroOrigPrice.innerText = formatCurrency(config.heroOriginalPrice);
  } else if (loadedProducts && loadedProducts.length > 0 && loadedProducts[0].images && loadedProducts[0].images.length > 0) {
    // Tự động lấy ảnh Dép Da Thật của mẫu dép đầu tiên đưa lên Banner
    const p1 = loadedProducts[0];
    if (heroImg && p1.images[0]) heroImg.src = p1.images[0];
    if (heroName) heroName.innerText = p1.name;
    if (heroPrice) heroPrice.innerText = formatCurrency(p1.price);
    if (heroOrigPrice) heroOrigPrice.innerText = formatCurrency(p1.originalPrice || p1.price);
  }

  // Áp dụng tỉ lệ (Ratio), góc nhìn (Position), kiểu hiển thị (Fit) và màu nền (Bg) cho Banner
  if (heroBox && heroImg && config) {
    const fit = config.heroImageFit || 'contain';
    const ratio = config.heroImageRatio || '4/5';
    const pos = config.heroImagePosition || 'center';
    const bg = config.heroImageBg || 'dark';

    applyBoxAspect(heroBox, heroImg, ratio);

    // Màu nền khung
    heroBox.classList.remove('bg-stone-900', 'bg-white', 'bg-[#24150e]');
    if (bg === 'white') {
      heroBox.classList.add('bg-white');
    } else if (bg === 'amber') {
      heroBox.classList.add('bg-[#24150e]');
    } else {
      heroBox.classList.add('bg-stone-900');
    }

    // Kiểu hiển thị ảnh và góc nhìn
    heroImg.classList.remove('object-contain', 'object-cover', 'object-center', 'object-top', 'object-bottom');
    heroImg.classList.add(`object-${fit}`);
    heroImg.classList.add(`object-${pos}`);
  }

  if (config) {
    if (story1 && config.storyImage1) story1.src = config.storyImage1;
    if (story2 && config.storyImage2) story2.src = config.storyImage2;

    // Áp dụng tỉ lệ, kiểu hiển thị, góc nhìn và màu nền cho Tấm ảnh 1
    if (storyBox1 && story1) {
      const fit1 = config.story1Fit || config.storyImage1Fit || 'contain';
      const ratio1 = config.story1Ratio || config.storyImage1Ratio || 'auto';
      const pos1 = config.story1Position || config.storyImage1Position || 'center';
      const bg1 = config.story1Bg || config.storyImage1Bg || 'dark';

      applyBoxAspect(storyBox1, story1, ratio1);

      storyBox1.classList.remove('bg-stone-900', 'bg-white', 'bg-[#24150e]');
      if (bg1 === 'white') {
        storyBox1.classList.add('bg-white');
      } else if (bg1 === 'amber') {
        storyBox1.classList.add('bg-[#24150e]');
      } else {
        storyBox1.classList.add('bg-stone-900');
      }

      story1.classList.remove('object-contain', 'object-cover', 'object-center', 'object-top', 'object-bottom');
      story1.classList.add(`object-${fit1}`);
      story1.classList.add(`object-${pos1}`);
    }

    // Áp dụng tỉ lệ, kiểu hiển thị, góc nhìn và màu nền cho Tấm ảnh 2
    if (storyBox2 && story2) {
      const fit2 = config.story2Fit || config.storyImage2Fit || 'contain';
      const ratio2 = config.story2Ratio || config.storyImage2Ratio || 'auto';
      const pos2 = config.story2Position || config.storyImage2Position || 'center';
      const bg2 = config.story2Bg || config.storyImage2Bg || 'dark';

      applyBoxAspect(storyBox2, story2, ratio2);

      storyBox2.classList.remove('bg-stone-900', 'bg-white', 'bg-[#24150e]');
      if (bg2 === 'white') {
        storyBox2.classList.add('bg-white');
      } else if (bg2 === 'amber') {
        storyBox2.classList.add('bg-[#24150e]');
      } else {
        storyBox2.classList.add('bg-stone-900');
      }

      story2.classList.remove('object-contain', 'object-cover', 'object-center', 'object-top', 'object-bottom');
      story2.classList.add(`object-${fit2}`);
      story2.classList.add(`object-${pos2}`);
    }
  }
}

// Format tiền tệ Việt Nam (VNĐ)
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Lấy danh mục đang hoạt động (kết hợp CATEGORIES gốc và các danh mục mới tạo từ quản trị)
function getActiveCategories() {
  let cats = typeof CATEGORIES !== 'undefined' ? [...CATEGORIES] : [];
  try {
    const saved = localStorage.getItem('tuyetnhung_custom_categories');
    if (saved) {
      const customCats = JSON.parse(saved);
      if (Array.isArray(customCats) && customCats.length > 0) {
        cats = [
          {
            id: 'all',
            name: 'Tất Cả Sản Phẩm',
            count: loadedProducts.length
          }
        ];
        customCats.forEach(c => {
          const count = loadedProducts.filter(p => p.category === c.id).length;
          cats.push({
            id: c.id,
            name: c.name,
            count: count
          });
        });
      }
    }
  } catch(e) {}
  return cats;
}

// Khởi tạo các danh mục
function initCategories() {
  const categoryContainer = document.getElementById('category-pills');
  if (!categoryContainer) return;

  const cats = getActiveCategories();

  categoryContainer.innerHTML = cats.map(cat => `
    <button 
      onclick="filterCategory('${cat.id}')"
      class="cat-pill px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border whitespace-nowrap
        ${currentCategory === cat.id 
          ? 'bg-amber-900 text-white border-amber-900 shadow-md' 
          : 'bg-white text-stone-700 border-stone-200 hover:border-amber-700 hover:text-amber-900'}"
      data-category="${cat.id}"
    >
      ${cat.name}
    </button>
  `).join('');
}

// Lọc sản phẩm theo danh mục
function filterCategory(catId) {
  currentCategory = catId;
  initCategories();
  renderProducts();
}

// Xử lý tìm kiếm
function handleSearch(keyword) {
  currentSearch = keyword.trim().toLowerCase();
  renderProducts();
}

// Xử lý sắp xếp
function handleSort(sortType) {
  currentSort = sortType;
  renderProducts();
}

// Lấy toàn bộ sản phẩm hiện tại
function getAllCurrentProducts() {
  return loadedProducts && loadedProducts.length > 0 ? loadedProducts : PRODUCTS_DATA;
}

// Lấy danh sách sản phẩm đã lọc & sắp xếp
function getFilteredProducts() {
  let list = [...getAllCurrentProducts()];

  // Lọc theo danh mục
  if (currentCategory !== 'all') {
    list = list.filter(p => p.category === currentCategory);
  }

  // Lọc theo từ khóa tìm kiếm
  if (currentSearch) {
    list = list.filter(p => 
      p.name.toLowerCase().includes(currentSearch) ||
      p.leatherType.toLowerCase().includes(currentSearch) ||
      p.categoryName.toLowerCase().includes(currentSearch) ||
      p.colors.some(c => c.toLowerCase().includes(currentSearch))
    );
  }

  // Sắp xếp
  if (currentSort === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  return list;
}

// Tạo nút bấm liên kết mua hàng từ trang khác (Facebook, Shopee, TikTok, Lazada...)
function renderExternalLinkButton(product, isQuickView = false) {
  if (!product || !product.externalLink) return '';
  const text = product.externalLinkText || 'Xem & Mua Trên Trang Này';
  const t = text.toLowerCase();
  
  let icon = '🔗';
  if (t.includes('facebook') || t.includes('fb')) icon = '💬';
  else if (t.includes('shopee')) icon = '🛍️';
  else if (t.includes('tiktok')) icon = '🎵';
  else if (t.includes('lazada')) icon = '🛒';
  else if (t.includes('zalo')) icon = '💬';
  else if (t.includes('tiki')) icon = '📦';
  else if (t.includes('sendo')) icon = '🚚';

  const display = text.includes('↗') ? text : `${text} ↗`;

  if (isQuickView) {
    return `
      <div class="pt-2.5">
        <a 
          href="${product.externalLink}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 border border-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs group/extlink hover:scale-[1.01]"
        >
          <span class="text-sm">${icon}</span>
          <span>${display}</span>
        </a>
      </div>
    `;
  }

  return `
    <a 
      href="${product.externalLink}" 
      target="_blank" 
      rel="noopener noreferrer"
      onclick="event.stopPropagation()"
      class="mt-2.5 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-950 border border-amber-300/80 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs group/extlink hover:scale-[1.01]"
    >
      <span class="text-sm">${icon}</span>
      <span class="truncate">${display}</span>
    </a>
  `;
}

// Render lưới sản phẩm
function renderProducts() {
  const container = document.getElementById('product-grid');
  const countEl = document.getElementById('product-count');
  if (!container) return;

  const products = getFilteredProducts();
  if (countEl) countEl.innerText = `${products.length} sản phẩm`;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50 text-amber-800 mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h3 class="text-xl font-bold text-stone-800 mb-1">Không tìm thấy sản phẩm phù hợp</h3>
        <p class="text-stone-500 mb-4">Vui lòng thử chọn danh mục khác hoặc xóa từ khóa tìm kiếm.</p>
        <button onclick="filterCategory('all'); document.getElementById('search-input').value='';" class="px-5 py-2 btn-leather-primary rounded-lg text-sm font-semibold">Xem tất cả sản phẩm</button>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(product => {
    const discountPercent = Math.round((1 - product.price / product.originalPrice) * 100);
    const defaultSize = product.sizes[0];

    return `
      <div class="product-card bg-white rounded-2xl overflow-hidden border border-stone-100 flex flex-col group relative shadow-sm hover:border-amber-200">
        <!-- Badge -->
        <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          ${product.tag ? `
            <span class="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-900 text-white shadow-sm flex items-center gap-1">
              <svg class="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              ${product.tag}
            </span>
          ` : ''}
          <span class="px-2 py-0.5 text-xs font-extrabold rounded-md bg-red-600 text-white shadow-sm w-max">
            -${discountPercent}%
          </span>
        </div>

        <!-- Khung ảnh sản phẩm -->
        <div class="relative overflow-hidden bg-stone-100 aspect-square cursor-pointer" onclick="openQuickView(${product.id})">
          <img 
            src="${product.images[0]}" 
            alt="${product.name}" 
            class="img-zoom w-full h-full object-cover object-center"
            loading="lazy"
          />
          ${product.images.length > 1 ? `
            <span class="absolute bottom-2 right-2 z-10 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
              📷 ${product.images.length} góc chụp
            </span>
          ` : ''}
          <div class="absolute inset-0 bg-stone-900 bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button class="px-4 py-2 bg-white text-stone-900 font-bold text-xs rounded-full shadow-lg hover:bg-amber-800 hover:text-white transition-colors">
              🔍 Xem ${product.images.length} Góc Ảnh Chi Tiết
            </button>
          </div>
        </div>

        <!-- Nội dung card -->
        <div class="p-5 flex flex-col flex-grow justify-between">
          <div>
            <!-- Danh mục & Đánh giá -->
            <div class="flex items-center justify-between text-xs text-stone-500 mb-1.5">
              <span class="font-medium text-amber-900">${product.categoryName}</span>
              <div class="flex items-center text-amber-500">
                <span>★ ${product.rating}</span>
                <span class="text-stone-400 ml-1">(${product.reviewsCount})</span>
              </div>
            </div>

            <!-- Tên sản phẩm -->
            <h3 
              onclick="openQuickView(${product.id})"
              class="font-bold text-stone-900 text-base mb-2 hover:text-amber-800 cursor-pointer line-clamp-2 transition-colors leading-snug"
              title="${product.name}"
            >
              ${product.name}
            </h3>

            <!-- Đặc điểm nổi bật -->
            <p class="text-xs text-stone-600 line-clamp-1 mb-3 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-700 flex-shrink-0"></span>
              ${product.leatherType}
            </p>

            <!-- Chọn size nhanh -->
            <div class="mb-4">
              <div class="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                <span>Size sẵn có:</span>
                <button onclick="openSizeGuideModal()" class="text-amber-800 hover:underline">Bảng đo size</button>
              </div>
              <div class="flex flex-wrap gap-1.5" id="size-options-${product.id}">
                ${product.sizes.map((s, idx) => `
                  <button 
                    onclick="selectCardSize(${product.id}, ${s})"
                    data-size="${s}"
                    class="card-size-btn-${product.id} text-xs font-semibold px-2.5 py-1 rounded border ${idx === 0 ? 'bg-amber-900 text-white border-amber-900' : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-700'}"
                  >
                    ${s}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Giá & Nút mua -->
          <div class="pt-3 border-t border-stone-100">
            <div class="flex items-baseline gap-2 mb-3">
              <span class="text-lg font-extrabold text-amber-950">${formatCurrency(product.price)}</span>
              <span class="text-xs text-stone-400 line-through">${formatCurrency(product.originalPrice)}</span>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button 
                onclick="addToCartWithSelectedSize(${product.id})"
                class="w-full py-2 px-2.5 rounded-xl border border-amber-900 text-amber-900 hover:bg-amber-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                Thêm Giỏ
              </button>
              <button 
                onclick="buyNowProduct(${product.id})"
                class="w-full py-2 px-2.5 rounded-xl btn-leather-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                Mua Ngay
              </button>
            </div>

            ${renderExternalLinkButton(product)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Chọn size trên card
const cardSelectedSizes = {};
function selectCardSize(productId, size) {
  cardSelectedSizes[productId] = size;
  const buttons = document.querySelectorAll(`.card-size-btn-${productId}`);
  buttons.forEach(btn => {
    if (parseInt(btn.getAttribute('data-size')) === size) {
      btn.className = `card-size-btn-${productId} text-xs font-semibold px-2.5 py-1 rounded border bg-amber-900 text-white border-amber-900`;
    } else {
      btn.className = `card-size-btn-${productId} text-xs font-semibold px-2.5 py-1 rounded border bg-stone-50 text-stone-700 border-stone-200 hover:border-amber-700`;
    }
  });
}

// Thêm sản phẩm vào giỏ từ card
function addToCartWithSelectedSize(productId) {
  const product = getAllCurrentProducts().find(p => p.id === productId);
  if (!product) return;
  const size = cardSelectedSizes[productId] || product.sizes[0];
  const color = product.colors[0];

  addToCart(product, size, color, 1);
}

// Mua ngay từ card (mở form thanh toán luôn)
function buyNowProduct(productId) {
  addToCartWithSelectedSize(productId);
  openCartDrawer();
  setTimeout(() => {
    openCheckoutModal();
  }, 300);
}

// Thêm vào giỏ hàng
function addToCart(product, size, color, quantity = 1) {
  const existingIndex = cart.findIndex(item => item.id === product.id && item.size === size && item.color === color);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      size: size,
      color: color,
      quantity: quantity
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`Đã thêm "${product.name}" (Size ${size}) vào giỏ hàng!`, 'success');
}

// Lưu giỏ hàng
function saveCart() {
  localStorage.setItem('tuyetnhung_cart', JSON.stringify(cart));
}

// Cập nhật số lượng giỏ hàng trên header
function updateCartBadge() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.innerText = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Mở Drawer Giỏ hàng
function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const content = document.getElementById('cart-drawer-content');
  if (!drawer) return;

  renderCartItems();

  drawer.classList.remove('hidden');
  setTimeout(() => {
    overlay.classList.remove('opacity-0');
    content.classList.remove('translate-x-full');
  }, 10);
}

// Đóng Drawer Giỏ hàng
function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const content = document.getElementById('cart-drawer-content');
  if (!drawer) return;

  overlay.classList.add('opacity-0');
  content.classList.add('translate-x-full');
  setTimeout(() => {
    drawer.classList.add('hidden');
  }, 300);
}

// Render các món trong giỏ hàng
function renderCartItems() {
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-final-total');
  const discountRow = document.getElementById('cart-discount-row');
  const discountAmountEl = document.getElementById('cart-discount-amount');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="py-16 text-center text-stone-500">
        <svg class="w-16 h-16 mx-auto mb-3 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        <p class="font-medium text-stone-700 mb-1">Giỏ hàng của bạn đang trống</p>
        <p class="text-xs text-stone-400 mb-4">Hãy chọn những mẫu dép da ưng ý cho mình nhé!</p>
        <button onclick="closeCartDrawer()" class="px-5 py-2 btn-leather-primary text-xs font-bold rounded-lg">Khám phá sản phẩm</button>
      </div>
    `;
    if (subtotalEl) subtotalEl.innerText = formatCurrency(0);
    if (totalEl) totalEl.innerText = formatCurrency(0);
    return;
  }

  container.innerHTML = cart.map((item, index) => `
    <div class="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
      <div class="flex-grow min-w-0">
        <h4 class="font-bold text-stone-800 text-xs truncate">${item.name}</h4>
        <div class="flex items-center gap-2 text-xs text-stone-500 my-1">
          <span class="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-semibold">Size ${item.size}</span>
          <span>${item.color}</span>
        </div>
        <div class="flex items-center justify-between mt-1">
          <span class="font-bold text-amber-900 text-xs">${formatCurrency(item.price)}</span>
          <div class="flex items-center border border-stone-300 rounded bg-white overflow-hidden">
            <button onclick="changeCartQuantity(${index}, -1)" class="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 font-bold">-</button>
            <span class="w-6 text-center text-xs font-semibold">${item.quantity}</span>
            <button onclick="changeCartQuantity(${index}, 1)" class="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 font-bold">+</button>
          </div>
        </div>
      </div>
      <button onclick="removeFromCart(${index})" class="text-stone-400 hover:text-red-600 p-1 flex-shrink-0" title="Xóa">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountVal = subtotal * appliedDiscount;
  const finalTotal = subtotal - discountVal;

  if (subtotalEl) subtotalEl.innerText = formatCurrency(subtotal);
  if (discountRow) {
    if (appliedDiscount > 0) {
      discountRow.classList.remove('hidden');
      discountAmountEl.innerText = `-${formatCurrency(discountVal)} (${appliedDiscount * 100}%)`;
    } else {
      discountRow.classList.add('hidden');
    }
  }
  if (totalEl) totalEl.innerText = formatCurrency(finalTotal);
}

// Thay đổi số lượng
function changeCartQuantity(index, delta) {
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart();
  updateCartBadge();
  renderCartItems();
}

// Xóa khỏi giỏ
function removeFromCart(index) {
  if (!cart[index]) return;
  const removedName = cart[index].name;
  cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  renderCartItems();
  showToast(`Đã bỏ "${removedName}" khỏi giỏ hàng`, 'info');
}

// Áp dụng mã giảm giá
function applyCoupon() {
  const codeInput = document.getElementById('coupon-code');
  if (!codeInput) return;
  const code = codeInput.value.trim().toUpperCase();

  if (code === 'TUYETNHUNG' || code === 'DACHOIKHACH') {
    appliedDiscount = 0.1; // Giảm 10%
    showToast('Áp dụng mã giảm giá 10% thành công!', 'success');
  } else if (code === 'FREESHIP') {
    appliedDiscount = 0.05; // Giảm tương đương tiền ship
    showToast('Áp dụng mã hỗ trợ 5% phí vận chuyển!', 'success');
  } else {
    showToast('Mã ưu đãi không hợp lệ hoặc đã hết hạn!', 'error');
    appliedDiscount = 0;
  }
  renderCartItems();
}

// Mở modal Quick View (Xem nhanh sản phẩm)
function openQuickView(productId) {
  const product = getAllCurrentProducts().find(p => p.id === productId);
  if (!product) return;

  activeQuickViewProduct = product;
  selectedQuickViewSize = product.sizes[0];

  const modal = document.getElementById('quick-view-modal');
  const container = document.getElementById('quick-view-content');
  if (!modal || !container) return;

  const discountPercent = Math.round((1 - product.price / product.originalPrice) * 100);

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <!-- Ảnh sản phẩm & Bộ sưu tập nhiều góc chụp -->
      <div>
        <div class="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 mb-3 border border-stone-200 group">
          <img id="qv-main-image" src="${product.images[0]}" alt="${product.name}" class="w-full h-full object-cover transition-all duration-300" />
          
          ${product.images.length > 1 ? `
            <!-- Nút Prev / Next ảnh -->
            <button onclick="prevQvImage()" class="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              ◀
            </button>
            <button onclick="nextQvImage()" class="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-800 shadow-md flex items-center justify-center font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              ▶
            </button>
            <span id="qv-img-indicator" class="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              1 / ${product.images.length}
            </span>
          ` : ''}
        </div>

        <!-- Dải ảnh thu nhỏ (Thumbnails) -->
        <div class="flex gap-2 overflow-x-auto pb-1.5" id="qv-thumbnails-container">
          ${product.images.map((img, i) => `
            <button 
              onclick="switchQvImage(${i})" 
              class="qv-thumb-btn w-16 h-16 rounded-xl overflow-hidden border-2 ${i === 0 ? 'border-amber-800 ring-2 ring-amber-700/40' : 'border-stone-200 opacity-70 hover:opacity-100'} flex-shrink-0 transition-all"
            >
              <img src="${img}" class="w-full h-full object-cover" />
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Thông tin sản phẩm -->
      <div class="flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-900">${product.categoryName}</span>
            <span class="text-xs text-stone-500">Mã: TN-${product.id.toString().padStart(3, '0')}</span>
          </div>

          <h2 class="text-xl md:text-2xl font-bold text-stone-900 mb-2">${product.name}</h2>

          <div class="flex items-center gap-2 mb-4">
            <div class="flex text-amber-500">★★★★★</div>
            <span class="text-xs font-semibold text-stone-700">${product.rating}/5.0</span>
            <span class="text-xs text-stone-400">(${product.reviewsCount} khách hàng tin tưởng đánh giá)</span>
          </div>

          <div class="flex items-baseline gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 mb-4">
            <span class="text-2xl font-extrabold text-amber-950">${formatCurrency(product.price)}</span>
            <span class="text-sm text-stone-400 line-through">${formatCurrency(product.originalPrice)}</span>
            <span class="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Tiết kiệm ${discountPercent}%</span>
          </div>

          <!-- Chi tiết chất liệu tự làm thủ công -->
          <div class="space-y-2 mb-4 text-xs text-stone-700 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60">
            <div class="flex items-start gap-2">
              <span class="font-bold text-amber-900 w-24 flex-shrink-0">Chất liệu da:</span>
              <span>${product.leatherType}</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="font-bold text-amber-900 w-24 flex-shrink-0">Loại đế:</span>
              <span>${product.soleType}</span>
            </div>
            <div class="flex items-start gap-2">
              <span class="font-bold text-amber-900 w-24 flex-shrink-0">Đường may:</span>
              <span>${product.stitching}</span>
            </div>
          </div>

          <p class="text-stone-600 text-xs mb-4 leading-relaxed">${product.description}</p>

          <!-- Chọn size -->
          <div class="mb-4">
            <div class="flex items-center justify-between text-xs font-bold text-stone-800 mb-2">
              <span>Chọn Size dép:</span>
              <button onclick="openSizeGuideModal()" class="text-amber-800 hover:underline font-medium">📏 Hướng dẫn đo size chuẩn</button>
            </div>
            <div class="flex flex-wrap gap-2" id="qv-size-group">
              ${product.sizes.map((s, idx) => `
                <button 
                  onclick="selectQuickViewSize(${s})"
                  id="qv-size-${s}"
                  class="qv-size-btn text-xs font-bold px-3.5 py-2 rounded-lg border ${idx === 0 ? 'bg-amber-900 text-white border-amber-900' : 'bg-white text-stone-800 border-stone-300 hover:border-amber-700'}"
                >
                  Size ${s}
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Màu sắc -->
          <div class="mb-5">
            <span class="text-xs font-bold text-stone-800 block mb-2">Màu sắc:</span>
            <div class="flex gap-2">
              ${product.colors.map((c, idx) => `
                <span class="text-xs px-3 py-1.5 rounded-md border font-medium ${idx === 0 ? 'border-amber-800 bg-amber-50 text-amber-900 font-bold' : 'border-stone-200 text-stone-600'}">
                  ${c}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Các nút hành động -->
        <div class="pt-4 border-t border-stone-200 flex flex-col sm:flex-row gap-3">
          <button 
            onclick="addQuickViewToCart()"
            class="flex-1 py-3 px-4 rounded-xl border-2 border-amber-900 text-amber-900 font-bold text-sm hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            Thêm Vào Giỏ Hàng
          </button>
          <button 
            onclick="quickViewBuyNow()"
            class="flex-1 py-3 px-4 rounded-xl btn-leather-primary font-bold text-sm flex items-center justify-center gap-2"
          >
            Đặt Mua Nhanh (COD)
          </button>
        </div>

        ${renderExternalLinkButton(product, true)}
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

// Chọn size trong modal Quick View
function selectQuickViewSize(size) {
  selectedQuickViewSize = size;
  const buttons = document.querySelectorAll('.qv-size-btn');
  buttons.forEach(btn => {
    btn.className = 'qv-size-btn text-xs font-bold px-3.5 py-2 rounded-lg border bg-white text-stone-800 border-stone-300 hover:border-amber-700';
  });
  const currentBtn = document.getElementById(`qv-size-${size}`);
  if (currentBtn) {
    currentBtn.className = 'qv-size-btn text-xs font-bold px-3.5 py-2 rounded-lg border bg-amber-900 text-white border-amber-900';
  }
}

// Chuyển đổi xem ảnh đa góc trong Quick View
let currentQvImageIndex = 0;
function switchQvImage(index) {
  if (!activeQuickViewProduct || !activeQuickViewProduct.images[index]) return;
  currentQvImageIndex = index;
  const mainImg = document.getElementById('qv-main-image');
  const indicator = document.getElementById('qv-img-indicator');
  if (mainImg) mainImg.src = activeQuickViewProduct.images[index];
  if (indicator) indicator.innerText = `${index + 1} / ${activeQuickViewProduct.images.length}`;

  const thumbs = document.querySelectorAll('.qv-thumb-btn');
  thumbs.forEach((btn, idx) => {
    if (idx === index) {
      btn.className = 'qv-thumb-btn w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-800 ring-2 ring-amber-700/40 flex-shrink-0 transition-all scale-105';
    } else {
      btn.className = 'qv-thumb-btn w-16 h-16 rounded-xl overflow-hidden border-2 border-stone-200 opacity-70 hover:opacity-100 flex-shrink-0 transition-all';
    }
  });
}

function nextQvImage() {
  if (!activeQuickViewProduct) return;
  const nextIdx = (currentQvImageIndex + 1) % activeQuickViewProduct.images.length;
  switchQvImage(nextIdx);
}

function prevQvImage() {
  if (!activeQuickViewProduct) return;
  const prevIdx = (currentQvImageIndex - 1 + activeQuickViewProduct.images.length) % activeQuickViewProduct.images.length;
  switchQvImage(prevIdx);
}

// Thêm vào giỏ từ Quick View
function addQuickViewToCart() {
  if (!activeQuickViewProduct) return;
  addToCart(activeQuickViewProduct, selectedQuickViewSize, activeQuickViewProduct.colors[0], 1);
  closeQuickView();
  openCartDrawer();
}

// Mua ngay từ Quick View
function quickViewBuyNow() {
  if (!activeQuickViewProduct) return;
  addToCart(activeQuickViewProduct, selectedQuickViewSize, activeQuickViewProduct.colors[0], 1);
  closeQuickView();
  openCheckoutModal();
}

// Đóng Quick View
function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (modal) modal.classList.add('hidden');
}

// Mở Modal Thanh Toán Đặt Hàng (Checkout)
function openCheckoutModal() {
  if (cart.length === 0) {
    showToast('Giỏ hàng trống. Vui lòng chọn sản phẩm trước khi thanh toán!', 'error');
    return;
  }
  closeCartDrawer();

  const modal = document.getElementById('checkout-modal');
  const summaryContainer = document.getElementById('checkout-order-summary');
  const totalAmountEl = document.getElementById('checkout-final-amount');
  if (!modal || !summaryContainer) return;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountVal = subtotal * appliedDiscount;
  const finalTotal = subtotal - discountVal;

  summaryContainer.innerHTML = cart.map(item => `
    <div class="flex items-center justify-between text-xs py-2 border-b border-stone-100">
      <div class="flex items-center gap-2">
        <img src="${item.image}" class="w-10 h-10 object-cover rounded" />
        <div>
          <p class="font-bold text-stone-800 line-clamp-1">${item.name}</p>
          <p class="text-stone-500">Size: ${item.size} | SL: ${item.quantity}</p>
        </div>
      </div>
      <span class="font-bold text-stone-900">${formatCurrency(item.price * item.quantity)}</span>
    </div>
  `).join('');

  if (totalAmountEl) totalAmountEl.innerText = formatCurrency(finalTotal);

  // Tạo mã VietQR động nếu người dùng muốn chuyển khoản
  updateQrCode(finalTotal);

  modal.classList.remove('hidden');
}

// Đóng modal Thanh toán
function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('hidden');
}

// Cập nhật mã VietQR
function updateQrCode(amount) {
  const qrImg = document.getElementById('vietqr-image');
  if (!qrImg) return;
  // Cú pháp: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<INFO>
  const bankId = "VCB";
  const accountNo = "9988776655";
  const accountName = "NGUYEN THI TUYET NHUNG";
  const memo = encodeURIComponent("DEP NAM TUYET NHUNG");
  qrImg.src = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${memo}&accountName=${encodeURIComponent(accountName)}`;
}

// Toggle phương thức thanh toán trong modal checkout
function handlePaymentMethodChange(method) {
  const qrBox = document.getElementById('bank-qr-box');
  const codBox = document.getElementById('cod-notice-box');
  if (!qrBox || !codBox) return;

  if (method === 'banking') {
    qrBox.classList.remove('hidden');
    codBox.classList.add('hidden');
  } else {
    qrBox.classList.add('hidden');
    codBox.classList.remove('hidden');
  }
}

// Xử lý gửi đơn hàng (Chốt COD hoặc Đặt hàng)
function submitOrder(event) {
  event.preventDefault();

  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const address = document.getElementById('customer-address').value.trim();
  const note = document.getElementById('customer-note').value.trim();
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'COD';

  if (!name || !phone || !address) {
    showToast('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ!', 'error');
    return;
  }

  // Validate SĐT Việt Nam đơn giản
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!phoneRegex.test(phone)) {
    showToast('Số điện thoại không đúng định dạng. Vui lòng kiểm tra lại!', 'error');
    return;
  }

  const orderId = 'TN' + Math.floor(100000 + Math.random() * 900000);
  const paymentText = paymentMethod === 'banking' ? 'Chuyển khoản VietQR' : 'COD (Nhận hàng thanh toán)';
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountVal = subtotal * appliedDiscount;
  const finalTotal = subtotal - discountVal;

  const orderData = {
    orderId,
    name,
    phone,
    address,
    note,
    paymentMethod,
    items: [...cart],
    finalTotal,
    createdAt: new Date().toLocaleString('vi-VN'),
    status: 'Chờ xác nhận',
    paymentText,
    zaloMessage: `[ĐƠN HÀNG MỚI #${orderId}]\n` +
      `Chào xưởng Dép Nam Tuyết Nhung, tôi vừa đặt đơn hàng trên website:\n` +
      `--------------------------------\n` +
      `🆔 Mã đơn: #${orderId}\n` +
      `👤 Khách hàng: ${name}\n` +
      `📞 Số điện thoại: ${phone}\n` +
      `🏠 Địa chỉ nhận: ${address}\n` +
      `📦 Danh sách dép:\n` + cart.map((item, i) => `${i + 1}. ${item.name} - Size ${item.size} - SL: ${item.quantity} đôi - ${formatCurrency(item.price * item.quantity)}`).join('\n') + `\n` +
      `💰 Tổng thanh toán: ${formatCurrency(finalTotal)}\n` +
      `💳 Hình thức: ${paymentText}\n` +
      (note ? `📝 Ghi chú: ${note}\n` : '') +
      `--------------------------------\n` +
      `Nhờ xưởng kiểm tra size và đóng hàng gửi sớm giúp tôi nhé!`
  };

  // Lưu lịch sử đơn hàng vào LocalStorage
  const orderHistory = JSON.parse(localStorage.getItem('tuyetnhung_orders')) || [];
  orderHistory.push(orderData);
  localStorage.setItem('tuyetnhung_orders', JSON.stringify(orderHistory));

  // Reset giỏ hàng
  cart = [];
  saveCart();
  updateCartBadge();
  closeCheckoutModal();

  // Hiển thị modal thành công
  // 2. Gửi lên Google Sheets nếu đã cài đặt Webhook
  sendOrderToGoogleSheets(orderData);

  // 3. Tự động chuyển hướng mở Zalo sau 1 giây
  const zaloPhone = (typeof STORE_INFO !== 'undefined' && STORE_INFO.zalo) ? STORE_INFO.zalo : '0962860721';
  const zaloUrl = `https://zalo.me/${zaloPhone}?text=${encodeURIComponent(orderData.zaloMessage)}`;
  setTimeout(() => {
    try {
      window.open(zaloUrl, '_blank');
    } catch(e) {}
  }, 1000);

  // 4. Hiển thị modal thành công
  showSuccessModal(orderData);
}

// Chốt đơn qua Zalo trực tiếp
function sendOrderToZalo() {
  const name = document.getElementById('customer-name').value.trim() || 'Khách hàng';
  const phone = document.getElementById('customer-phone').value.trim() || 'Chưa cung cấp';
  const address = document.getElementById('customer-address').value.trim() || 'Chưa cung cấp';
  const note = document.getElementById('customer-note').value.trim();
  const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value === 'banking' ? 'Chuyển khoản VietQR' : 'COD (Nhận hàng thanh toán)';

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountVal = subtotal * appliedDiscount;
  const finalTotal = subtotal - discountVal;

  let itemsText = cart.map((item, i) => 
    `${i + 1}. ${item.name} - Size ${item.size} - Màu: ${item.color} - SL: ${item.quantity} đôi - Giá: ${formatCurrency(item.price * item.quantity)}`
  ).join('\n');

  const message = `Chào xưởng Dép Nam Tuyết Nhung, tôi muốn đặt hàng:\n` +
    `--------------------------------\n` +
    `👤 Khách hàng: ${name}\n` +
    `📞 Số điện thoại: ${phone}\n` +
    `🏠 Địa chỉ: ${address}\n` +
    `📦 Danh sách dép đặt:\n${itemsText}\n` +
    `💰 Tổng thanh toán: ${formatCurrency(finalTotal)}\n` +
    `💳 Hình thức: ${paymentMethod}\n` +
    (note ? `📝 Ghi chú: ${note}\n` : '') +
    `--------------------------------\n` +
    `Nhờ xưởng kiểm tra size và đóng hàng giúp tôi nhé!`;

  const orderId = 'TN' + Math.floor(100000 + Math.random() * 900000);
  const orderData = {
    orderId,
    name,
    phone,
    address,
    note,
    paymentMethod,
    paymentText: paymentMethod === 'banking' ? 'Chuyển khoản VietQR' : 'COD (Nhận hàng thanh toán)',
    items: [...cart],
    finalTotal,
    createdAt: new Date().toLocaleString('vi-VN'),
    status: 'Chờ xác nhận',
    zaloMessage: message
  };

  const orderHistory = JSON.parse(localStorage.getItem('tuyetnhung_orders')) || [];
  orderHistory.push(orderData);
  localStorage.setItem('tuyetnhung_orders', JSON.stringify(orderHistory));
  sendOrderToGoogleSheets(orderData);

  cart = [];
  saveCart();
  updateCartBadge();
  closeCheckoutModal();

  // Mở liên kết chat Zalo
  const zaloPhone = STORE_INFO.zalo;
  const zaloUrl = `https://zalo.me/${zaloPhone}?text=${encodeURIComponent(message)}`;
  window.open(zaloUrl, '_blank');

  showToast('Đang kết nối đến Zalo Xưởng Tuyết Nhung...', 'info');
}

// Gửi đơn hàng lên Google Sheets Webhook
async function sendOrderToGoogleSheets(order) {
  let webhookUrl = localStorage.getItem('tuyetnhung_sheets_webhook');
  if (!webhookUrl && typeof GOOGLE_SHEETS_WEBHOOK_URL !== 'undefined') {
    webhookUrl = GOOGLE_SHEETS_WEBHOOK_URL;
  }
  if (!webhookUrl || !webhookUrl.trim()) return;

  try {
    const payload = {
      orderId: order.orderId,
      createdAt: order.createdAt,
      name: order.name,
      phone: order.phone,
      address: order.address,
      note: order.note || '',
      paymentMethod: order.paymentText || (order.paymentMethod === 'banking' ? 'Chuyển khoản VietQR' : 'COD'),
      items: order.items.map(i => `${i.name} (Size ${i.size}, SL: ${i.quantity})`).join('; '),
      finalTotal: order.finalTotal,
      status: order.status || 'Chờ xác nhận'
    };

    await fetch(webhookUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    console.log('Đã gửi đơn hàng lên Google Sheets!');
  } catch (err) {
    console.warn('Lỗi khi gửi đơn lên Google Sheets:', err);
  }
}

// Hiển thị modal đặt hàng thành công
function showSuccessModal(order) {
  const modal = document.getElementById('success-modal');
  const details = document.getElementById('success-order-details');
  if (!modal || !details) return;

  const zaloPhone = (typeof STORE_INFO !== 'undefined' && STORE_INFO.zalo) ? STORE_INFO.zalo : '0962860721';
  const zaloUrl = `https://zalo.me/${zaloPhone}?text=${encodeURIComponent(order.zaloMessage || '')}`;

  const zaloBtn = document.getElementById('success-zalo-btn');
  if (zaloBtn) {
    zaloBtn.href = zaloUrl;
  }

  details.innerHTML = `
    <div class="bg-amber-50 p-4 rounded-xl border border-amber-200 text-left text-xs space-y-2 mb-4">
      <div class="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
        <span class="font-black text-amber-950 text-sm">Mã đơn hàng: #${order.orderId}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">🟢 Đã lưu vào hệ thống</span>
      </div>
      <p><span class="font-semibold text-stone-700">Khách hàng:</span> ${order.name} - ${order.phone}</p>
      <p><span class="font-semibold text-stone-700">Địa chỉ giao:</span> ${order.address}</p>
      <p><span class="font-semibold text-stone-700">Hình thức:</span> ${order.paymentMethod === 'banking' ? 'Chuyển khoản' : 'Thanh toán COD khi nhận hàng'}</p>
      <p><span class="font-semibold text-stone-700">Tổng tiền:</span> <span class="text-amber-900 font-extrabold text-sm">${formatCurrency(order.finalTotal)}</span></p>
    </div>
    <div class="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-950 text-xs mb-4 text-left flex items-start gap-2.5">
      <span class="text-lg flex-shrink-0">📲</span>
      <div>
        <p class="font-bold text-blue-900">Hệ thống đang mở Zalo để gửi chi tiết đơn sang Xưởng...</p>
        <p class="text-[11px] text-blue-800 mt-0.5">Nếu Zalo chưa tự mở, anh/chị vui lòng <strong>bấm vào nút xanh bên dưới</strong> để gửi tin nhắn xác nhận đơn ngay nhé!</p>
      </div>
    </div>
    <p class="text-stone-500 text-xs mb-4">Thợ xưởng Tuyết Nhung sẽ liên hệ xác nhận đơn hàng qua điện thoại trong vòng 15-30 phút. Thời gian giao hàng dự kiến từ 2-3 ngày làm việc (Được kiểm tra và đi thử dép trước khi trả tiền).</p>
  `;

  modal.classList.remove('hidden');
}

function closeSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (modal) modal.classList.add('hidden');
}

// Mở Modal Hướng dẫn chọn Size
function openSizeGuideModal() {
  const modal = document.getElementById('size-guide-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeSizeGuideModal() {
  const modal = document.getElementById('size-guide-modal');
  if (modal) modal.classList.add('hidden');
}

// Tính size giày dựa trên chiều dài bàn chân
function calculateFootSize() {
  const lengthInput = document.getElementById('foot-length-input');
  const resultBox = document.getElementById('size-calc-result');
  if (!lengthInput || !resultBox) return;

  const lengthCm = parseFloat(lengthInput.value);
  if (isNaN(lengthCm) || lengthCm < 22 || lengthCm > 30) {
    resultBox.innerHTML = `<span class="text-red-600 font-medium text-xs">Vui lòng nhập chiều dài thực tế từ 22cm đến 30cm!</span>`;
    return;
  }

  let size = 40;
  if (lengthCm <= 23.5) size = 37;
  else if (lengthCm <= 24.0) size = 38;
  else if (lengthCm <= 24.5) size = 39;
  else if (lengthCm <= 25.0) size = 40;
  else if (lengthCm <= 25.5) size = 41;
  else if (lengthCm <= 26.0) size = 42;
  else if (lengthCm <= 26.5) size = 43;
  else if (lengthCm <= 27.5) size = 44;
  else size = 45;

  resultBox.innerHTML = `
    <div class="p-3 bg-amber-100 rounded-lg text-amber-950 font-bold text-sm">
      🎯 Kích cỡ đề xuất: <span class="text-base text-amber-900 font-black">Size ${size}</span>
      <p class="text-xs font-normal text-stone-600 mt-1">Lưu ý: Nếu bàn chân của bạn bè ngang hoặc mu bàn chân dày dặn, hãy tăng thêm 1 size để đi thoải mái nhất!</p>
    </div>
  `;
}

// Hệ thống Toast thông báo
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-800 text-white border-emerald-700',
    error: 'bg-rose-800 text-white border-rose-700',
    info: 'bg-stone-900 text-white border-stone-800'
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  toast.className = `toast-item px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs md:text-sm font-medium border ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <span class="w-5 h-5 rounded-full bg-white bg-opacity-20 flex items-center justify-center font-bold flex-shrink-0">${icons[type] || '•'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Lắng nghe sự kiện bàn phím & modal
function setupEventListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeQuickView();
      closeCartDrawer();
      closeCheckoutModal();
      closeSizeGuideModal();
      closeSuccessModal();
    }
  });
}

// Xuất các hàm điều khiển modal ra window
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
