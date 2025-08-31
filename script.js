const $out = document.getElementById("output");

// --- Utility functions ---
function b64decode(value) {
  if (!value) return "";
  try {
    let s = value.replace(/-/g, "+").replace(/_/g, "/");
    s = s.padEnd(s.length + (4 - (s.length % 4)) % 4, "=");
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    return new TextDecoder("utf-8").decode(bytes);
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

function appendInfo(container, label, value) {
  const p = document.createElement("p");
  p.appendChild(createEl("strong", label));
  p.append(document.createTextNode(value || "N/A"));
  container.appendChild(p);
}

function makeLink(href, text, cls) {
  const a = createEl("a", text, cls);
  a.href = href;
  a.target = "_blank";
  return a;
}

function clearPermalink() {
  try {
    const plainUrl = window.location.origin + window.location.pathname;
    window.history.replaceState(null, document.title, plainUrl);

    // Overwrite back entry (for cleaner history navigation)
    setTimeout(() => {
      window.history.pushState(null, document.title, plainUrl);
      window.history.replaceState(null, document.title, plainUrl);
    }, 50);
  } catch { /* ignore */ }
}

// --- Rendering ---
function renderFile(file) {
  $out.textContent = "";

  const info = createEl("div", null, "file-info");
  appendInfo(info, "Name: ", file.name);
  appendInfo(info, "Size: ", file.size);
  appendInfo(info, "Description: ", file.desc);
  $out.appendChild(info);

  const links = createEl("div", null, "links");
  if (file.mg) links.appendChild(makeLink(`https://mega.nz/file/${file.mg}`, "⬇ Download via Mega", "mega"));
  if (file.gd) links.appendChild(makeLink(`https://drive.google.com/uc?export=download&id=${file.gd}`, "⬇ Google Drive", "gdrive"));
  if (file.tg) links.appendChild(makeLink(`https://t.me/reportcloudstorage_bot?start=${file.tg}`, "⬇ Telegram", "telegram"));

  if (links.children.length) $out.appendChild(links);

  clearPermalink();
}

function renderError(msg) {
  $out.textContent = "";
  $out.appendChild(createEl("p", msg, "error"));
  clearPermalink();
}

// --- Main logic ---
(function main() {
  const params = new URLSearchParams(window.location.search);

  const mapNumber = [...params.keys()].find(k => /^\d+$/.test(k)) || "1";

  const hasOverride = ["name", "size", "desc", "mg", "gd", "tg"].some(k => params.has(k));

  if (hasOverride) {
    const file = {};
    ["name", "size", "desc", "mg", "gd", "tg"].forEach(k => file[k] = b64decode(params.get(k)));
    renderFile(file);
    return;
  }

  const fileId = params.get("id");
  if (!fileId) {
    renderError("No file ID provided.");
    return;
  }

  const mapFile = `map-${mapNumber}.json`;

  fetch(mapFile, { cache: "no-store" })
    .then(res => {
      if (!res.ok) throw new Error("JSON file not found");
      return res.json();
    })
    .then(data => {
      const file = data?.[fileId];
      if (!file) {
        renderError("File not found.");
        return;
      }
      renderFile(file);
    })
    .catch(err => {
      renderError(`Error: ${err.message}`);
    });
})();
