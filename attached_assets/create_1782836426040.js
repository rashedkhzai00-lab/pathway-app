(() => {
  const STORAGE_KEY = 'pathway:questionBank';

  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const questionList = document.getElementById('questionList');
  const bankEmpty = document.getElementById('bankEmpty');
  const bankCount = document.getElementById('bankCount');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');

  const qForm = document.getElementById('qForm');
  const editId = document.getElementById('editId');
  const qCategory = document.getElementById('qCategory');
  const qText = document.getElementById('qText');
  const qExplanation = document.getElementById('qExplanation');
  const optInputs = document.querySelectorAll('.opt-input');
  const correctPicker = document.getElementById('correctPicker');
  const correctOpts = document.querySelectorAll('.correct-opt');
  const clearFormBtn = document.getElementById('clearFormBtn');
  const saveBtn = document.getElementById('saveBtn');

  const rawNotes = document.getElementById('rawNotes');
  const splitBtn = document.getElementById('splitBtn');
  const chunkList = document.getElementById('chunkList');

  let selectedCorrect = null;

  // ---------- storage ----------
  function loadBank(){
    try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch(e){ return []; }
  }

  function saveBank(bank){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bank));
  }

  // ---------- tabs ----------
  function setTab(name){
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    panels.forEach(p => p.hidden = p.dataset.panel !== name);
    if (name === 'mine') renderList();
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab));
  });

  // ---------- list rendering ----------
  function populateCategoryFilter(bank){
    const cats = [...new Set(bank.map(q => q.category).filter(Boolean))].sort();
    const current = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="">All categories</option>' +
      cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    if (cats.includes(current)) categoryFilter.value = current;
  }

  function renderList(){
    const bank = loadBank();
    populateCategoryFilter(bank);

    const query = searchInput.value.trim().toLowerCase();
    const cat = categoryFilter.value;

    const filtered = bank.filter(q => {
      const matchesQuery = !query || q.text.toLowerCase().includes(query) || q.category.toLowerCase().includes(query);
      const matchesCat = !cat || q.category === cat;
      return matchesQuery && matchesCat;
    });

    questionList.innerHTML = '';
    filtered.slice().reverse().forEach(q => {
      const card = document.createElement('div');
      card.className = 'q-card';

      const letters = ['A','B','C','D'];
      card.innerHTML = `
        <div class="q-card-top">
          <div>
            <div class="q-card-category">${escapeHtml(q.category || 'Uncategorized')}</div>
            <div class="q-card-text">${escapeHtml(q.text)}</div>
            <div class="q-card-answer">Correct: ${letters[q.correctIndex]} — ${escapeHtml(q.options[q.correctIndex] || '')}</div>
          </div>
          <div class="q-card-actions">
            <button class="icon-btn" data-action="edit" data-id="${q.id}" aria-label="Edit">✎</button>
            <button class="icon-btn" data-action="delete" data-id="${q.id}" aria-label="Delete">✕</button>
          </div>
        </div>
      `;
      questionList.appendChild(card);
    });

    bankEmpty.hidden = bank.length > 0;
    questionList.hidden = bank.length === 0;
    bankCount.textContent = bank.length === 1 ? '1 question saved' : `${bank.length} questions saved`;
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  questionList.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'delete'){
      if (!confirm('Delete this question?')) return;
      const bank = loadBank().filter(q => q.id !== id);
      saveBank(bank);
      renderList();
    } else if (btn.dataset.action === 'edit'){
      const q = loadBank().find(q => q.id === id);
      if (q) loadIntoForm(q);
      setTab('add');
    }
  });

  searchInput.addEventListener('input', renderList);
  categoryFilter.addEventListener('change', renderList);

  // ---------- export / import ----------
  exportBtn.addEventListener('click', () => {
    const bank = loadBank();
    const blob = new Blob([JSON.stringify(bank, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pathway-question-bank.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  importBtn.addEventListener('click', () => importFile.click());

  importFile.addEventListener('change', () => {
    const file = importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const incoming = JSON.parse(reader.result);
        if (!Array.isArray(incoming)) throw new Error('not an array');
        const existing = loadBank();
        const existingIds = new Set(existing.map(q => q.id));
        const merged = existing.concat(incoming.filter(q => q && q.id && !existingIds.has(q.id)));
        saveBank(merged);
        renderList();
        alert(`Imported ${incoming.length} question(s).`);
      }catch(e){
        alert('Could not read that file. Make sure it is a JSON export from this app.');
      }
      importFile.value = '';
    };
    reader.readAsText(file);
  });

  // ---------- add/edit form ----------
  correctOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      selectedCorrect = parseInt(opt.dataset.idx, 10);
      correctOpts.forEach(o => o.classList.toggle('selected', o === opt));
    });
  });

  function loadIntoForm(q){
    editId.value = q.id;
    qCategory.value = q.category || '';
    qText.value = q.text || '';
    qExplanation.value = q.explanation || '';
    optInputs.forEach((inp, i) => inp.value = q.options[i] || '');
    selectedCorrect = q.correctIndex;
    correctOpts.forEach(o => o.classList.toggle('selected', parseInt(o.dataset.idx,10) === selectedCorrect));
    saveBtn.textContent = 'Save changes';
  }

  function resetForm(){
    editId.value = '';
    qForm.reset();
    selectedCorrect = null;
    correctOpts.forEach(o => o.classList.remove('selected'));
    saveBtn.textContent = 'Save question';
  }

  clearFormBtn.addEventListener('click', resetForm);

  qForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (selectedCorrect === null){
      alert('Pick which option is correct before saving.');
      return;
    }

    const options = Array.from(optInputs).map(i => i.value.trim());
    if (options.some(o => !o)){
      alert('Fill in all four options.');
      return;
    }

    const bank = loadBank();
    const id = editId.value;

    const payload = {
      id: id || 'q-' + Date.now() + '-' + Math.random().toString(36).slice(2,7),
      category: qCategory.value.trim() || 'Uncategorized',
      text: qText.value.trim(),
      options,
      correctIndex: selectedCorrect,
      explanation: qExplanation.value.trim()
    };

    if (id){
      const idx = bank.findIndex(q => q.id === id);
      if (idx !== -1) bank[idx] = payload;
    } else {
      bank.push(payload);
    }

    saveBank(bank);
    resetForm();
    setTab('mine');
  });

  // ---------- from notes ----------
  splitBtn.addEventListener('click', () => {
    const raw = rawNotes.value.trim();
    if (!raw) return;

    // split on line breaks first; if a "line" is long, also split on sentence boundaries
    let pieces = raw.split(/\n+/).map(s => s.trim()).filter(Boolean);
    if (pieces.length <= 1){
      pieces = raw.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(Boolean);
    }

    chunkList.innerHTML = '';
    pieces.forEach((piece, i) => {
      const row = document.createElement('div');
      row.className = 'chunk-row';
      row.innerHTML = `
        <span class="chunk-text">${escapeHtml(piece)}</span>
        <button class="chunk-use-btn" data-text="${escapeHtml(piece)}">Use this</button>
      `;
      chunkList.appendChild(row);
    });
  });

  chunkList.addEventListener('click', (e) => {
    const btn = e.target.closest('.chunk-use-btn');
    if (!btn) return;
    resetForm();
    qText.value = btn.dataset.text;
    btn.closest('.chunk-row').classList.add('used');
    setTab('add');
    qText.focus();
  });

  // ---------- init ----------
  const params = new URLSearchParams(window.location.search);
  const initialTab = params.get('mode') === 'new' ? 'notes' : (params.get('mode') === 'edit' ? 'mine' : 'mine');
  setTab(initialTab);
})();
