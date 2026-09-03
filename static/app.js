// 配置
const REGIONS = [
  { code: "dl", label: "大陆" },
  { code: "gt", label: "港台" },
  { code: "rh", label: "日韩" },
  { code: "om", label: "欧美" },
  { code: "qt", label: "其他" },
];
const PER_PAGE = 12;

// 状态
let currentRegion = REGIONS[0].code;
let currentPage = 1;
let allMovies = [];

// DOM
const regionTabs = document.getElementById("regionTabs");
const movieGrid = document.getElementById("movieGrid");
const pagination = document.getElementById("pagination");
const modalOverlay = document.getElementById("modalOverlay");
const modalBody = document.getElementById("modalBody");

// 初始化地区标签
function initTabs() {
  regionTabs.innerHTML = REGIONS.map(
    (r) =>
      `<button class="region-tab ${r.code === currentRegion ? "active" : ""}" data-code="${r.code}">${r.label}</button>`,
  ).join("");

  regionTabs.querySelectorAll(".region-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      currentRegion = tab.dataset.code;
      currentPage = 1;
      initTabs();
      loadMovies();
    });
  });
}

// 加载 JSON 数据
async function loadMovies() {
  try {
    const res = await fetch(`data/${currentRegion}.json`);
    allMovies = await res.json();
    renderGrid();
    renderPagination();
  } catch (e) {
    movieGrid.innerHTML = '<p style="padding:20px;color:#666;">加载失败</p>';
  }
}

// 渲染电影列表
function renderGrid() {
  const start = (currentPage - 1) * PER_PAGE;
  const pageMovies = allMovies.slice(start, start + PER_PAGE);

  movieGrid.innerHTML = pageMovies
    .map(
      (m, i) =>
        `<div class="movie-card" data-index="${start + i}">
      <img src="${m.cover}" alt="${m.name}" loading="lazy">
      <div class="info">
        <div class="name">${m.name}</div>
        <div class="meta">${m.year} · ${m.region}</div>
      </div>
    </div>`,
    )
    .join("");

  movieGrid.querySelectorAll(".movie-card").forEach((card) => {
    card.addEventListener("click", () => {
      showModal(allMovies[card.dataset.index]);
    });
  });
}

// 渲染分页
function renderPagination() {
  const total = Math.ceil(allMovies.length / PER_PAGE);
  if (total <= 1) {
    pagination.innerHTML = "";
    return;
  }

  let html = `<button class="page-btn" ${currentPage === 1 ? "disabled" : ""} data-page="${currentPage - 1}">&lsaquo;</button>`;

  for (let i = 1; i <= total; i++) {
    html += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
  }

  html += `<button class="page-btn" ${currentPage === total ? "disabled" : ""} data-page="${currentPage + 1}">&rsaquo;</button>`;

  pagination.innerHTML = html;

  pagination.querySelectorAll(".page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      currentPage = parseInt(btn.dataset.page);
      renderGrid();
      renderPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

// 弹窗详情
function showModal(movie) {
  modalBody.innerHTML = `
    <img src="${movie.cover}" alt="${movie.name}">
    <h2>${movie.name}</h2>
    <div class="detail-row">
      <span class="detail-label">年代</span>
      <span class="detail-value">${movie.year}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">地区</span>
      <span class="detail-value">${movie.region}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">精彩时间</span>
      <span class="detail-value">${movie.highlight}</span>
    </div>
    <a class="magnet-link" href="${movie.magnet}" target="_blank">🧲 磁力链接</a>
  `;
  modalOverlay.classList.add("show");
}

// 关闭弹窗
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) modalOverlay.classList.remove("show");
});

// 启动
initTabs();
loadMovies();
