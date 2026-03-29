/* ===========================
   PROFILE DATA
   =========================== */
// Portrait URLs from randomuser.me — age-mapped:
//   20-22 → portraits 1-25   (youthful)
//   23-25 → portraits 26-55  (mid-20s)
//   26-29 → portraits 56-80  (late-20s)
const _p = n => `https://randomuser.me/api/portraits/women/${n}.jpg`;

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

const PAGE_SIZE = 12;
let currentPage = 1;
let filteredProfiles = [...SHUFFLED_PROFILES];
let activeFilter = "all";
let searchQuery = "";

/* ===========================
   RENDER PROFILES
   =========================== */
function renderProfiles(reset = false) {
  const grid = document.getElementById("profilesGrid");
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
        <img class="card-avatar card-photo" src="${p.img}" alt="${p.name}" loading="lazy" />
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

document.getElementById("searchInput").addEventListener("input", e => {
  searchQuery = e.target.value.trim().toLowerCase();
  applyFilter();
});

document.getElementById("loadMoreBtn").addEventListener("click", () => {
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
  avatarEl.innerHTML = `<img src="${profile.img}" alt="${profile.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
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

document.getElementById("modalDecline").addEventListener("click", closeCallModal);
document.getElementById("modalClose").addEventListener("click", closeCallModal);
document.getElementById("modalAccept").addEventListener("click", connectCall);

document.getElementById("callModal").addEventListener("click", e => {
  if (e.target === document.getElementById("callModal")) closeCallModal();
});

// Delegate card button clicks
document.getElementById("profilesGrid").addEventListener("click", e => {
  const btn = e.target.closest(".card-btn");
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  const type = btn.dataset.type;
  const profile = SHUFFLED_PROFILES.find(p => p.id === id);
  if (!profile) return;
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

  document.getElementById("chatAvatar").innerHTML = `<img src="${profile.img}" alt="${profile.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
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
document.getElementById("chatSend").addEventListener("click", sendMessage);

// Send on Enter key
document.getElementById("chatInput").addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

// Close button
document.getElementById("chatClose").addEventListener("click", closeChatModal);

// Click outside to close
document.getElementById("chatModal").addEventListener("click", e => {
  if (e.target === document.getElementById("chatModal")) closeChatModal();
});

// Call/video from inside chat
document.getElementById("chatCallBtn").addEventListener("click", () => {
  if (chatProfile) { closeChatModal(); openCallModal(chatProfile, "audio"); }
});
document.getElementById("chatVideoBtn").addEventListener("click", () => {
  if (chatProfile) { closeChatModal(); openCallModal(chatProfile, "video"); }
});

// Emoji picker toggle
document.getElementById("chatEmojiToggle").addEventListener("click", e => {
  e.stopPropagation();
  const picker = document.getElementById("emojiPicker");
  picker.style.display = picker.style.display === "none" ? "grid" : "none";
});

document.getElementById("emojiPicker").addEventListener("click", e => {
  if (e.target.tagName === "SPAN") {
    const input = document.getElementById("chatInput");
    input.value += e.target.textContent;
    input.focus();
    document.getElementById("emojiPicker").style.display = "none";
  }
});

document.addEventListener("click", e => {
  const picker = document.getElementById("emojiPicker");
  if (!picker.contains(e.target) && e.target.id !== "chatEmojiToggle") {
    picker.style.display = "none";
  }
});

/* ===========================
   HAMBURGER MENU
   =========================== */
document.getElementById("hamburger").addEventListener("click", () => {
  document.getElementById("nav").classList.toggle("open");
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
   ONLINE COUNT ANIMATION
   =========================== */
function animateOnlineCount() {
  const el = document.getElementById("onlineCount");
  let base = 2847;
  setInterval(() => {
    const delta = Math.floor(Math.random() * 20) - 9;
    base = Math.max(2000, Math.min(3500, base + delta));
    el.textContent = base.toLocaleString();
  }, 3000);
}

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
  animateOnlineCount();
  initScrollReveal();
});
