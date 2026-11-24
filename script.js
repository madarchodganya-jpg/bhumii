/* ========= EDIT THESE TWO THINGS ========= */

// 1) MUSIC: paste the YouTube video ID of the song.
//    For https://www.youtube.com/watch?v=ABC123xyz00  the ID is  ABC123xyz00
//    If left empty, the music button opens a YouTube search for the song instead.
const YOUTUBE_ID = "";

// 1b) BEST OPTION: put your own legally obtained MP3 at assets/song.mp3
//     It then plays automatically when she enters the password and taps Open.
const AUDIO_FILE = "assets/song.mp3";

// 2) PHOTOS: put images inside the assets folder, then list them here.
//    Leave src empty ("") to show a placeholder that can be tapped to upload.
const PHOTOS = [
  { src: "assets/photo1.jpg", caption: "The day I knew ❤️" },
  { src: "assets/photo2.jpg", caption: "Your smile, my favourite view" },
  { src: "assets/photo3.jpg", caption: "Our little adventures" },
  { src: "assets/photo4.jpg", caption: "Moments I keep forever" },
  { src: "assets/photo5.jpg", caption: "Just us, being us" },
  { src: "", caption: "More chapters to come…" }
];
/* ========================================= */

const $ = (id) => document.getElementById(id);

/* ---------- floating hearts ---------- */
const heartsBox = $("hearts");
function spawnHeart(x) {
  const h = document.createElement("span");
  h.className = "heart";
  h.textContent = ["❤", "💖", "💕", "✨"][Math.floor(Math.random() * 4)];
  h.style.left = (x ?? Math.random() * 100) + (x ? "px" : "vw");
  h.style.fontSize = 12 + Math.random() * 22 + "px";
  h.style.animationDuration = 6 + Math.random() * 6 + "s";
  heartsBox.appendChild(h);
  h.addEventListener("animationend", () => h.remove());
}
setInterval(() => { if (heartsBox.children.length < 25) spawnHeart(); }, 700);
function burst(n = 14) {
  for (let i = 0; i < n; i++) setTimeout(() => spawnHeart(Math.random() * innerWidth), i * 60);
}

/* ---------- music (YouTube IFrame API, starts only after a tap) ---------- */
let player = null, ready = false, wantPlay = false;
const musicBtn = $("music");
function setUI(on) {
  musicBtn.classList.toggle("on", on);
  $("musicIcon").textContent = on ? "❚❚" : "▶";
  musicBtn.setAttribute("aria-label", on ? "Pause music" : "Play music");
}
function loadYT() {
  if (!YOUTUBE_ID || window.YT) return;
  const s = document.createElement("script");
  s.src = "https://www.youtube.com/iframe_api";
  s.onerror = () => {}; // site keeps working if blocked
  document.head.appendChild(s);
}
window.onYouTubeIframeAPIReady = () => {
  player = new YT.Player("yt", {
    height: "1", width: "1", videoId: YOUTUBE_ID,
    playerVars: { playsinline: 1, loop: 1, playlist: YOUTUBE_ID },
    events: {
      onReady: () => { ready = true; if (wantPlay) player.playVideo(); },
      onStateChange: (e) => setUI(e.data === 1)
    }
  });
};
let audio = null;
if (AUDIO_FILE) {
  audio = new Audio(AUDIO_FILE); audio.loop = true; audio.preload = "auto";
  audio.addEventListener("play", () => setUI(true));
  audio.addEventListener("pause", () => setUI(false));
  audio.addEventListener("error", () => { audio = null; setUI(false); }); // file missing -> YouTube fallback
}
function toggleMusic() {
  if (audio) { audio.paused ? audio.play().catch(() => {}) : audio.pause(); return; }
  if (!YOUTUBE_ID) {
    window.open("https://www.youtube.com/results?search_query=Kesariya+Tera+Ishq+Hai+Piya", "_blank", "noopener");
    return;
  }
  if (!ready) { wantPlay = true; setUI(true); return; }
  player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
}
musicBtn.addEventListener("click", toggleMusic);

/* ---------- welcome -> main ---------- */
const pw = $("pw");
pw.addEventListener("keydown", (e) => { if (e.key === "Enter") $("openBtn").click(); });
$("openBtn").addEventListener("click", () => {
  if (pw.value.trim().toLowerCase() !== "virumi") {
    $("pwMsg").textContent = "That’s not our secret word, try again ❤️";
    pw.classList.add("shake"); setTimeout(() => pw.classList.remove("shake"), 500);
    return;
  }
  if (audio) audio.play().catch(() => {});
  loadYT(); wantPlay = !!YOUTUBE_ID; if (wantPlay) setUI(true);
  $("welcome").style.transition = "opacity .8s";
  $("welcome").style.opacity = 0;
  burst(20);
  setTimeout(() => {
    $("welcome").hidden = true;
    $("main").hidden = false;
    $("main").classList.add("fade-in");
    window.scrollTo(0, 0);
  }, 800);
});

/* ---------- card ---------- */
$("cardBtn").addEventListener("click", function () {
  this.classList.add("open");
  this.setAttribute("aria-expanded", "true");
  burst(18);
  $("moreBtn").hidden = false;
  $("moreBtn").classList.add("fade-in");
});
$("moreBtn").addEventListener("click", () => $("letter-sec").scrollIntoView({ behavior: "smooth" }));

/* ---------- letter ---------- */
$("env").addEventListener("click", function () {
  if (this.classList.contains("open")) return;
  this.classList.add("open");
  this.setAttribute("aria-expanded", "true");
  setTimeout(() => {
    $("paper").hidden = false;
    $("paper").scrollIntoView({ behavior: "smooth", block: "start" });
    document.querySelectorAll("#paper p").forEach((p, i) =>
      setTimeout(() => p.classList.add("show"), 600 + i * 1600));
    burst(10);
  }, 800);
});

/* ---------- gallery ---------- */
const grid = $("grid"), fileIn = $("fileIn");
let slots = [], pendingSlot = null;
function addSlot(p) {
  const fig = document.createElement("figure");
  fig.className = "photo";
  fig.tabIndex = 0;
  const ph = document.createElement("div"); ph.className = "ph";
  const cap = document.createElement("figcaption"); cap.textContent = p.caption;
  fig.append(ph, cap);
  const slot = { fig, ph };
  setImg(slot, p.src);
  fig.addEventListener("click", () => {
    fig.classList.add("pop"); setTimeout(() => fig.classList.remove("pop"), 600);
    if (!slot.has) { pendingSlot = slot; fileIn.multiple = false; fileIn.click(); }
  });
  slots.push(slot); grid.appendChild(fig);
}
function setImg(slot, src) {
  slot.ph.textContent = "";
  if (src) {
    const img = document.createElement("img");
    img.src = src; img.alt = "Our memory"; img.loading = "lazy";
    slot.ph.appendChild(img); slot.has = true;
  } else { slot.ph.textContent = "📷"; slot.has = false; }
}
PHOTOS.forEach(addSlot);
$("addBtn").addEventListener("click", () => { pendingSlot = null; fileIn.multiple = true; fileIn.click(); });
fileIn.addEventListener("change", () => {
  [...fileIn.files].forEach((f, i) => {
    const url = URL.createObjectURL(f);
    let slot = i === 0 && pendingSlot ? pendingSlot : slots.find((s) => !s.has);
    if (!slot) { addSlot({ src: "", caption: "Another beautiful memory ❤️" }); slot = slots[slots.length - 1]; }
    setImg(slot, url);
  });
  fileIn.value = ""; pendingSlot = null;
});
$("finalBtn").addEventListener("click", () => $("final").scrollIntoView({ behavior: "smooth" }));

/* ---------- fireworks ---------- */
const cv = $("fw"), ctx = cv.getContext("2d");
let parts = [], fwOn = false;
function size() { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; }
addEventListener("resize", size);
function explode() {
  size();
  const x = cv.width * (0.15 + Math.random() * 0.7), y = cv.height * (0.15 + Math.random() * 0.45);
  const hue = [340, 350, 20, 35, 320][Math.floor(Math.random() * 5)];
  for (let i = 0; i < 60; i++) {
    const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 4;
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, hue });
  }
}
function frame() {
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.globalCompositeOperation = "lighter";
  parts = parts.filter((p) => p.life > 0);
  parts.forEach((p) => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.life -= 0.012;
    ctx.fillStyle = `hsla(${p.hue},90%,65%,${p.life})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, 7); ctx.fill();
  });
  requestAnimationFrame(frame);
}
function startFireworks() {
  if (fwOn) return; fwOn = true; size(); frame();
  explode(); setInterval(explode, 900);
}
$("celebrate").addEventListener("click", () => { for (let i = 0; i < 4; i++) setTimeout(explode, i * 250); burst(25); });
new IntersectionObserver((e) => { if (e[0].isIntersecting) { startFireworks(); burst(25); } }, { threshold: 0.5 })
  .observe($("final"));
