/* =========================================================
  LOGIN IFRAME
  - Đăng ký/Đăng nhập lưu localStorage (USER_KEY)
  - Đăng nhập xong postMessage về trang cha
========================================================= */

const USER_KEY = "minishop_user_v1";
const $ = (s) => document.querySelector(s);

// origin an toàn hơn (nếu không có referrer thì fallback "*")
const PARENT_ORIGIN = (() => {
  try { if (document.referrer) return new URL(document.referrer).origin; } catch {}
  return "*";
})();

function postToParent(payload) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(payload, PARENT_ORIGIN);
  }
}

function readUsers() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) || []; }
  catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USER_KEY, JSON.stringify(users));
}

// Tabs
function setTab(tab) {
  document.querySelectorAll("[data-tab]").forEach((b) => {
    const active = b.dataset.tab === tab;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-selected", active ? "true" : "false");
  });

  document.querySelectorAll("[data-pane]").forEach((p) => {
    p.style.display = p.dataset.pane === tab ? "block" : "none";
  });

  $("#authTitle").textContent = tab === "login" ? "Đăng nhập tài khoản" : "Tạo tài khoản mới";
  $("#msgLogin").textContent = "";
  $("#msgReg").textContent = "";
}

document.querySelectorAll("[data-tab]").forEach((b) => {
  b.addEventListener("click", () => setTab(b.dataset.tab));
});

// Toggle password
$("#toggleLoginPass")?.addEventListener("click", () => {
  const i = $("#loginPass");
  i.type = i.type === "password" ? "text" : "password";
});
$("#toggleRegPass")?.addEventListener("click", () => {
  const i = $("#regPass");
  i.type = i.type === "password" ? "text" : "password";
});

// Close
$("#btnClose")?.addEventListener("click", () => postToParent({ type: "AUTH_CLOSE" }));

// Register
$("#regForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = ($("#regName").value || "").trim();
  const email = ($("#regEmail").value || "").trim().toLowerCase();
  const pass = ($("#regPass").value || "").trim();

  const msg = $("#msgReg");
  if (!name || !email || !pass) { msg.textContent = "Vui lòng nhập đầy đủ."; return; }
  if (pass.length < 6) { msg.textContent = "Mật khẩu tối thiểu 6 ký tự."; return; }

  const users = readUsers();
  if (users.some(u => u.email === email)) { msg.textContent = "Email đã tồn tại."; return; }

  users.push({ name, email, pass });
  saveUsers(users);

  msg.textContent = "Đăng ký thành công! Hãy đăng nhập.";
  setTab("login");
});

// Login
$("#loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const user = ($("#loginUser").value || "").trim().toLowerCase();
  const pass = ($("#loginPass").value || "").trim();

  const msg = $("#msgLogin");
  const users = readUsers();
  const found = users.find(u => u.email === user && u.pass === pass);

  if (!found) { msg.textContent = "Sai tài khoản hoặc mật khẩu."; return; }

  msg.textContent = "Đăng nhập thành công!";
  postToParent({ type: "AUTH_SUCCESS", payload: { name: found.name, user: found.email } });
});