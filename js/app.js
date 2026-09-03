const magnetInput = document.getElementById("magnetInput");
const titleInput = document.getElementById("titleInput");
const previewBtn = document.getElementById("previewBtn");
const shareBtn = document.getElementById("shareBtn");
const shareTip = document.getElementById("shareTip");
const recentList = document.getElementById("recentList");
const recentCount = document.getElementById("recentCount");
const emptyState = document.getElementById("emptyState");

const STORAGE_KEY = "magnet_share_recent";

function isValidMagnet(value) {
  return /^magnet:\?/i.test(value.trim());
}

function loadRecent() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveRecent(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
}

function renderRecent() {
  const list = loadRecent();
  recentList.innerHTML = "";
  recentCount.textContent = String(list.length);

  if (list.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  list.forEach((item) => {
    const li = document.createElement("li");

    const a = document.createElement("a");
    a.className = "recent-item";
    a.href = `detail.html?id=${encodeURIComponent(item.id)}`;

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = item.title || "未命名磁力链接";

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = item.time;

    a.appendChild(title);
    a.appendChild(meta);
    li.appendChild(a);
    recentList.appendChild(li);
  });
}

function buildShareText() {
  const magnet = magnetInput.value.trim();
  const title = titleInput.value.trim();

  if (!magnet) {
    return { ok: false, message: "请先粘贴磁力链接" };
  }

  if (!isValidMagnet(magnet)) {
    return { ok: false, message: "磁力链接格式不正确" };
  }

  const text = title ? `${title}\n${magnet}` : magnet;

  return { ok: true, text, magnet, title };
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

function addRecent(item) {
  const list = loadRecent();
  const filtered = list.filter((x) => x.id !== item.id);
  filtered.unshift(item);
  saveRecent(filtered);
  renderRecent();
}

previewBtn.addEventListener("click", () => {
  const result = buildShareText();

  if (!result.ok) {
    shareTip.textContent = result.message;
    shareTip.style.color = "var(--danger)";
    return;
  }

  shareTip.style.color = "var(--muted)";
  shareTip.textContent = `预览：${result.text}`;
});

shareBtn.addEventListener("click", async () => {
  const result = buildShareText();

  if (!result.ok) {
    shareTip.textContent = result.message;
    shareTip.style.color = "var(--danger)";
    return;
  }

  const ok = await copyText(result.text);

  if (ok) {
    shareTip.style.color = "var(--muted)";
    shareTip.textContent = "已复制分享内容";

    const id = Date.now().toString(36);
    addRecent({
      id,
      title: result.title,
      magnet: result.magnet,
      time: new Date().toLocaleString(),
    });
  } else {
    shareTip.style.color = "var(--danger)";
    shareTip.textContent = "复制失败，请手动复制";
  }
});

renderRecent();
