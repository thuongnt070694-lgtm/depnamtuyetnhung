/**
 * Trợ Lý Ảo Chatbot Thông Minh - Xưởng Dép Nam Tuyết Nhung
 * Hỗ trợ tư vấn chọn size, tìm kiếm sản phẩm, giải đáp chính sách bảo hành,
 * giao hàng, khuyến mãi và tra cứu đơn hàng tự động 24/7.
 */

// Cấu hình mặc định của Chatbot
const DEFAULT_CHATBOT_CONFIG = {
  enabled: true,
  name: 'Trợ Lý Ảo Tuyết Nhung',
  subtitle: '🟢 Trực tuyến 24/7 • Tư vấn tức thì',
  greeting: 'Dạ xin chào anh/chị! 👋 Em là Trợ lý ảo của Xưởng Dép Nam Tuyết Nhung.\n\nEm có thể hỗ trợ anh/chị đo và tính size chuẩn, tìm các mẫu dép da bò thật ưng ý, hoặc giải đáp chính sách bảo hành & giao hàng tận nhà ạ!',
  sound: true,
  autoPopupDelay: 6000 // Hiện bong bóng chào sau 6 giây
};

let chatbotConfig = { ...DEFAULT_CHATBOT_CONFIG };
let isChatbotOpen = false;
let isBotTyping = false;
let isChatSoundEnabled = true;

// Khởi tạo Chatbot khi trang tải xong
document.addEventListener('DOMContentLoaded', async () => {
  await loadChatbotSettings();
  renderChatbotUI();
  initChatbotEvents();
  initChatHistory();
  scheduleWelcomePopup();
});

// Tải cài đặt chatbot từ homepageConfig
async function loadChatbotSettings() {
  let config = null;
  if (typeof loadHomepageConfig === 'function') {
    config = await loadHomepageConfig();
  }
  if (!config && typeof HOMEPAGE_CONFIG !== 'undefined') {
    config = HOMEPAGE_CONFIG;
  }

  if (config) {
    if (config.chatbotEnabled !== undefined) chatbotConfig.enabled = config.chatbotEnabled;
    if (config.chatbotName) chatbotConfig.name = config.chatbotName;
    if (config.chatbotSubtitle) chatbotConfig.subtitle = config.chatbotSubtitle;
    if (config.chatbotGreeting) chatbotConfig.greeting = config.chatbotGreeting;
    if (config.chatbotSound !== undefined) chatbotConfig.sound = config.chatbotSound;
  }

  const savedSound = localStorage.getItem('tuyetnhung_chat_sound');
  isChatSoundEnabled = savedSound !== null ? savedSound === 'true' : chatbotConfig.sound;
}

// Hàm chuẩn hóa tiếng Việt để tìm kiếm không dấu
function normalizeVietnamese(str) {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Âm thanh thông báo tin nhắn (Web Audio API - không cần file âm thanh ngoài)
function playChatNotificationSound() {
  if (!isChatSoundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch (e) {
    // Trình duyệt chặn âm thanh khi chưa tương tác, bỏ qua an toàn
  }
}

// Bật/Tắt âm thanh
function toggleChatSound() {
  isChatSoundEnabled = !isChatSoundEnabled;
  localStorage.setItem('tuyetnhung_chat_sound', isChatSoundEnabled);
  const icon = document.getElementById('chatbot-sound-icon');
  if (icon) {
    icon.innerHTML = isChatSoundEnabled
      ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>`
      : `<svg class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"/></svg>`;
  }
  if (typeof showToast === 'function') {
    showToast(isChatSoundEnabled ? 'Đã bật âm thanh trợ lý' : 'Đã tắt âm thanh trợ lý', 'info');
  }
}

// Render giao diện Chatbot vào DOM
function renderChatbotUI() {
  const existingWindow = document.getElementById('tuyetnhung-chatbot-window');
  const existingLauncher = document.getElementById('chatbot-launcher-btn');
  const existingBubble = document.getElementById('chatbot-welcome-bubble');

  if (!chatbotConfig.enabled) {
    if (existingWindow) existingWindow.classList.add('hidden');
    if (existingLauncher) existingLauncher.classList.add('hidden');
    if (existingBubble) existingBubble.classList.add('hidden');
    const container = document.getElementById('tuyetnhung-chatbot-container');
    if (container) container.classList.add('hidden');
    return;
  }

  // Nếu giao diện đã được định nghĩa sẵn trong HTML (như index.html)
  if (existingWindow) {
    if (existingLauncher) existingLauncher.classList.remove('hidden');
    const nameEl = document.getElementById('chatbot-ui-name');
    if (nameEl) nameEl.innerText = chatbotConfig.name;
    const subEl = document.getElementById('chatbot-ui-sub');
    if (subEl) subEl.innerText = chatbotConfig.subtitle;
    return;
  }
  if (document.getElementById('tuyetnhung-chatbot-container')) return;

  const container = document.createElement('div');
  container.id = 'tuyetnhung-chatbot-container';
  container.className = 'fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none select-none';

  container.innerHTML = `
    <!-- Cửa sổ Chatbot chính -->
    <div 
      id="tuyetnhung-chatbot-window" 
      class="pointer-events-auto hidden w-[94vw] sm:w-[390px] max-w-[430px] h-[580px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-amber-900/30 flex flex-col overflow-hidden mb-3 transition-all duration-300 transform scale-95 opacity-0 origin-bottom-right"
      style="box-shadow: 0 20px 40px -15px rgba(69, 26, 3, 0.35);"
    >
      <!-- HEADER CỦA CHATBOT -->
      <div class="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-3.5 rounded-t-3xl border-b border-amber-800/40 flex items-center justify-between shadow-md">
        <div class="flex items-center gap-2.5">
          <div class="relative w-9 h-9 rounded-full bg-amber-800/80 border-2 border-amber-400/80 flex items-center justify-center text-white shadow-inner flex-shrink-0">
            <span class="text-base font-serif font-black">TN</span>
            <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-stone-900 rounded-full"></span>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h4 class="font-bold text-xs sm:text-sm text-amber-200 line-clamp-1" id="chatbot-ui-name">${chatbotConfig.name}</h4>
              <span class="bg-amber-500/20 text-amber-300 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-amber-400/30">AI</span>
            </div>
            <p class="text-[10px] text-stone-300 font-medium" id="chatbot-ui-sub">${chatbotConfig.subtitle}</p>
          </div>
        </div>

        <!-- Các nút tiện ích trên Header -->
        <div class="flex items-center gap-1">
          <button 
            type="button" 
            onclick="toggleChatSound()" 
            id="chatbot-sound-icon" 
            class="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors" 
            title="Bật/Tắt âm thanh thông báo"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
          </button>
          <button 
            type="button" 
            onclick="resetChatHistory()" 
            class="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors" 
            title="Làm mới cuộc trò chuyện"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          </button>
          <button 
            type="button" 
            onclick="toggleChatbot(false)" 
            class="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors" 
            title="Thu nhỏ cửa sổ chat"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>
      </div>

      <!-- KHUNG TIN NHẮN (MESSAGE STREAM) -->
      <div 
        id="chatbot-messages-container" 
        class="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-stone-50/80 text-xs font-normal"
        style="scroll-behavior: smooth;"
      >
        <!-- Nội dung tin nhắn sẽ được render động ở đây -->
      </div>

      <!-- ĐANG GÕ TIN NHẮN (TYPING INDICATOR) -->
      <div id="chatbot-typing-indicator" class="hidden px-4 py-2 bg-stone-50 border-t border-stone-100 flex items-center gap-2 text-[11px] text-stone-500">
        <span class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 bg-amber-800 rounded-full animate-bounce" style="animation-delay: 0s;"></span>
          <span class="w-1.5 h-1.5 bg-amber-800 rounded-full animate-bounce" style="animation-delay: 0.15s;"></span>
          <span class="w-1.5 h-1.5 bg-amber-800 rounded-full animate-bounce" style="animation-delay: 0.3s;"></span>
        </span>
        <span class="italic text-stone-400">Trợ lý Tuyết Nhung đang soạn câu trả lời...</span>
      </div>

      <!-- THANH CÂU HỎI GỢI Ý NHANH (QUICK CHIPS) -->
      <div class="px-3 py-2 bg-white border-t border-stone-200/80 overflow-x-auto flex gap-1.5 no-scrollbar" id="chatbot-quick-chips">
        <button type="button" onclick="handleQuickChipClick('👟 Mẫu dép bán chạy nhất')" class="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-[10px] border border-amber-200/80 flex-shrink-0 transition-colors">
          👟 Dép Bán Chạy
        </button>
        <button type="button" onclick="handleQuickChipClick('📏 Tư vấn đo size chân')" class="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-[10px] border border-amber-200/80 flex-shrink-0 transition-colors">
          📏 Tính Size Chân
        </button>
        <button type="button" onclick="handleQuickChipClick('🚚 Phí giao hàng & thời gian nhận')" class="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-[10px] border border-amber-200/80 flex-shrink-0 transition-colors">
          🚚 Phí Vận Chuyển
        </button>
        <button type="button" onclick="handleQuickChipClick('🛡️ Chính sách bảo hành da')" class="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-[10px] border border-amber-200/80 flex-shrink-0 transition-colors">
          🛡️ Bảo Hành 12 Tháng
        </button>
        <button type="button" onclick="handleQuickChipClick('🎁 Có mã giảm giá nào không?')" class="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-[10px] border border-amber-200/80 flex-shrink-0 transition-colors">
          🎁 Mã Giảm Giá
        </button>
        <button type="button" onclick="handleQuickChipClick('📦 Tra cứu đơn hàng gần nhất')" class="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-[10px] border border-amber-200/80 flex-shrink-0 transition-colors">
          📦 Tra Cứu Đơn
        </button>
        <button type="button" onclick="handleQuickChipClick('💬 Cho tôi chat Zalo với chủ xưởng')" class="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-[10px] border border-blue-200 flex-shrink-0 transition-colors">
          💬 Chat Zalo Chủ Xưởng
        </button>
      </div>

      <!-- KHUNG NHẬP TIN NHẮN (FOOTER INPUT) -->
      <form id="chatbot-form" onsubmit="handleChatSubmit(event)" class="p-2.5 bg-white border-t border-stone-200 flex items-center gap-2">
        <input 
          type="text" 
          id="chatbot-input" 
          placeholder="Nhập câu hỏi (VD: quai ngang, chân 25cm...)" 
          class="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:outline-none focus:border-amber-800 bg-stone-50/50" 
          autocomplete="off"
        />
        <button 
          type="submit" 
          class="w-9 h-9 rounded-xl bg-amber-900 hover:bg-amber-800 text-white flex items-center justify-center flex-shrink-0 transition-all shadow-md active:scale-95"
          title="Gửi câu hỏi"
        >
          <svg class="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
        </button>
      </form>
    </div>

    <!-- BONG BÓNG LỜI CHÀO GỢI Ý (WELCOME CALLOUT BUBBLE) -->
    <div 
      id="chatbot-welcome-bubble" 
      class="pointer-events-auto hidden max-w-xs bg-white text-stone-800 p-3 rounded-2xl rounded-br-xs shadow-xl border border-amber-300 mb-2.5 text-xs font-medium transition-all duration-300 animate-bounce relative"
      onclick="toggleChatbot(true)"
      style="cursor: pointer;"
    >
      <button 
        type="button" 
        onclick="event.stopPropagation(); dismissWelcomeBubble();" 
        class="absolute -top-2 -right-2 w-5 h-5 bg-stone-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold hover:bg-red-600"
        title="Đóng lời chào"
      >
        ✕
      </button>
      <div class="flex items-start gap-2">
        <span class="text-base flex-shrink-0">👋</span>
        <div>
          <p class="font-bold text-amber-950">Anh/chị cần tư vấn size hay mẫu dép nào không ạ?</p>
          <span class="text-[10px] text-amber-800 underline font-semibold mt-1 inline-block">Bấm vào đây để chat ngay với xưởng</span>
        </div>
      </div>
    </div>

    <!-- NÚT BẤM MỞ CHATBOT NỔI (FLOATING LAUNCHER BUTTON) -->
    <button 
      type="button" 
      id="chatbot-launcher-btn" 
      onclick="toggleChatbot()" 
      class="pointer-events-auto relative w-14 h-14 rounded-full bg-gradient-to-tr from-stone-900 via-amber-900 to-amber-700 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-amber-300/80 group"
      title="Chat trực tiếp cùng Trợ Lý Ảo Tuyết Nhung"
    >
      <!-- Icon Chat & Bot -->
      <div id="chatbot-icon-closed" class="flex items-center justify-center">
        <svg class="w-7 h-7 text-amber-100 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
      </div>
      <div id="chatbot-icon-opened" class="hidden">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </div>

      <!-- Chấm đỏ thông báo chưa đọc -->
      <span id="chatbot-unread-badge" class="absolute -top-1 -right-1 w-5 h-5 bg-red-600 border-2 border-white text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
        1
      </span>
    </button>
  `;

  document.body.appendChild(container);
}

// Bật / Thu nhỏ Chatbot
function toggleChatbot(forceOpen = null) {
  const windowEl = document.getElementById('tuyetnhung-chatbot-window');
  const iconClosed = document.getElementById('chatbot-icon-closed');
  const iconOpened = document.getElementById('chatbot-icon-opened');
  const unreadBadge = document.getElementById('chatbot-unread-badge');
  const bubble = document.getElementById('chatbot-welcome-bubble');

  if (!windowEl) return;

  const nextState = forceOpen !== null ? forceOpen : !isChatbotOpen;
  isChatbotOpen = nextState;

  if (isChatbotOpen) {
    windowEl.classList.remove('hidden');
    setTimeout(() => {
      windowEl.classList.remove('scale-95', 'opacity-0');
      windowEl.classList.add('scale-100', 'opacity-100');
    }, 10);
    if (iconClosed) iconClosed.classList.add('hidden');
    if (iconOpened) iconOpened.classList.remove('hidden');
    if (unreadBadge) unreadBadge.classList.add('hidden');
    if (bubble) bubble.classList.add('hidden');

    // Tự động focus vào ô nhập
    setTimeout(() => {
      const input = document.getElementById('chatbot-input');
      if (input) input.focus();
      scrollChatToBottom();
    }, 150);
  } else {
    windowEl.classList.remove('scale-100', 'opacity-100');
    windowEl.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      windowEl.classList.add('hidden');
    }, 250);
    if (iconClosed) iconClosed.classList.remove('hidden');
    if (iconOpened) iconOpened.classList.add('hidden');
  }
}

// Hẹn giờ hiện bong bóng chào
function scheduleWelcomePopup() {
  if (sessionStorage.getItem('tuyetnhung_bubble_dismissed')) return;
  setTimeout(() => {
    if (!isChatbotOpen) {
      const bubble = document.getElementById('chatbot-welcome-bubble');
      if (bubble) bubble.classList.remove('hidden');
    }
  }, chatbotConfig.autoPopupDelay);
}

function dismissWelcomeBubble() {
  const bubble = document.getElementById('chatbot-welcome-bubble');
  if (bubble) bubble.classList.add('hidden');
  sessionStorage.setItem('tuyetnhung_bubble_dismissed', 'true');
}

// Khởi tạo lịch sử chat
function initChatHistory() {
  const container = document.getElementById('chatbot-messages-container');
  if (!container) return;

  const saved = sessionStorage.getItem('tuyetnhung_chat_messages');
  if (saved) {
    // Tự động dọn dẹp bộ nhớ đệm nếu phát hiện tin nhắn bị lưu lỗi HTML từ phiên bản cũ
    if (saved.includes('type="button"') || saved.includes('<button <br') || saved.includes('flex-shrink-0 shadow-xs" >')) {
      sessionStorage.removeItem('tuyetnhung_chat_messages');
      container.innerHTML = '';
      sendBotMessage(chatbotConfig.greeting, [
        '👟 Xem mẫu dép bán chạy',
        '📏 Tư vấn đo size chân',
        '🚚 Phí giao hàng & Kiểm hàng'
      ]);
      return;
    }

    try {
      const msgs = JSON.parse(saved);
      container.innerHTML = '';
      msgs.forEach(m => appendChatMessageDOM(m.sender, m.html, m.time, false));
      scrollChatToBottom();
      return;
    } catch (e) {
      console.warn('Lỗi parse chat history:', e);
    }
  }

  // Nếu chưa có lịch sử, gửi tin chào mở đầu
  sendBotMessage(chatbotConfig.greeting, [
    '👟 Xem mẫu dép bán chạy',
    '📏 Tư vấn đo size chân',
    '🚚 Phí giao hàng & Kiểm hàng'
  ]);
}

// Lưu lịch sử chat vào sessionStorage
function saveChatHistory() {
  const container = document.getElementById('chatbot-messages-container');
  if (!container) return;
  const items = container.querySelectorAll('.chat-msg-row');
  const history = [];
  items.forEach(el => {
    history.push({
      sender: el.dataset.sender,
      html: el.dataset.rawHtml || el.innerHTML,
      time: el.dataset.time || ''
    });
  });
  sessionStorage.setItem('tuyetnhung_chat_messages', JSON.stringify(history));
}

// Xóa lịch sử chat để bắt đầu lại
function resetChatHistory() {
  if (confirm('Bạn có muốn làm mới cuộc trò chuyện với Trợ lý ảo không?')) {
    sessionStorage.removeItem('tuyetnhung_chat_messages');
    const container = document.getElementById('chatbot-messages-container');
    if (container) container.innerHTML = '';
    sendBotMessage(chatbotConfig.greeting, [
      '👟 Xem mẫu dép bán chạy',
      '📏 Tư vấn đo size chân',
      '🚚 Phí giao hàng & Kiểm hàng'
    ]);
    if (typeof showToast === 'function') {
      showToast('Đã làm mới cuộc trò chuyện!', 'info');
    }
  }
}

// Cuộn xuống tin nhắn cuối cùng
function scrollChatToBottom() {
  const container = document.getElementById('chatbot-messages-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// Thêm tin nhắn vào DOM
function appendChatMessageDOM(sender, htmlContent, time = null, save = true) {
  const container = document.getElementById('chatbot-messages-container');
  if (!container) return;

  const msgTime = time || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const row = document.createElement('div');
  row.className = `chat-msg-row flex gap-2 ${sender === 'user' ? 'justify-end' : 'justify-start'} items-end`;
  row.dataset.sender = sender;
  row.dataset.rawHtml = htmlContent;
  row.dataset.time = msgTime;

  if (sender === 'user') {
    row.innerHTML = `
      <div class="max-w-[85%] space-y-1">
        <div class="p-3 rounded-2xl rounded-tr-xs bg-amber-900 text-white shadow-sm leading-relaxed text-xs">
          ${htmlContent}
        </div>
        <div class="text-[9px] text-stone-400 text-right pr-1">${msgTime}</div>
      </div>
    `;
  } else {
    row.innerHTML = `
      <div class="w-7 h-7 rounded-full bg-amber-800 text-white border border-amber-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-xs mb-4">
        TN
      </div>
      <div class="max-w-[88%] space-y-1">
        <div class="p-3 rounded-2xl rounded-tl-xs bg-white text-stone-800 shadow-sm border border-stone-200/90 leading-relaxed text-xs">
          ${htmlContent}
        </div>
        <div class="text-[9px] text-stone-400 pl-1">${msgTime}</div>
      </div>
    `;
  }

  container.appendChild(row);
  scrollChatToBottom();
  if (save) saveChatHistory();
}

// Gửi tin nhắn từ phía Bot (Có hiệu ứng gõ phím mượt mà)
function sendBotMessage(textOrHtml, followUpPills = null) {
  const typing = document.getElementById('chatbot-typing-indicator');
  if (typing) typing.classList.remove('hidden');
  isBotTyping = true;
  scrollChatToBottom();

  const delay = Math.min(Math.max(textOrHtml.length * 8, 400), 800);

  setTimeout(() => {
    if (typing) typing.classList.add('hidden');
    isBotTyping = false;

    let finalHtml = textOrHtml;
    // Chỉ thay thế ký tự \n bằng <br/> nếu nội dung là văn bản thuần (không chứa thẻ HTML)
    // để tránh chèn <br/> vào bên trong các thuộc tính của thẻ HTML (như <button ...>)
    if (!/<[a-z][\s\S]*>/i.test(textOrHtml)) {
      finalHtml = textOrHtml.replace(/\n/g, '<br/>');
    }

    // Thêm các nút gợi ý câu hỏi tiếp theo nếu có
    if (Array.isArray(followUpPills) && followUpPills.length > 0) {
      finalHtml += `
        <div class="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap gap-1.5">
          ${followUpPills.map(pill => `<button type="button" onclick="handleQuickChipClick('${pill.replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-200 transition-colors">${pill}</button>`).join('')}
        </div>
      `;
    }

    appendChatMessageDOM('bot', finalHtml);
    playChatNotificationSound();
  }, delay);
}

// Gửi tin nhắn từ phía Người Dùng
function handleChatSubmit(event) {
  event.preventDefault();
  if (isBotTyping) return;

  const input = document.getElementById('chatbot-input');
  if (!input) return;
  const rawText = input.value.trim();
  if (!rawText) return;

  input.value = '';
  appendChatMessageDOM('user', escapeHtml(rawText));

  // Phân tích và đưa ra câu trả lời
  processUserQuery(rawText);
}

// Xử lý khi bấm nút gợi ý nhanh
function handleQuickChipClick(chipText) {
  if (isBotTyping) return;
  if (!isChatbotOpen) toggleChatbot(true);
  appendChatMessageDOM('user', escapeHtml(chipText));
  processUserQuery(chipText);
}

// Lấy danh sách sản phẩm hiện có
function getStoreProducts() {
  if (typeof loadedProducts !== 'undefined' && Array.isArray(loadedProducts) && loadedProducts.length > 0) {
    return loadedProducts;
  }
  if (typeof PRODUCTS_DATA !== 'undefined' && Array.isArray(PRODUCTS_DATA)) {
    return PRODUCTS_DATA;
  }
  return [];
}

// Render danh sách sản phẩm dạng thẻ nhỏ trong tin nhắn
function renderMiniProductCards(products, title = 'Các mẫu dép da thật phù hợp:') {
  if (!products || products.length === 0) return '';

  return `
    <div class="space-y-2 mt-2">
      <div class="font-bold text-amber-950 text-xs">${title}</div>
      <div class="space-y-2">
        ${products.slice(0, 3).map(p => {
          const img = p.images && p.images[0] ? p.images[0] : 'assets/images/dep-tn01.jpg';
          const leather = p.leatherType || 'Da bò thật';
          const sole = p.soleType || 'Đế cao su khâu dù';
          const priceStr = formatCurrency(p.price);
          const origPriceStr = p.originalPrice > p.price ? `<span class="text-[10px] text-stone-400 line-through">${formatCurrency(p.originalPrice)}</span>` : '';
          return `
            <div class="flex items-center gap-2.5 p-2 bg-stone-50 hover:bg-amber-50/70 rounded-xl border border-stone-200/90 transition-all">
              <img src="${img}" alt="${escapeHtml(p.name)}" class="w-12 h-12 rounded-lg object-cover border border-stone-200 flex-shrink-0 bg-stone-200" style="width: 48px; height: 48px;" />
              <div class="flex-1 min-w-0">
                <div class="font-bold text-stone-900 text-xs truncate" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
                <div class="text-[10px] text-stone-500 truncate mt-0.5" title="${escapeHtml(leather + ' • ' + sole)}">${escapeHtml(leather)} • ${escapeHtml(sole)}</div>
                <div class="flex items-center gap-2 mt-1">
                  <span class="font-extrabold text-amber-950 text-xs">${priceStr}</span>
                  ${origPriceStr}
                </div>
              </div>
              <button type="button" onclick="openQuickViewFromChat(${p.id})" class="px-2.5 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-800 active:scale-95 text-white font-bold text-[11px] flex-shrink-0 shadow-xs cursor-pointer transition-all">Xem</button>
            </div>
          `;
        }).join('')}
      </div>
      ${products.length > 3 ? `
        <div class="text-center pt-1">
          <a href="#products-section" onclick="toggleChatbot(false)" class="text-amber-800 font-bold hover:underline text-[11px]">
            👉 Xem thêm ${products.length - 3} mẫu dép khác tại đây
          </a>
        </div>
      ` : ''}
    </div>
  `;
}

// BỘ NÃO PHÂN TÍCH VÀ TRẢ LỜI CÂU HỎI (SMART NLP ENGINE)
function processUserQuery(query) {
  const q = normalizeVietnamese(query);
  const products = getStoreProducts();

  // 1. TƯ VẤN CHỌN SIZE & TÍNH CHIỀU DÀI CHÂN
  // Phát hiện người dùng nhập số đo (ví dụ: "chân 25cm", "25.5", "dai 26 cm")
  const sizeMatch = q.match(/(?:chan|dai|chieu dai)?\s*([2-3][0-9](?:[\.,][0-9])?)\s*(?:cm|centimet)?/);
  if (sizeMatch && parseFloat(sizeMatch[1]) >= 22 && parseFloat(sizeMatch[1]) <= 30) {
    const cm = parseFloat(sizeMatch[1].replace(',', '.'));
    let size = 40;
    if (cm <= 23.5) size = 37;
    else if (cm <= 24.0) size = 38;
    else if (cm <= 24.5) size = 39;
    else if (cm <= 25.0) size = 40;
    else if (cm <= 25.5) size = 41;
    else if (cm <= 26.0) size = 42;
    else if (cm <= 26.5) size = 43;
    else if (cm <= 27.5) size = 44;
    else size = 45;

    const matchedProducts = products.filter(p => !p.sizes || p.sizes.includes(size));

    let reply = `
      🎯 Với chiều dài bàn chân <strong>${cm} cm</strong>, cỡ dép chuẩn nhất dành cho anh là <strong>Size ${size}</strong> ạ!<br/><br/>
      💡 <strong>Kinh nghiệm may dép từ thợ da Tuyết Nhung:</strong><br/>
      • Dép da bò thật sẽ mềm và co giãn nhẹ 2-3mm sau 2-3 ngày đi vừa khít với phom chân.<br/>
      • Nếu mu bàn chân của anh dày hoặc bè ngang nhiều, anh nên tăng lên <strong>Size ${size + 1}</strong> để đi thoải mái nhất nhé!<br/>
      • Xưởng hỗ trợ <strong>đổi size tận nhà miễn phí trong 7 ngày</strong> nếu mang không vừa.
    `;

    reply += renderMiniProductCards(matchedProducts, `Các mẫu dép đang có sẵn Size ${size}:`);

    sendBotMessage(reply, [
      '👟 Xem mẫu quai ngang',
      '👟 Xem mẫu xỏ ngón',
      '🚚 Phí giao hàng thế nào?',
      '💬 Chat Zalo với thợ'
    ]);
    return;
  }

  // 1.2. Người dùng hỏi chung về size ("tư vấn size", "đo chân", "bảng size")
  if (q.includes('size') || q.includes('do chan') || q.includes('bang size') || q.includes('vua khong') || q.includes('co chan')) {
    const reply = `
      📏 <strong>Hướng dẫn đo size chân chuẩn xác tại nhà:</strong><br/><br/>
      1. Đặt gót chân sát cạnh tường phẳng trên một tờ giấy trắng.<br/>
      2. Dùng bút gạch 1 đường tại đầu ngón chân dài nhất.<br/>
      3. Lấy thước đo khoảng cách từ mép tường đến vạch đã kẻ (cm).<br/><br/>
      📊 <strong>Bảng size dép nam Tuyết Nhung:</strong><br/>
      • 23.5 - 24.0 cm: <strong>Size 38</strong><br/>
      • 24.0 - 24.5 cm: <strong>Size 39</strong><br/>
      • 24.5 - 25.0 cm: <strong>Size 40</strong> (Cỡ phổ biến)<br/>
      • 25.0 - 25.5 cm: <strong>Size 41</strong> (Bán chạy nhất)<br/>
      • 25.5 - 26.0 cm: <strong>Size 42</strong><br/>
      • 26.5 - 27.5 cm: <strong>Size 43 - 44</strong><br/><br/>
      <em>👉 Anh có thể gõ ngay số cm (Ví dụ: "chân 25cm") để em tính size tự động cho anh nhé!</em>
    `;
    sendBotMessage(reply, [
      'Chân 24.5cm',
      'Chân 25cm',
      'Chân 25.5cm',
      'Chân 26cm',
      'Chân 26.5cm'
    ]);
    return;
  }

  // 2. TÌM KIẾM THEO DANH MỤC & MẪU DÉP
  // 2.1. Dép quai ngang
  if (q.includes('quai ngang') || q.includes('ngang')) {
    const list = products.filter(p => p.category === 'quai-ngang' || normalizeVietnamese(p.name).includes('quai ngang'));
    let reply = `Dạ xưởng Tuyết Nhung có rất nhiều mẫu <strong>Dép Quai Ngang Da Bò Thật</strong> phong cách cổ điển, trẻ trung và êm chân ạ:`;
    reply += renderMiniProductCards(list.length > 0 ? list : products);
    sendBotMessage(reply, ['📏 Tư vấn size quai ngang', '🚚 Phí giao hàng bao nhiêu?', '🛡️ Bảo hành da thế nào?']);
    return;
  }

  // 2.2. Dép kẹp / Xỏ ngón
  if (q.includes('kep') || q.includes('xo ngon') || q.includes('tong')) {
    const list = products.filter(p => p.category === 'xongon' || normalizeVietnamese(p.name).includes('kep') || normalizeVietnamese(p.name).includes('xo ngon'));
    let reply = `Dạ đây là các mẫu <strong>Dép Kẹp (Xỏ Ngón) Da Bò</strong> tự may thủ công, kẹp da êm không cọ đau ngón chân, đế bám cực tốt:`;
    reply += renderMiniProductCards(list.length > 0 ? list : products);
    sendBotMessage(reply, ['📏 Tư vấn size dép kẹp', '🚚 Bao lâu thì nhận được?', '🎁 Mã giảm giá']);
    return;
  }

  // 2.3. Sandal / Quai hậu
  if (q.includes('sandal') || q.includes('quai hau') || q.includes('xang dan')) {
    const list = products.filter(p => p.category === 'sandal' || normalizeVietnamese(p.name).includes('sandal') || normalizeVietnamese(p.name).includes('quai hau'));
    let reply = `Dạ đây là bộ sưu tập <strong>Sandal Da Nam Quai Hậu</strong> lịch sự đi làm, đi chơi hay đi tiệc đều rất sang trọng:`;
    reply += renderMiniProductCards(list.length > 0 ? list : products);
    sendBotMessage(reply, ['📏 Tư vấn size sandal', '🛡️ Bảo hành bao lâu?']);
    return;
  }

  // 2.4. Dép sục
  if (q.includes('suc') || q.includes('dep suc')) {
    const list = products.filter(p => p.category === 'suc-da' || normalizeVietnamese(p.name).includes('suc'));
    let reply = `Dạ xưởng có mẫu <strong>Dép Sục Da Nam Cao Cấp</strong> lót đệm êm ái, bít mũi chống bụi và chống nước tốt ạ:`;
    reply += renderMiniProductCards(list.length > 0 ? list : products);
    sendBotMessage(reply, ['📏 Cách chọn size sục da', '🚚 Có được đi thử không?']);
    return;
  }

  // 2.5. Bán chạy nhất / Hot / Nổi bật
  if (q.includes('ban chay') || q.includes('hot') || q.includes('nhieu nguoi mua') || q.includes('tieu bieu') || q.includes('thich nhat')) {
    const list = products.filter(p => (p.tag && normalizeVietnamese(p.tag).includes('chay')) || p.rating >= 4.8);
    let reply = `Dạ đây là <strong>Top mẫu dép da nam bán chạy nhất</strong> được hơn 1.200 khách hàng đánh giá 5 sao tại xưởng:`;
    reply += renderMiniProductCards(list.length > 0 ? list : products);
    sendBotMessage(reply, ['📏 Hướng dẫn đo size', '🎁 Xem mã giảm giá', '🚚 Phí vận chuyển']);
    return;
  }

  // 2.6. Mẫu mới / Mới nhất
  if (q.includes('moi') || q.includes('mau moi') || q.includes('hang moi')) {
    const list = [...products].reverse();
    let reply = `Dạ đây là các <strong>mẫu dép da mới xuất xưởng tuần này</strong> của Tuyết Nhung:`;
    reply += renderMiniProductCards(list);
    sendBotMessage(reply, ['📏 Tư vấn chọn size', '🛡️ Chính sách bảo hành']);
    return;
  }

  // 2.7. Giá rẻ / Dưới 400k / Giá bao nhiêu
  if (q.includes('gia re') || q.includes('re') || q.includes('duoi 400') || q.includes('gia bao nhieu') || q.includes('bao nhieu tien')) {
    const list = products.filter(p => p.price <= 380000);
    let reply = `Dạ toàn bộ dép da tại xưởng Tuyết Nhung đều do thợ tự đóng nên có mức giá tận gốc cực kỳ hợp lý, dao động từ <strong>340.000đ - 420.000đ</strong> cho một đôi da bò thật 100% nguyên tấm ạ:`;
    reply += renderMiniProductCards(list.length > 0 ? list : products);
    sendBotMessage(reply, ['🎁 Mã giảm giá hôm nay', '🚚 Đặt 2 đôi có freeship không?']);
    return;
  }

  // 3. CHÍNH SÁCH BẢO HÀNH & CHẤT LƯỢNG DA
  if (q.includes('bao hanh') || q.includes('da that') || q.includes('chat lieu') || q.includes('bong troc') || q.includes('no da') || q.includes('dut chi') || q.includes('ben khong')) {
    const reply = `
      🛡️ <strong>Chính sách bảo hành & Cam kết chất lượng từ Xưởng Tuyết Nhung:</strong><br/><br/>
      1. <strong>100% Da bò thật nguyên miếng:</strong> Tuyển chọn da bò sáp, da pullup cao cấp, mềm mại, thoáng khí, tuyệt đối không bong nổ như simili giả da.<br/>
      2. <strong>Bảo hành 12 tháng:</strong> Đổi mới hoặc xử lý miễn phí nếu có lỗi nổ da, nứt da do nhà sản xuất.<br/>
      3. <strong>Bảo hành chỉ khâu TRỌN ĐỜI:</strong> Toàn bộ đế đều được may viền bằng chỉ dù chuyên dụng chịu lực, bảo hành khâu lại miễn phí suốt đời dép.<br/>
      4. <strong>Đế cao su đúc nguyên khối:</strong> Khắc vân chống trơn trượt hiệu quả, đi trời mưa êm ái không hôi chân.
    `;
    sendBotMessage(reply, [
      '🚚 Có được kiểm tra trước khi trả tiền?',
      '👟 Xem mẫu dép bán chạy',
      '💬 Chat Zalo với thợ'
    ]);
    return;
  }

  // 4. VẬN CHUYỂN, GIAO HÀNG & ĐỒNG KIỂM
  if (q.includes('ship') || q.includes('giao hang') || q.includes('phi ship') || q.includes('bao lau') || q.includes('nhan hang') || q.includes('dong kiem') || q.includes('kiem tra') || q.includes('thu hang') || q.includes('doi size') || q.includes('doi tra')) {
    const reply = `
      🚚 <strong>Chính sách giao nhận & kiểm hàng của Xưởng:</strong><br/><br/>
      • <strong>ĐƯỢC KIỂM TRA & ĐI THỬ:</strong> Khi shipper giao đến, anh được mở hộp kiểm tra đúng mẫu da và mang thử vừa chân mới thanh toán tiền (Ship COD).<br/>
      • <strong>Thời gian giao hàng:</strong><br/>
      &nbsp;&nbsp;- Khu vực TP.HCM: 1 - 2 ngày làm việc.<br/>
      &nbsp;&nbsp;- Các tỉnh thành khác: 2 - 4 ngày làm việc.<br/>
      • <strong>Phí vận chuyển:</strong> Đồng giá chỉ <strong>25.000đ</strong> toàn quốc.<br/>
      &nbsp;&nbsp;🎉 <strong>MIỄN PHÍ VẬN CHUYỂN (FREESHIP)</strong> khi đặt từ 2 đôi bất kỳ!<br/>
      • <strong>Hỗ trợ đổi size tận nhà:</strong> Nếu nhận dép đi không vừa, xưởng sẽ gửi shipper mang đôi size khác đến đổi tận nhà cho anh trong vòng 7 ngày!
    `;
    sendBotMessage(reply, [
      '📏 Tính size chân của tôi',
      '🎁 Xem mã giảm giá',
      '👟 Xem mẫu quai ngang'
    ]);
    return;
  }

  // 5. MÃ GIẢM GIÁ & KHUYẾN MÃI
  if (q.includes('khuyen mai') || q.includes('giam gia') || q.includes('voucher') || q.includes('ma uu dai') || q.includes('ma giam') || q.includes('sale') || q.includes('uu dai')) {
    const reply = `
      🎁 <strong>Các mã ưu đãi xưởng đang áp dụng hôm nay:</strong><br/><br/>
      1. Mã: <code class="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">TUYETNHUNG</code><br/>
      👉 <strong>Giảm ngay 10%</strong> trên tổng hóa đơn đặt mua hôm nay.<br/><br/>
      2. Mã: <code class="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">FREESHIP</code><br/>
      👉 <strong>Hỗ trợ giảm 5%</strong> tương đương phí giao hàng toàn quốc.<br/><br/>
      <em>💡 Mẹo: Khi mua từ 2 đôi, hệ thống sẽ tự động miễn phí giao hàng toàn quốc mà không cần nhập mã!</em>
    `;
    sendBotMessage(reply, [
      '👟 Chọn mẫu dép ngay',
      '📦 Kiểm tra đơn hàng của tôi',
      '📏 Tư vấn đo size'
    ]);
    return;
  }

  // 6. TRA CỨU ĐƠN HÀNG GẦN NHẤT
  if (q.includes('don hang') || q.includes('tra cuu') || q.includes('kiem tra don') || q.includes('don cua toi') || q.includes('tinh trang don')) {
    let orderHistory = [];
    try {
      orderHistory = JSON.parse(localStorage.getItem('tuyetnhung_orders')) || [];
    } catch (e) {}

    if (orderHistory.length > 0) {
      const latestOrder = orderHistory[orderHistory.length - 1];
      const itemsText = latestOrder.items.map(i => `• ${i.name} (Size ${i.size}, ${i.color}) x${i.quantity}`).join('<br/>');

      const reply = `
        📦 <strong>Thông tin đơn hàng gần nhất của anh/chị:</strong><br/><br/>
        • <strong>Mã đơn:</strong> <span class="text-amber-900 font-black">#${latestOrder.orderId}</span><br/>
        • <strong>Người nhận:</strong> ${latestOrder.name} - ${latestOrder.phone}<br/>
        • <strong>Địa chỉ:</strong> ${latestOrder.address}<br/>
        • <strong>Sản phẩm đã đặt:</strong><br/>${itemsText}<br/>
        • <strong>Tổng thanh toán (COD):</strong> <span class="font-bold text-amber-950">${formatCurrency(latestOrder.finalTotal)}</span><br/>
        • <strong>Ngày đặt:</strong> ${latestOrder.createdAt}<br/>
        • <strong>Trạng thái:</strong> <span class="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">🟢 Đã tiếp nhận - Xưởng đang chuẩn bị gửi</span><br/><br/>
        <em>Anh/chị có thể nhắn mã đơn <strong>#${latestOrder.orderId}</strong> qua Zalo xưởng để được cập nhật lộ trình giao sớm nhất nhé!</em>
      `;
      sendBotMessage(reply, [
        '💬 Chat Zalo xưởng để giục đơn',
        '👟 Xem thêm mẫu dép khác'
      ]);
      return;
    } else {
      const reply = `
        Dạ hiện tại trên trình duyệt này chưa ghi nhận đơn hàng nào vừa đặt ạ.<br/><br/>
        Nếu anh đã đặt hàng qua Zalo hoặc gọi Hotline trước đó, anh có thể bấm nút bên dưới để nhắn số điện thoại cho xưởng kiểm tra nhanh nhé!
      `;
      sendBotMessage(reply, [
        '💬 Nhắn Zalo kiểm tra đơn',
        '📞 Gọi Hotline 0348.789.257',
        '👟 Chọn mẫu dép mới'
      ]);
      return;
    }
  }

  // 7. ĐỊA CHỈ XƯỞNG, HOTLINE & ZALO
  if (q.includes('dia chi') || q.includes('o dau') || q.includes('xuong o dau') || q.includes('sdt') || q.includes('so dien thoai') || q.includes('hotline') || q.includes('zalo') || q.includes('gap chu xuong') || q.includes('lien he') || q.includes('tong dai')) {
    const reply = `
      📍 <strong>Thông tin liên hệ Xưởng Dép Nam Tuyết Nhung:</strong><br/><br/>
      • <strong>Địa chỉ xưởng:</strong> 1005C Hà Huy Giáp, Phường An Phú Đông, Quận 12, TP. Hồ Chí Minh.<br/>
      • <strong>Hotline tư vấn nhanh:</strong> <a href="tel:0348789257" class="text-amber-900 font-bold underline">0348.789.257</a><br/>
      • <strong>Zalo xưởng:</strong> <a href="https://zalo.me/0348789257" target="_blank" class="text-blue-700 font-bold underline">0348789257 (Tuyết Nhung)</a><br/>
      • <strong>Giờ làm việc:</strong> 08:00 - 21:30 (Mở cửa tất cả các ngày trong tuần, kể cả Thứ 7 & CN).<br/><br/>
      <em>Anh/chị ghé xưởng xem mẫu trực tiếp hoặc đặt giao tận nhà đều được ạ!</em>
    `;
    sendBotMessage(reply, [
      '💬 Mở Zalo nhắn tin ngay',
      '📞 Bấm gọi Hotline ngay',
      '👟 Xem mẫu dép đang bán'
    ]);
    return;
  }

  // 8. CHÀO HỎI / XIN CHÀO
  if (q.includes('chao') || q.includes('hello') || q.includes('hi') || q.includes('alo') || q.includes('ad oi') || q.includes('shop oi') || q.includes('em oi') || q === 'ad') {
    const reply = `
      Dạ em chào anh/chị ạ! Rất vui được đón tiếp anh/chị tại Xưởng Dép Nam Tuyết Nhung. 👋<br/><br/>
      Anh/chị đang quan tâm đến kiểu dép nào hoặc cần em hỗ trợ đo size chân chuẩn xác không ạ?
    `;
    sendBotMessage(reply, [
      '👟 Xem mẫu dép bán chạy',
      '📏 Tư vấn đo size chân',
      '🎁 Có mã giảm giá nào không?',
      '🚚 Phí giao hàng bao nhiêu?'
    ]);
    return;
  }

  // 9. LỜI CẢM ƠN
  if (q.includes('cam on') || q.includes('thank') || q.includes('ok') || q.includes('tuyet') || q.includes('da cam on') || q.includes('tot qua')) {
    const reply = `
      Dạ không có chi ạ! Rất hân hạnh được phục vụ anh/chị. Chúc anh/chị chọn được đôi dép da bò thật ưng ý và bền đẹp nhất cùng Tuyết Nhung nhé! ❤️
    `;
    sendBotMessage(reply, [
      '👟 Xem thêm mẫu dép',
      '💬 Chat Zalo với thợ',
      '📞 Gọi Hotline xưởng'
    ]);
    return;
  }

  // 10. MẶC ĐỊNH KHI KHÔNG NHẬN DIỆN ĐƯỢC CHÍNH XÁC (FALLBACK THÔNG MINH)
  // Thử tìm kiếm tên sản phẩm khớp với từ khóa người dùng nhập
  const matchedKeywordProducts = products.filter(p => {
    const pName = normalizeVietnamese(p.name);
    const pLeather = normalizeVietnamese(p.leatherType || '');
    return pName.includes(q) || pLeather.includes(q);
  });

  if (matchedKeywordProducts.length > 0) {
    let reply = `Dạ em tìm thấy các mẫu dép phù hợp với từ khóa "<strong>${escapeHtml(query)}</strong>" của anh đây ạ:`;
    reply += renderMiniProductCards(matchedKeywordProducts);
    sendBotMessage(reply, [
      '📏 Tư vấn chọn size',
      '🚚 Phí giao hàng thế nào?',
      '💬 Nhắn Zalo hỏi thêm'
    ]);
    return;
  }

  // Fallback chung
  const reply = `
    Dạ em đã ghi nhận câu hỏi của anh/chị! Vì là trợ lý tự động nên đôi khi em chưa hiểu hết ngữ cảnh. Anh/chị có thể bấm chọn nhanh các chủ đề phổ biến dưới đây, hoặc gõ chiều dài chân (VD: <em>"chân 25cm"</em>) để em tính size ngay nhé:
  `;
  sendBotMessage(reply, [
    '👟 Mẫu dép bán chạy nhất',
    '📏 Tư vấn đo size chân',
    '🚚 Phí giao hàng & Đổi size',
    '🛡️ Bảo hành 12 tháng da',
    '💬 Kết nối Zalo chủ xưởng'
  ]);
}

// Lắng nghe sự kiện bàn phím
function initChatbotEvents() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isChatbotOpen) {
      toggleChatbot(false);
    }
  });
}

// Helper thoát mã HTML an toàn
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Fallback định dạng tiền tệ VND
function formatCurrency(amount) {
  if (typeof window.formatCurrency === 'function' && window.formatCurrency !== formatCurrency) {
    return window.formatCurrency(amount);
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
}

// Mở modal xem nhanh sản phẩm từ tin nhắn Chatbot
function openQuickViewFromChat(productId) {
  if (typeof openQuickView === 'function') {
    openQuickView(productId);
  } else if (window.openQuickView) {
    window.openQuickView(productId);
  }
}

// Gắn các hàm ra window để inline onclick trong HTML hoạt động mượt mà 100%
window.openQuickViewFromChat = openQuickViewFromChat;
window.toggleChatbot = toggleChatbot;
window.handleQuickChipClick = handleQuickChipClick;
window.dismissWelcomeBubble = dismissWelcomeBubble;
window.toggleChatSound = toggleChatSound;
window.resetChatHistory = resetChatHistory;
window.handleChatSubmit = handleChatSubmit;
