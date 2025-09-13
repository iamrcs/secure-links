function encodeBase64(str = "") {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return "";
  }
}

async function shortenUrl(longUrl, customSlug = "") {
  try {
    const response = await fetch("https://iiuo.org/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: longUrl, slug: customSlug })
    });

    const data = await response.json();
    if (data.ok && data.short_url) {
      return data.short_url;
    } else {
      throw new Error(data.error || "Unknown error while shortening");
    }
  } catch (err) {
    console.error("Shortening failed:", err);
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("generateForm");
  const outputSection = document.getElementById("outputSection");
  const output = document.getElementById("output");
  const copyBtn = document.getElementById("copyBtn");
  const openBtn = document.getElementById("openBtn");
  const clearBtn = document.getElementById("clearBtn");

  const baseUrl = "http://sl.itisuniqueofficial.com";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Build encoded long URL
    const fields = ["name", "size", "desc", "mg", "gd", "tg"];
    const params = fields
      .map((id) => `${id}=${encodeBase64(document.getElementById(id).value.trim())}`)
      .join("&");

    const longUrl = `${baseUrl}/?${params}`;

    // Send to iiuo.org shortener
    const shortUrl = await shortenUrl(longUrl);

    // Show short URL if success
    if (shortUrl) {
      output.value = shortUrl;
      openBtn.href = shortUrl;
    } else {
      output.value = "Error: Could not shorten URL.";
      openBtn.removeAttribute("href");
    }

    outputSection.style.display = "block";
    output.focus();
    output.select();
  });

  copyBtn.addEventListener("click", async () => {
    const val = output.value.trim();
    if (!val) return;

    try {
      await navigator.clipboard.writeText(val);
      const prevText = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = prevText), 1200);
    } catch {
      output.select();
      document.execCommand("copy");
    }
  });

  clearBtn.addEventListener("click", () => {
    form.reset();
    output.value = "";
    outputSection.style.display = "none";
    openBtn.removeAttribute("href");
  });

  output.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && output.value) {
      window.open(output.value, "_blank");
    }
  });
});
