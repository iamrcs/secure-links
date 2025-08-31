const $out = document.getElementById("output");

// Base64 decoder (supports URL-safe Base64 & UTF-8)
function b64decode(value) {
  if (value == null) return "";
  try {
    let s = value.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4 !== 0) s += "=";
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    const dec = new TextDecoder("utf-8", { fatal: false });
    return dec.decode(bytes);
  } catch {
    return value; // fallback raw
  }
}

function createEl(tag, text, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  return el;
}

// ✅ Clean URL + Clear old query from history
function clearPermalink() {
  try {
    const plainUrl = window.location.origin + window.location.pathname;

    // Replace current entry with clean URL
    window.history.replaceState({}, document.title, plainUrl);

    // Overwrite back entry (so no query remains in history)
    setTimeout(() => {
      window.history.pushState({}, document.title, plainUrl);
      window.history.replaceState({}, document.title, plainUrl);
    }, 100);
  } catch { }
}

function renderFile(file) {
  $out.innerHTML = "";

  const info = createEl("div", null, "file-info");

  const p1 = document.createElement("p");
  p1.appendChild(createEl("strong", "Name: "));
  p1.append(document.createTextNode(file.name || "N/A"));
  info.appendChild(p1);

  const p2 = document.createElement("p");
  p2.appendChild(createEl("strong", "Size: "));
  p2.append(document.createTextNode(file.size || "N/A"));
  info.appendChild(p2);

  const p3 = document.createElement("p");
  p3.appendChild(createEl("strong", "Description: "));
  p3.append(document.createTextNode(file.desc || "N/A"));
  info.appendChild(p3);

  $out.appendChild(info);

  const links = createEl("div", null, "links");

  if (file.mg) {
    const a = createEl("a", "⬇ Download via Mega", "mega");
    a.href = `https://mega.nz/file/${file.mg}`;
    a.target = "_blank";
    links.appendChild(a);
  }
  if (file.gd) {
    const a = createEl("a", "⬇ Google Drive", "gdrive");
    a.href = `https://drive.google.com/uc?export=download&id=${file.gd}`;
    a.target = "_blank";
    links.appendChild(a);
  }
  if (file.tg) {
    const a = createEl("a", "⬇ Telegram", "telegram");
    a.href = `https://t.me/reportcloudstorage_bot?start=${file.tg}`;
    a.target = "_blank";
    links.appendChild(a);
  }

  if (links.children.length) $out.appendChild(links);

  // Clear permalink & history
  clearPermalink();
}

function renderError(msg) {
  $out.innerHTML = `<p class="error">${msg}</p>`;
  clearPermalink();
}

// --- Main logic ---
const params = new URLSearchParams(window.location.search);

// Support selecting map file by a numeric query key like ?2
const mapNumber = [...params.keys()].find(k => /^\d+$/.test(k)) || "1";

// Check for Base64 override params
const hasOverride =
  params.has("name") ||
  params.has("size") ||
  params.has("desc") ||
  params.has("mg") ||
  params.has("gd") ||
  params.has("tg");

if (hasOverride) {
  const overrideFile = {
    name: b64decode(params.get("name")),
    size: b64decode(params.get("size")),
    desc: b64decode(params.get("desc")),
    mg: b64decode(params.get("mg")),
    gd: b64decode(params.get("gd")),
    tg: b64decode(params.get("tg")),
  };
  renderFile(overrideFile);
} else {
  const fileId = params.get("id");
  if (!fileId) {
    renderError("No file ID provided.");
  } else {
    const mapFile = `map-${mapNumber}.json`;
    fetch(mapFile, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("JSON file not found");
        return res.json();
      })
      .then(data => {
        const file = data[fileId];
        if (!file) {
          renderError("File not found.");
          return;
        }
        renderFile(file);
      })
      .catch(err => {
        renderError(`Error: ${err.message}`);
      });
  }
}