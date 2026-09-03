const STORAGE_KEY = "magnet_share_recent";

const detailContent = document.getElementById("detailContent");
const emptyDetail = document.getElementById("emptyDetail");
const detailTitle = document.getElementById("detailTitle");
const detailTime = document.getElementById("detailTime");
const detailMagnet = document.getElementById("detailMagnet");
const copyBtn = document.getElementById("copyBtn");
const openBtn = document.getElementById("openBtn");
const detailTip = document.getElementById("detailTip");
const qrBox = document.getElementById("qrBox");

function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function loadRecent() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function findItem(id) {
  if (!id) return null;
  const list = loadRecent();
  return list.find((item) => item.id === id) || null;
}

async function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  document.body.removeChild(textarea);
  return ok;
}

function showTip(message, isError = false) {
  detailTip.textContent = message;
  detailTip.style.color = isError ? "var(--danger)" : "var(--muted)";
}

async function renderQR(text) {
  if (!window.QRCode || !qrBox) return;

  qrBox.innerHTML = "";

  try {
    const dataUrl = await QRCode.toDataURL(text, {
      margin: 2,
      width: 220,
      color: {
        dark: "#e6e8ef",
        light: "#0b0d12",
      },
    });

    const img = document.createElement("img");
    img.src = dataUrl;
    img.alt = "磁力链接二维码";
    qrBox.appendChild(img);
  } catch {
    qrBox.textContent = "二维码生成失败";
  }
}

function initDetail() {
  const id = getParam("id");
  const item = findItem(id);

  if (!item) {
    detailContent.style.display = "none";
    emptyDetail.style.display = "block";
    return;
  }

  detailContent.style.display = "block";
  emptyDetail.style.display = "none";

  detailTitle.textContent = item.title || "未命名磁力链接";
  detailTime.textContent = item.time || "";
  detailMagnet.textContent = item.magnet;

  copyBtn.addEventListener("click", async () => {
    const ok = await copyText(item.magnet);

    if (ok) {
      showTip("已复制磁力链接");
    } else {
      showTip("复制失败，请手动复制", true);
    }
  });

  openBtn.addEventListener("click", () => {
    window.open(item.magnet, "_self");
  });

  renderQR(item.magnet);
}

initDetail();
