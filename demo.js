/* =========================================================
  [0] DATA
========================================================= */
const PRODUCTS = [
  { id: "sp1",  name: "Tai nghe Bluetooth Mini", price: 189000,  desc: "...", tag: "Hot",  cat: "audio",     img: "img/taingheblutooth.jpg" },
  { id: "sp2",  name: "Bàn phím cơ AULA f75",      price: 499000,  desc: "...", tag: "New",  cat: "accessory", img: "img/banphim.jpg" },
  { id: "sp3",  name: "Chuột không dây Silent",   price: 129000,  desc: "...", tag: "Best", cat: "accessory", img: "img/chuotkhongday.jpg" },
  { id: "sp4",  name: "USB 64GB",                 price:  99000,  desc: "...", tag: "Sale", cat: "accessory", img: "img/usb.jpg" },
  { id: "sp5",  name: "Stand laptop nhôm",        price: 159000,  desc: "...", tag: "Work", cat: "laptop",    img: "img/stand.jpg" },

  { id: "sp7",  name: "iPhone 13 128GB",          price: 10990000, desc: "Mượt, camera đẹp, pin ổn. Phù hợp dùng lâu dài.", tag: "Hot", cat: "phone", img: "img/ip13.jpg" },
  { id: "sp8",  name: "Samsung Galaxy A55 5G",    price:  8990000, desc: "Màn đẹp, hiệu năng ổn, hỗ trợ 5G, pin trâu.",    tag: "Hot", cat: "phone", img: "img/samnsunga55.jpg" },
  { id: "sp9",  name: "Xiaomi Redmi Note 13",     price:  4990000, desc: "Giá tốt, màn 120Hz, sạc nhanh, dùng học tập ok.", tag: "New", cat: "phone", img: "img/redmi.jpg" },
  { id: "sp10", name: "OPPO Reno 11F",            price:  7990000, desc: "Thiết kế đẹp, chụp chân dung ổn, sạc nhanh.",     tag: "New", cat: "phone", img: "img/opporeno11f.jpg" },

  { id: "sp11", name: "Apple Watch Series 9",  price: 9990000, desc: "Theo dõi sức khỏe, thông báo nhanh, dây đeo thoải mái.", cat: "watch", img: "img/applewatch.jpg" },
  { id: "sp12", name: "Camera an ninh WiFi 2K", price:  690000, desc: "Xem đêm rõ, xoay 360°, đàm thoại 2 chiều, lưu cloud/thẻ nhớ.", cat: "watch", img: "img/camera.jpg" },
  { id: "sp13", name: "PC Gaming i5 / RTX", price: 18990000, desc: "Chơi game mượt, tản ổn, nâng cấp dễ.", cat: "pc", img: "img/pc.jpg" },
  { id: "sp14", name: "Màn hình 4k 165Hz", price: 3290000,  desc: "Màu đẹp, 165Hz mượt, phù hợp học và game.", cat: "pc", img: "img/manhinh.jpg" },
];

const CAT_LABELS = {
  phone: "Điện thoại",
  laptop: "Laptop",
  audio: "Âm thanh",
  watch: "Đồng hồ / Camera",
  accessory: "Phụ kiện",
  pc: "PC , Màn hình",
  promo: "Khuyến mãi",
  news: "Tin công nghệ",
};

let activeCat = null;

/* =========================================================
  [1] HELPERS
========================================================= */
const $ = (s, root = document) => root.querySelector(s);
const fmtVND = (n) => new Intl.NumberFormat("vi-VN").format(n) + " đ";

function toast(msg){
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove("show"), 1800);
}

/* =========================================================
  [2] CART
========================================================= */
const CART_KEY = "minishop_cart_v2";

function loadCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
  catch { return {}; }
}
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function cartCount(cart){
  return Object.values(cart).reduce((s,it)=>s + (it.qty||0), 0);
}
function cartTotal(cart){
  return Object.values(cart).reduce((s,it)=>s + (it.qty||0)*(it.price||0), 0);
}

function addToCart(id, qty){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;

  const cart = loadCart();
  if(!cart[id]) cart[id] = { id, name:p.name, price:p.price, qty:0 };
  cart[id].qty += qty;

  if(cart[id].qty <= 0) delete cart[id];
  saveCart(cart);
  refreshCartUI();
}

function clearCart(){
  saveCart({});
  refreshCartUI();
  toast("Đã xóa giỏ hàng!");
}

function refreshCartUI(){
  const cart = loadCart();
  const count = cartCount(cart);
  const total = cartTotal(cart);

  $("#cartCount") && ($("#cartCount").textContent = String(count));
  $("#statItems") && ($("#statItems").textContent = String(count));
  $("#statTotal") && ($("#statTotal").textContent = fmtVND(total));
  $("#cartSubtotal") && ($("#cartSubtotal").textContent = fmtVND(total));

  const listEl = $("#cartList");
  if(!listEl) return;
  listEl.innerHTML = "";

  const items = Object.values(cart);
  if(items.length === 0){
    listEl.innerHTML = `<div class="muted">Giỏ hàng đang trống.</div>`;
    return;
  }

  items.forEach(it=>{
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-left">
        <div class="cart-name">${it.name}</div>
        <div class="cart-sub">${fmtVND(it.price)}</div>
      </div>
      <div class="cart-right">
        <div class="cart-qty">
          <button type="button" data-minus="${it.id}">−</button>
          <strong>${it.qty}</strong>
          <button type="button" data-plus="${it.id}">+</button>
        </div>
        <button type="button" class="icon-btn cart-remove" data-remove="${it.id}" title="Xóa">✕</button>
      </div>
    `;
    listEl.appendChild(row);
  });
}

/* =========================================================
  [3] LOGIN SESSION
========================================================= */
const SESSION_KEY = "minishop_session_v1";

function loadSession(){
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
  catch { return null; }
}
function saveSession(sess){ localStorage.setItem(SESSION_KEY, JSON.stringify(sess)); }
function clearSession(){ localStorage.removeItem(SESSION_KEY); }

function setLoginButtonUI(){
  const btn = $("#btnLogin");
  if(!btn) return;
  const sess = loadSession();
  if(sess?.name){
    btn.innerHTML = `Xin chào, ${sess.name} 👤`;
    btn.dataset.logged = "1";
  }else{
    btn.innerHTML = `Đăng nhập 👤`;
    btn.dataset.logged = "0";
  }
}

/* =========================================================
  [4] PRODUCTS
========================================================= */
function renderProducts(list){
  const grid = $("#productGrid");
  if(!grid) return;
  grid.innerHTML = "";

  list.forEach(p=>{
    const el = document.createElement("article");
    el.className = "product";
    el.innerHTML = `
      <div class="thumb-wrap">
        <img class="product-thumb" src="${p.img}" alt="${p.name}" loading="lazy">
        <span class="tag tag-on-thumb">${p.tag || "SP"}</span>
      </div>

      <h3>${p.name}</h3>
      <p>${p.desc}</p>

      <div class="product-bottom">
        <div class="price">${fmtVND(p.price)}</div>
        <div class="product-actions">
          <button class="btn btn-outline" type="button" data-view="${p.id}">Xem</button>
          <button class="btn btn-primary" type="button" data-add="${p.id}">Thêm giỏ</button>
        </div>
      </div>
    `;
    grid.appendChild(el);
  });
}

function applyFilterSort(){
  const q = ($("#searchInput")?.value || "").trim().toLowerCase();
  const sort = $("#sortSelect")?.value || "default";
  let list = [...PRODUCTS];

  const title = $("#productsTitle");
  if(activeCat){
    list = list.filter(p=>p.cat === activeCat);
    title && (title.textContent = `Sản phẩm / ${CAT_LABELS[activeCat] || activeCat}`);
  }else{
    list = list.filter(p=>p.tag === "Hot" || p.tag === "New");
    title && (title.textContent = "Sản phẩm nổi bật");
  }

  if(q){
    list = list.filter(p => (p.name + " " + p.desc).toLowerCase().includes(q));
  }

  if(sort === "price-asc") list.sort((a,b)=>a.price-b.price);
  if(sort === "price-desc") list.sort((a,b)=>b.price-a.price);
  if(sort === "name-asc") list.sort((a,b)=>a.name.localeCompare(b.name,"vi"));
  if(sort === "name-desc") list.sort((a,b)=>b.name.localeCompare(a.name,"vi"));

  renderProducts(list);
}

/* =========================================================
  [5] MODAL
========================================================= */
let currentProductId = null;

function openModal(id){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;

  currentProductId = id;

  $("#modalTitle").textContent = p.name;
  $("#modalPrice").textContent = fmtVND(p.price);
  $("#modalDesc").textContent = p.desc;

  // ✅ SET ẢNH CHO MODAL
  const img = $("#modalImg");
  if (img) {
    img.src = p.img || "";
    img.alt = p.name || "Sản phẩm";
  }

  $("#qtyInput").value = "1";
  $("#modalHint").textContent = `Mã SP: ${p.id} • Tag: ${p.tag || "SP"}`;

  const modal = $("#productModal");
  modal.classList.add("show");
  modal.setAttribute("aria-hidden","false");
}
function closeModal(){
  const modal = $("#productModal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden","true");
}

/* =========================================================
  [6] CART DRAWER
========================================================= */
function openCart(){
  const d = $("#cartDrawer");
  d.classList.add("show");
  d.setAttribute("aria-hidden","false");
}
function closeCart(){
  const d = $("#cartDrawer");
  d.classList.remove("show");
  d.setAttribute("aria-hidden","true");
}

/* =========================================================
  [7] CATEGORY PANEL
========================================================= */
function setupCategoryPanel(){
  const btn = $("#btnCategory");
  const panel = $("#categoryPanel");
  if(!btn || !panel) return;

  const close = ()=>{
    panel.style.display = "none";
    panel.setAttribute("aria-hidden","true");
    btn.setAttribute("aria-expanded","false");
  };
  const open = ()=>{
    panel.style.display = "block";
    panel.setAttribute("aria-hidden","false");
    btn.setAttribute("aria-expanded","true");
  };
  const toggle = ()=> (panel.style.display==="block" ? close() : open());

  btn.addEventListener("click",(e)=>{ e.stopPropagation(); toggle(); });

  document.addEventListener("click",(e)=>{
    if(!panel.contains(e.target) && !btn.contains(e.target)) close();
  });
}

/* =========================================================
  [8] AUTH WRAP (IFRAME)
========================================================= */
function setupAuthWrap(){
  const wrap = $("#authWrap");
  const btn = $("#btnLogin");
  if(!wrap || !btn) return;

  const open = ()=>{
    $("#authFrame").src = "login.html";
    wrap.classList.add("show");
    wrap.setAttribute("aria-hidden","false");
  };
  const close = ()=>{
    wrap.classList.remove("show");
    wrap.setAttribute("aria-hidden","true");
  };

  btn.addEventListener("click",()=>{
    if(btn.dataset.logged === "1"){
      const ok = confirm("Bạn muốn đăng xuất không?");
      if(ok){
        clearSession();
        setLoginButtonUI();
        toast("Đã đăng xuất!");
      }
      return;
    }
    open();
  });

  wrap.addEventListener("click",(e)=>{
    if(e.target.matches("[data-authwrap-close]")) close();
  });

  window.addEventListener("message",(e)=>{
    const data = e.data;
    if(!data || typeof data !== "object") return;

    if(data.type === "AUTH_CLOSE") close();

    if(data.type === "AUTH_SUCCESS"){
      const name = data?.payload?.name || "bạn";
      saveSession({ name, user: data?.payload?.user || "" });
      setLoginButtonUI();
      close();
      toast(`Xin chào, ${name}!`);
    }
  });

  document.addEventListener("keydown",(e)=>{
    if(e.key !== "Escape") return;
    close();
    closeModal();
    closeCart();
  });
}

/* =========================================================
  [9] SCROLL: CHỈ HIỆN ROW 2
========================================================= */
function setupScrollCompactHeader(){
  const topbar = $("#topbar");
  if(!topbar) return;

  const onScroll = ()=>{
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    topbar.classList.toggle("compact", y > 40);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive:true });
}

/* =========================================================
  [10] EVENTS
========================================================= */
function setupEvents(){
  $("#searchInput")?.addEventListener("input", applyFilterSort);
  $("#sortSelect")?.addEventListener("change", applyFilterSort);

  $("#contactForm")?.addEventListener("submit",(e)=>{
    e.preventDefault();
    toast("Đã gửi liên hệ!");
    e.target.reset();
  });

  $("#btnClearCart")?.addEventListener("click", clearCart);
  $("#btnClearCart2")?.addEventListener("click", clearCart);
  $("#btnCheckout")?.addEventListener("click", ()=> toast("Demo thôi nha 😄"));

  $("#qtyMinus")?.addEventListener("click", ()=>{
    const input = $("#qtyInput");
    input.value = String(Math.max(1, Number(input.value || 1) - 1));
  });
  $("#qtyPlus")?.addEventListener("click", ()=>{
    const input = $("#qtyInput");
    input.value = String(Math.max(1, Number(input.value || 1) + 1));
  });

  $("#modalAddToCart")?.addEventListener("click", ()=>{
    const qty = Math.max(1, Number($("#qtyInput").value || 1));
    if(!currentProductId) return;
    addToCart(currentProductId, qty);
    toast(`Đã thêm ${qty} sản phẩm!`);
    closeModal();
  });

  // CLICK DELEGATION (gọn)
  document.addEventListener("click",(e)=>{
    const t = e.target;

    // mở giỏ: hỗ trợ cả btnCart và btnOpenCart (đỡ lỗi)
    if(t.closest?.("#btnCart, #btnOpenCart")) openCart();

    if(t.matches("[data-close='cart']")) closeCart();
    if(t.matches("[data-close='modal']")) closeModal();

    const catLink = t.closest?.(".cat-item[data-cat]");
    if(catLink){
      activeCat = catLink.dataset.cat || null;
      applyFilterSort();
      const panel = $("#categoryPanel");
      if(panel) panel.style.display = "none";
      return;
    }

    if(t.matches("[data-view]")) openModal(t.dataset.view);

    if(t.matches("[data-add]")){
      addToCart(t.dataset.add, 1);
      toast("Đã thêm vào giỏ!");
    }

    // cart minus/plus/remove
    if(t.matches("[data-minus]")){
      const id = t.dataset.minus;
      const cart = loadCart();
      if(!cart[id]) return;
      cart[id].qty -= 1;
      if(cart[id].qty <= 0) delete cart[id];
      saveCart(cart);
      refreshCartUI();
    }
    if(t.matches("[data-plus]")){
      addToCart(t.dataset.plus, 1);
    }
    if(t.matches("[data-remove]")){
      const id = t.dataset.remove;
      const cart = loadCart();
      delete cart[id];
      saveCart(cart);
      refreshCartUI();
    }
  });
}

/* =========================================================
  [11] INIT
========================================================= */
(function init(){
  $("#year") && ($("#year").textContent = String(new Date().getFullYear()));
  setupCategoryPanel();
  setupAuthWrap();
  setupScrollCompactHeader();

  setLoginButtonUI();
  refreshCartUI();
  applyFilterSort();
  setupEvents();
})();