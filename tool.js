function encodeBase64(str) { try { return btoa(unescape(encodeURIComponent(str || ''))); } catch (e) { return '' } }

const form = document.getElementById('generateForm');
const outputSection = document.getElementById('outputSection');
const output = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const openBtn = document.getElementById('openBtn');
const clearBtn = document.getElementById('clearBtn');

form.addEventListener('submit', function (e) {
    e.preventDefault();

    const baseUrl = 'http://sl.itisuniqueofficial.com';
    const name = encodeBase64(document.getElementById('name').value.trim());
    const size = encodeBase64(document.getElementById('size').value.trim());
    const desc = encodeBase64(document.getElementById('desc').value.trim());
    const mg = encodeBase64(document.getElementById('mg').value.trim());
    const gd = encodeBase64(document.getElementById('gd').value.trim());
    const tg = encodeBase64(document.getElementById('tg').value.trim());

    const url = `${baseUrl}/?name=${name}&size=${size}&desc=${desc}&mg=${mg}&gd=${gd}&tg=${tg}`;

    output.value = url;
    openBtn.href = url;
    outputSection.style.display = 'block';
    output.focus();
    output.select();
});

copyBtn.addEventListener('click', async function () {
    const val = output.value || '';
    if (!val) return;
    try {
        await navigator.clipboard.writeText(val);
        const prev = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = prev, 1200);
    } catch (err) {
        output.select();
        try { document.execCommand('copy'); } catch (e) { }
    }
});

clearBtn.addEventListener('click', function () {
    form.reset();
    output.value = '';
    outputSection.style.display = 'none';
});

output.addEventListener('keydown', function (e) { if (e.key === 'Enter') { window.open(output.value, '_blank'); } });