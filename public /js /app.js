const $ = (id) => document.getElementById(id);
let source = 'wiki';

const esc = (s = '') => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const api = async (path) => {
  const res = await fetch(path);
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error || 'Something went wrong.');
  return json;
};

async function doSearch(q) {
  $('results').innerHTML = '';
  $('status').innerHTML = '<div class="spinner"></div>';
  try {
    const data = await api(`/api/search?q=${encodeURIComponent(q)}&source=${source}`);
    if (!data.count) { $('status').textContent = 'No papers found. Try different keywords.'; return; }
    $('status').textContent = `${data.count} papers found`;
    $('results').innerHTML = data.results.map((r, i) => `
      <article class="card">
        <div class="thumb" ${r.thumbnail ? `style="background-image:url('${esc(r.thumbnail)}')"` : ''}>${r.thumbnail ? '' : '📄'}</div>
        <div class="card-body">
          <div class="card-title">${esc(r.title)}</div>
          <button class="btn" data-i="${i}">Download</button>
        </div>
      </article>`).join('');
    $('results').querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => openPaper(data.results[b.dataset.i])));
  } catch (e) {
    $('status').textContent = e.message;
  }
}

async function openPaper(paper) {
  $('modal').classList.remove('hidden');
  $('mTitle').textContent = paper.title;
  $('mDesc').textContent = '';
  $('mThumb').style.display = 'none';
  $('mLinks').innerHTML = '<div class="spinner"></div>';
  try {
    const d = await api(`/api/details?url=${encodeURIComponent(paper.link)}&source=${source}`);
    const title = d.title || paper.title;
    const img = d.thumbnail || paper.thumbnail;
    $('mTitle').textContent = title;
    $('mDesc').textContent = d.description;
    if (img) { $('mThumb').src = img; $('mThumb').style.display = 'block'; }
    if (!d.pdfLinks.length) {
      $('mLinks').innerHTML = `<p class="muted">No direct PDF found.</p><a class="btn alt" target="_blank" rel="noopener" href="${esc(paper.link)}">Open original page</a>`;
      return;
    }
    $('mLinks').innerHTML = d.pdfLinks.map((l, i) =>
      `<a class="btn" target="_blank" rel="noopener" data-url="${esc(l)}" href="${esc(l)}">⬇ Download PDF ${d.pdfLinks.length > 1 ? i + 1 : ''}</a>`).join('');
    $('mLinks').querySelectorAll('a').forEach((a) => a.addEventListener('click', () =>
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: a.dataset.url, title }) })));
  } catch (e) {
    $('mLinks').innerHTML = `<p class="muted">${esc(e.message)}</p>`;
  }
}

async function loadPopular() {
  try {
    const { results } = await api('/api/popular');
    const base = ['grade 11 ict', 'grade 10 maths', 'o/l science', 'a/l ict'];
    $('popular').innerHTML = [...new Set([...results, ...base])].slice(0, 8)
      .map((q) => `<button class="chip">${esc(q)}</button>`).join('');
    $('popular').querySelectorAll('.chip').forEach((c) =>
      c.addEventListener('click', () => { $('q').value = c.textContent; doSearch(c.textContent); }));
  } catch {}
}

$('searchForm').addEventListener('submit', (e) => { e.preventDefault(); doSearch($('q').value.trim()); });
$('tabs').addEventListener('click', (e) => {
  const t = e.target.closest('.tab'); if (!t) return;
  document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
  t.classList.add('active'); source = t.dataset.source;
  if ($('q').value.trim()) doSearch($('q').value.trim());
});
$('closeModal').addEventListener('click', () => $('modal').classList.add('hidden'));
$('modal').addEventListener('click', (e) => { if (e.target.id === 'modal') $('modal').classList.add('hidden'); });
loadPopular();
