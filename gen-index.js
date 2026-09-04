const fs = require('fs');
const path = require('path');
const baseDir = '.';

const batches = fs.readdirSync(baseDir).filter(f => {
    const fp = path.join(baseDir, f);
    return fs.statSync(fp).isDirectory() && !f.startsWith('_') && !f.startsWith('.') && f !== 'node_modules' && fs.existsSync(path.join(fp, 'viewer', 'index.html'));
}).sort();

const cards = batches.map(b => {
    const slug = encodeURIComponent(b);
    return '<a href="./' + slug + '/viewer/index.html" class="card"><span class="name">' + b + '</span><span class="arrow">→</span></a>';
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KGS All Courses</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0f;color:#e2e8f0;min-height:100vh}
.hero{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:60px 20px;text-align:center;border-bottom:1px solid #1e2a3a}
.hero h1{font-size:2.5rem;font-weight:700;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:12px}
.hero p{color:#94a3b8;font-size:1.1rem}
.search-wrap{max-width:600px;margin:32px auto 0;position:relative}
.search-wrap input{width:100%;padding:14px 20px;background:#1e2a3a;border:1px solid #2d3a4a;border-radius:12px;color:#e2e8f0;font-size:1rem;outline:none}
.search-wrap input:focus{border-color:#667eea}
.count{text-align:center;padding:24px;color:#64748b;font-size:.9rem}
.grid{max-width:1400px;margin:0 auto;padding:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
.card{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;background:#111827;border:1px solid #1f2937;border-radius:12px;text-decoration:none;color:#e2e8f0;transition:all .2s}
.card:hover{background:#1e2a3a;border-color:#667eea;transform:translateY(-2px);box-shadow:0 8px 24px rgba(102,126,234,.15)}
.name{font-size:.88rem;font-weight:500;line-height:1.4}
.arrow{color:#667eea;font-size:1.2rem;flex-shrink:0;margin-left:12px}
</style>
</head>
<body>
<div class="hero">
<h1>📚 KGS All Courses</h1>
<p>Browse all available batch course viewers</p>
<div class="search-wrap">
<input type="text" id="search" placeholder="Search batches...">
</div>
</div>
<div class="count" id="count">BATCH_COUNT batches available</div>
<div class="grid" id="grid">
CARDS_PLACEHOLDER
</div>
<script>
const input = document.getElementById('search');
const allCards = document.querySelectorAll('.card');
const count = document.getElementById('count');
input.addEventListener('input', function() {
    const q = input.value.toLowerCase();
    let visible = 0;
    allCards.forEach(function(c) {
        const show = c.querySelector('.name').textContent.toLowerCase().includes(q);
        c.style.display = show ? '' : 'none';
        if(show) visible++;
    });
    count.textContent = visible + ' batches found';
});
</script>
</body>
</html>`;

const finalHtml = html.replace('BATCH_COUNT', batches.length).replace('CARDS_PLACEHOLDER', cards);
fs.writeFileSync('index.html', finalHtml);
console.log('index.html created with ' + batches.length + ' batches');
