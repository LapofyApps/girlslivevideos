/* ===========================
   PROFILE DATA
   =========================== */
// Self-hosted WebP copies (128×128) of randomuser.me portraits — age-mapped:
//   20-22 → portraits 1-25   (youthful)
//   23-25 → portraits 26-55  (mid-20s)
//   26-29 → portraits 56-80  (late-20s)
const _p = n => `/img/profiles/w${n}.webp`;
const avatarAlt = p => `Simulated profile avatar – ${p.name}`;

const PROFILES = [
  // ── India (20 profiles across different states) ──
  { id: 1,  img: _p(7),  name: "Priya",    age: 22, city: "Mumbai",          country: "Maharashtra",   types: ["video","audio","chat"] },
  { id: 2,  img: _p(33), name: "Anjali",   age: 24, city: "Delhi",           country: "Delhi",         types: ["video","chat"] },
  { id: 3,  img: _p(12), name: "Fatima",   age: 21, city: "Hyderabad",       country: "Telangana",     types: ["audio","chat"] },
  { id: 4,  img: _p(40), name: "Sneha",    age: 23, city: "Bengaluru",       country: "Karnataka",     types: ["video","audio"] },
  { id: 5,  img: _p(3),  name: "Kavya",    age: 20, city: "Chennai",         country: "Tamil Nadu",    types: ["chat","audio"] },
  { id: 6,  img: _p(48), name: "Neha",     age: 25, city: "Pune",            country: "Maharashtra",   types: ["video","audio","chat"] },
  { id: 7,  img: _p(18), name: "Riya",     age: 22, city: "Kolkata",         country: "West Bengal",   types: ["chat","video"] },
  { id: 8,  img: _p(62), name: "Divya",    age: 26, city: "Jaipur",          country: "Rajasthan",     types: ["audio","chat"] },
  { id: 9,  img: _p(35), name: "Pooja",    age: 23, city: "Ahmedabad",       country: "Gujarat",       types: ["video","audio"] },
  { id: 10, img: _p(70), name: "Meena",    age: 27, city: "Lucknow",         country: "Uttar Pradesh", types: ["chat"] },
  { id: 11, img: _p(9),  name: "Shruti",   age: 21, city: "Chandigarh",      country: "Punjab",        types: ["video","chat"] },
  { id: 12, img: _p(44), name: "Ananya",   age: 24, city: "Kochi",           country: "Kerala",        types: ["audio","video","chat"] },
  { id: 13, img: _p(15), name: "Simran",   age: 22, city: "Amritsar",        country: "Punjab",        types: ["video","audio"] },
  { id: 14, img: _p(53), name: "Nisha",    age: 25, city: "Bhopal",          country: "Madhya Pradesh",types: ["chat","audio"] },
  { id: 15, img: _p(29), name: "Deepika",  age: 23, city: "Nagpur",          country: "Maharashtra",   types: ["video"] },
  { id: 16, img: _p(75), name: "Pallavi",  age: 28, city: "Visakhapatnam",   country: "Andhra Pradesh",types: ["audio","chat"] },
  { id: 17, img: _p(5),  name: "Swati",    age: 20, city: "Indore",          country: "Madhya Pradesh",types: ["video","audio","chat"] },
  { id: 18, img: _p(66), name: "Asha",     age: 26, city: "Patna",           country: "Bihar",         types: ["chat"] },
  { id: 19, img: _p(78), name: "Lakshmi",  age: 29, city: "Coimbatore",      country: "Tamil Nadu",    types: ["video","audio"] },
  { id: 20, img: _p(22), name: "Radha",    age: 21, city: "Surat",           country: "Gujarat",       types: ["audio","chat"] },
  // ── A few international ──
  { id: 21, img: _p(38), name: "Emma",     age: 24, city: "London",          country: "UK",            types: ["video","chat"] },
  { id: 22, img: _p(11), name: "Sofia",    age: 22, city: "Dubai",           country: "UAE",           types: ["audio","chat"] },
  { id: 23, img: _p(51), name: "Chloe",    age: 25, city: "Toronto",         country: "Canada",        types: ["video","audio","chat"] },
  { id: 24, img: _p(68), name: "Aria",     age: 27, city: "Singapore",       country: "Singapore",     types: ["chat","video"] },
];

/* Fisher-Yates shuffle — runs once on page load */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SHUFFLED_PROFILES = shuffle(PROFILES);

// The grid can be embedded on any page. Optional attributes:
//   data-sim-type="video|audio|chat"  → preset filter
//   data-sim-limit="6"                → page size
const GRID = document.getElementById("profilesGrid");
const PAGE_SIZE = GRID ? parseInt(GRID.dataset.simLimit || "12", 10) : 12;
let currentPage = 1;
let activeFilter = (GRID && GRID.dataset.simType) || "all";
let searchQuery = "";
let filteredProfiles = SHUFFLED_PROFILES.filter(p => activeFilter === "all" || p.types.includes(activeFilter));

/* ===========================
   MODAL MARKUP (shared by every page with a simulator)
   =========================== */
const MODALS_HTML = `
<div class="modal-overlay" id="callModal" role="dialog" aria-modal="true" aria-labelledby="modalName">
  <div class="modal-box">
    <div class="modal-header-bar">
      <span id="modalCallType">📞 Audio Call</span>
      <button class="modal-close" id="modalClose" aria-label="Close simulated call">✕</button>
    </div>
    <div class="modal-avatar-wrap">
      <div class="modal-avatar" id="modalAvatar">👩</div>
      <div class="modal-rings">
        <div class="mring mr1"></div>
        <div class="mring mr2"></div>
        <div class="mring mr3"></div>
      </div>
    </div>
    <div class="modal-name" id="modalName">Emma, 24</div>
    <div class="modal-location" id="modalLocation">📍 New York, USA</div>
    <div class="modal-status" id="modalStatus">Calling...</div>
    <div class="modal-timer" id="modalTimer" style="display:none;">00:00</div>
    <div class="modal-actions">
      <button class="modal-btn decline" id="modalDecline">
        <span>📵</span> End Call
      </button>
      <button class="modal-btn accept" id="modalAccept">
        <span>📞</span> Answer
      </button>
    </div>
    <p class="modal-note">🎭 This is a simulated call for entertainment only</p>
  </div>
</div>

<div class="chat-overlay" id="chatModal" role="dialog" aria-modal="true" aria-labelledby="chatName">
  <div class="chat-box">
    <div class="chat-header">
      <div class="chat-header-left">
        <div class="chat-avatar" id="chatAvatar">👩</div>
        <div class="chat-header-info">
          <div class="chat-header-name" id="chatName">Priya, 22</div>
          <div class="chat-header-status">
            <span class="chat-online-dot"></span> Online (simulated)
          </div>
        </div>
      </div>
      <div class="chat-header-right">
        <button class="chat-icon-btn" id="chatCallBtn" title="Audio Call" aria-label="Start simulated audio call">📞</button>
        <button class="chat-icon-btn" id="chatVideoBtn" title="Video Call" aria-label="Start simulated video call">📹</button>
        <button class="chat-icon-btn chat-close-btn" id="chatClose" aria-label="Close simulated chat">✕</button>
      </div>
    </div>
    <div class="chat-messages" id="chatMessages">
      <div class="chat-date-divider">Today</div>
    </div>
    <div class="chat-typing" id="chatTyping" style="display:none;">
      <span id="chatTypingName">Priya</span> is typing
      <span class="typing-dots"><span></span><span></span><span></span></span>
    </div>
    <div class="chat-input-bar">
      <button class="chat-emoji-btn" id="chatEmojiToggle" aria-label="Insert emoji">😊</button>
      <input type="text" id="chatInput" placeholder="Type a message..." autocomplete="off" aria-label="Message" />
      <button class="chat-send-btn" id="chatSend" aria-label="Send message">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
      </button>
    </div>
    <div class="emoji-picker" id="emojiPicker" style="display:none;">
      <span>😊</span><span>😂</span><span>😍</span><span>🥰</span><span>😘</span>
      <span>😎</span><span>🤩</span><span>😜</span><span>🤗</span><span>😇</span>
      <span>❤️</span><span>🔥</span><span>💯</span><span>👍</span><span>🙏</span>
      <span>✨</span><span>💕</span><span>😭</span><span>🥺</span><span>👋</span>
    </div>
    <p class="chat-note">🎭 Simulated chat for entertainment only</p>
  </div>
</div>`;

function on(id, evt, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(evt, fn);
}

if (GRID && !document.getElementById("callModal")) {
  document.body.insertAdjacentHTML("beforeend", MODALS_HTML);
}

/* ===========================
   RENDER PROFILES
   =========================== */
function renderProfiles(reset = false) {
  const grid = GRID;
  if (!grid) return;
  if (reset) { grid.innerHTML = ""; currentPage = 1; }

  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filteredProfiles.slice(start, start + PAGE_SIZE);

  slice.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "profile-card";
    card.style.animationDelay = `${i * 0.05}s`;
    card.dataset.id = p.id;

    const tagsHTML = p.types.map(t => `<span class="tag tag-${t}">${
      t === "video" ? "📹 Video" : t === "audio" ? "🎙️ Audio" : "💬 Chat"
    }</span>`).join("");

    card.innerHTML = `
      <div class="card-avatar-wrap">
        <img class="card-avatar card-photo" src="${p.img}" alt="${avatarAlt(p)}" width="80" height="80" loading="lazy" decoding="async" />
        <div class="online-badge"></div>
      </div>
      <div class="card-name">${p.name}, ${p.age}</div>
      <div class="card-meta">📍 ${p.city}, ${p.country}</div>
      <div class="card-tags">${tagsHTML}</div>
      <div class="card-actions">
        <button class="card-btn btn-call" data-id="${p.id}" data-type="audio">📞 Call</button>
        <button class="card-btn btn-video" data-id="${p.id}" data-type="video">📹 Video</button>
      </div>
      <button class="card-btn btn-chat" data-id="${p.id}" data-type="chat" style="width:100%;margin-top:6px;">💬 Chat</button>
    `;

    grid.appendChild(card);
  });

  // Show/hide load more
  const btn = document.getElementById("loadMoreBtn");
  if (!btn) return;
  const totalShown = Math.min(currentPage * PAGE_SIZE, filteredProfiles.length);
  btn.style.display = totalShown >= filteredProfiles.length ? "none" : "block";
}

/* ===========================
   FILTER & SEARCH
   =========================== */
function applyFilter() {
  filteredProfiles = SHUFFLED_PROFILES.filter(p => {
    const matchFilter = activeFilter === "all" || p.types.includes(activeFilter);
    const matchSearch = searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery) ||
      p.city.toLowerCase().includes(searchQuery) ||
      p.country.toLowerCase().includes(searchQuery);
    return matchFilter && matchSearch;
  });
  renderProfiles(true);
}

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    applyFilter();
  });
});

const searchInputEl = document.getElementById("searchInput");
if (searchInputEl) searchInputEl.addEventListener("input", e => {
  searchQuery = e.target.value.trim().toLowerCase();
  applyFilter();
});

const loadMoreEl = document.getElementById("loadMoreBtn");
if (loadMoreEl) loadMoreEl.addEventListener("click", () => {
  currentPage++;
  renderProfiles(false);
});

/* ===========================
   CALL MODAL
   =========================== */
let callTimer = null;
let callSeconds = 0;
let callConnected = false;

function openCallModal(profile, type) {
  const overlay = document.getElementById("callModal");
  const avatarEl = document.getElementById("modalAvatar");
  avatarEl.innerHTML = `<img src="${profile.img}" alt="${avatarAlt(profile)}" width="90" height="90" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
  document.getElementById("modalName").textContent = `${profile.name}, ${profile.age}`;
  document.getElementById("modalLocation").textContent = `📍 ${profile.city}, ${profile.country}`;
  document.getElementById("modalCallType").textContent = type === "video" ? "📹 Video Call" : "📞 Audio Call";
  document.getElementById("modalStatus").textContent = "Calling...";
  document.getElementById("modalStatus").style.display = "block";
  document.getElementById("modalTimer").style.display = "none";
  document.getElementById("modalAccept").style.display = "flex";
  callConnected = false;
  callSeconds = 0;

  overlay.classList.add("active");

  // Auto-ring animation: after 3s simulate answer
  clearTimeout(window._callRingTimeout);
  window._callRingTimeout = setTimeout(() => {
    if (overlay.classList.contains("active") && !callConnected) {
      connectCall();
    }
  }, 3500);
}

function connectCall() {
  callConnected = true;
  document.getElementById("modalStatus").style.display = "none";
  document.getElementById("modalAccept").style.display = "none";
  const timerEl = document.getElementById("modalTimer");
  timerEl.style.display = "block";
  callSeconds = 0;
  clearInterval(callTimer);
  callTimer = setInterval(() => {
    callSeconds++;
    const m = String(Math.floor(callSeconds / 60)).padStart(2, "0");
    const s = String(callSeconds % 60).padStart(2, "0");
    timerEl.textContent = `${m}:${s}`;
  }, 1000);
}

function closeCallModal() {
  clearInterval(callTimer);
  clearTimeout(window._callRingTimeout);
  document.getElementById("callModal").classList.remove("active");
  callConnected = false;
}

on("modalDecline", "click", closeCallModal);
on("modalClose", "click", closeCallModal);
on("modalAccept", "click", connectCall);

on("callModal", "click", e => {
  if (e.target === document.getElementById("callModal")) closeCallModal();
});

// Adsterra Smartlink — fire once per session on first profile interaction
const SMARTLINK_URL = "https://doubtfulimpatient.com/rjhzdfv2tc?key=17b884099c81e7677611cdffb606251a";
function triggerSmartlink() {
  if (sessionStorage.getItem("slk_fired")) return;
  sessionStorage.setItem("slk_fired", "1");
  window.open(SMARTLINK_URL, "_blank", "noopener");
}

// Delegate card button clicks
on("profilesGrid", "click", e => {
  const btn = e.target.closest(".card-btn");
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  const type = btn.dataset.type;
  const profile = SHUFFLED_PROFILES.find(p => p.id === id);
  if (!profile) return;
  triggerSmartlink();
  if (type === "chat") openChatModal(profile);
  else openCallModal(profile, type);
});

/* ===========================
   CHAT MODAL
   =========================== */
const AUTO_REPLIES = [
  "Hey! How are you? 😊",
  "Hi there! 👋",
  "Aww that's so sweet 🥰",
  "Haha 😂 you're funny!",
  "Can I call you? 📞",
  "I was just thinking about you! ✨",
  "Omg really?! Tell me more 👀",
  "You made my day 💕",
  "Hehe 😜 stop it!",
  "I'm good, what about you?",
  "Seriously?? 😮",
  "That's amazing! 🔥",
  "Miss you 🥺",
  "Let's video call tonight? 📹",
  "You're so cute 😍",
  "lol 😂 same here!",
  "Aww 😘 thank you!",
  "Send me a selfie 🤳",
  "I'm a little busy rn but I'll reply soon 🙈",
  "Bro/sis that's wild 😂",
  "Can we talk on call? I have something to say 🤭",
  "Good morning! 🌅 How's your day?",
  "I was just online, saw your message 😊",
  "Haha you always know what to say 💯",
  "Yeah totally agree 👍",
];

let chatProfile = null;
let chatReplyTimeout = null;

function openChatModal(profile) {
  chatProfile = profile;

  document.getElementById("chatAvatar").innerHTML = `<img src="${profile.img}" alt="${avatarAlt(profile)}" width="44" height="44" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
  document.getElementById("chatName").textContent = `${profile.name}, ${profile.age}`;
  document.getElementById("chatTypingName").textContent = profile.name;

  // Clear old messages except date divider
  const msgs = document.getElementById("chatMessages");
  msgs.innerHTML = `<div class="chat-date-divider">Today</div>`;

  // Opening message from profile after short delay
  document.getElementById("chatModal").classList.add("active");
  document.getElementById("chatInput").focus();

  setTimeout(() => showTyping(), 800);
  setTimeout(() => {
    hideTyping();
    appendMessage("them", pickReply());
  }, 2200);
}

function closeChatModal() {
  document.getElementById("chatModal").classList.remove("active");
  clearTimeout(chatReplyTimeout);
  hideTyping();
  chatProfile = null;
}

function pickReply() {
  return AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
}

function showTyping() {
  document.getElementById("chatTyping").style.display = "flex";
  scrollChat();
}
function hideTyping() {
  document.getElementById("chatTyping").style.display = "none";
}

function scrollChat() {
  const msgs = document.getElementById("chatMessages");
  msgs.scrollTop = msgs.scrollHeight;
}

function appendMessage(side, text) {
  const msgs = document.getElementById("chatMessages");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble chat-bubble-${side}`;

  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  bubble.innerHTML = `
    <div class="bubble-text">${escapeHtml(text)}</div>
    <div class="bubble-time">${time}${side === "me" ? ' <span class="bubble-tick">✓✓</span>' : ''}</div>
  `;
  msgs.appendChild(bubble);
  scrollChat();
}

function escapeHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text || !chatProfile) return;

  appendMessage("me", text);
  input.value = "";

  // Show typing then reply
  const delay = 1000 + Math.random() * 2000;
  clearTimeout(chatReplyTimeout);
  chatReplyTimeout = setTimeout(() => showTyping(), 400);
  chatReplyTimeout = setTimeout(() => {
    hideTyping();
    appendMessage("them", pickReply());
  }, delay);
}

// Send on button click
on("chatSend", "click", sendMessage);

// Send on Enter key
on("chatInput", "keydown", e => {
  if (e.key === "Enter") sendMessage();
});

// Close button
on("chatClose", "click", closeChatModal);

// Click outside to close
on("chatModal", "click", e => {
  if (e.target === document.getElementById("chatModal")) closeChatModal();
});

// Call/video from inside chat
on("chatCallBtn", "click", () => {
  if (chatProfile) { closeChatModal(); openCallModal(chatProfile, "audio"); }
});
on("chatVideoBtn", "click", () => {
  if (chatProfile) { closeChatModal(); openCallModal(chatProfile, "video"); }
});

// Emoji picker toggle
on("chatEmojiToggle", "click", e => {
  e.stopPropagation();
  const picker = document.getElementById("emojiPicker");
  picker.style.display = picker.style.display === "none" ? "grid" : "none";
});

on("emojiPicker", "click", e => {
  if (e.target.tagName === "SPAN") {
    const input = document.getElementById("chatInput");
    input.value += e.target.textContent;
    input.focus();
    document.getElementById("emojiPicker").style.display = "none";
  }
});

document.addEventListener("click", e => {
  const picker = document.getElementById("emojiPicker");
  if (picker && !picker.contains(e.target) && e.target.id !== "chatEmojiToggle") {
    picker.style.display = "none";
  }
});

/* ===========================
   HAMBURGER MENU
   =========================== */
on("hamburger", "click", e => {
  const open = document.getElementById("nav").classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", String(open));
});

/* ===========================
   FAQ ACCORDION
   =========================== */
document.querySelectorAll(".faq-q").forEach(q => {
  q.addEventListener("click", () => {
    const answer = q.nextElementSibling;
    const isOpen = answer.classList.contains("visible");
    document.querySelectorAll(".faq-a").forEach(a => a.classList.remove("visible"));
    document.querySelectorAll(".faq-q").forEach(b => b.classList.remove("open"));
    if (!isOpen) {
      answer.classList.add("visible");
      q.classList.add("open");
    }
  });
});

/* ===========================
   SCROLL REVEAL (lightweight)
   =========================== */
function initScrollReveal() {
  const els = document.querySelectorAll(".step-card, .faq-item");
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        e.target.style.transform = "translateY(0)";
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(24px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    io.observe(el);
  });
}

/* ===========================
   INIT
   =========================== */
document.addEventListener("DOMContentLoaded", () => {
  renderProfiles(true);
  initScrollReveal();
});
