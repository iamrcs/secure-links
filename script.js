const $out = document.getElementById("output");

// --- Config ---
const FILE_KEYS = ["name", "size", "desc", "mg", "gd", "tg"];

// --- Utility functions ---
const b64decode = (value) => {
  if (!value) return "";
  try {
    const s = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = s.padEnd(Math.ceil(s.length / 4) * 4, "=");
    return decodeURIComponent(
      Array.from(atob(padded), (c) =>
        `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`
      ).join("")
    );
  } catch {
    return value; // fallback raw
  }
};

const createEl = (tag, text, className) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  return el;
};

const appendInfo = (container, label, value, addBreak = false) => {
  const dt = createEl("dt", label);
  const dd = createEl("dd", value || "N/A");
  container.append(dt, dd);
  if (addBreak) container.appendChild(document.createElement("br"));
};

const makeLink = (href, text, cls) => {
  try {
    const url = new URL(href, window.location.origin);
    const a = createEl("a", text, cls);
    a.href = url.href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  } catch {
    return createEl("span", "Invalid link", "invalid");
  }
};

const clearPermalink = () => {
  try {
    const plainUrl = window.location.origin + window.location.pathname;
    window.history.replaceState(null, document.title, plainUrl);
  } catch {
    /* ignore */
  }
};

// --- Rendering ---
const renderFile = (file) => {
  $out.textContent = "";
  const frag = document.createDocumentFragment();

  const info = createEl("dl", null, "file-info");
  appendInfo(info, "Name: ", file.name, true);        // add <br>
  appendInfo(info, "Size: ", file.size, true);        // add <br>
  appendInfo(info, "Description: ", file.desc);       // no <br>
  frag.appendChild(info);

  const links = createEl("div", null, "links");
  if (file.mg)
    links.appendChild(
      makeLink(`https://mega.nz/file/${file.mg}`, "⬇ Download via Mega", "mega")
    );
  if (file.gd)
    links.appendChild(
      makeLink(
        `https://drive.google.com/uc?export=download&id=${file.gd}`,
        "⬇ Google Drive",
        "gdrive"
      )
    );
  if (file.tg)
    links.appendChild(
      makeLink(
        `https://t.me/ASFileStore2_Bot?start=${file.tg}`,
        "⬇ Telegram",
        "telegram"
      )
    );

  if (links.children.length) frag.appendChild(links);

  $out.appendChild(frag);
  clearPermalink();
};

const renderError = (msg) => {
  $out.textContent = "";
  $out.appendChild(createEl("p", msg, "error"));
  clearPermalink();
};

const renderLoading = () => {
  $out.textContent = "";
  $out.appendChild(createEl("p", "Loading...", "loading"));
};

// --- Main logic ---
(async function main() {
  const params = new URLSearchParams(window.location.search);
  const mapNumber =
    [...params.keys()].find((k) => /^\d+$/.test(k)) || "1";

  // Inline overrides
  if (FILE_KEYS.some((k) => params.has(k))) {
    const file = Object.fromEntries(
      FILE_KEYS.map((k) => [k, b64decode(params.get(k))])
    );
    renderFile(file);
    return;
  }

  // Fallback: JSON mapping
  const fileId = params.get("id");
  if (!fileId) {
    renderError("No file ID provided.");
    return;
  }

  renderLoading();

  try {
    const res = await fetch(`map-${mapNumber}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error("JSON file not found");
    const data = await res.json();
    const file = data?.[fileId];
    file ? renderFile(file) : renderError("File not found.");
  } catch (err) {
    console.error("Fetch error:", err);
    renderError("Error loading file data.");
  }
})();
