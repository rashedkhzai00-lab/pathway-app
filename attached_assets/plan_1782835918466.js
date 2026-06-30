(() => {
  const STORAGE_KEY = 'pathway:planItems';

  const todayBtn = document.getElementById('todayBtn');
  const weekBtn = document.getElementById('weekBtn');
  const rangeHeading = document.getElementById('rangeHeading');
  const addForm = document.getElementById('addForm');
  const taskInput = document.getElementById('taskInput');
  const dateInput = document.getElementById('dateInput');
  const timeInput = document.getElementById('timeInput');
  const listWrap = document.getElementById('listWrap');
  const emptyState = document.getElementById('emptyState');
  const toggleCompletedBtn = document.getElementById('toggleCompleted');

  let showCompleted = false;

  function pad(n){ return n.toString().padStart(2,'0'); }

  function toDateStr(d){
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }

  function todayStr(){ return toDateStr(new Date()); }

  function loadItems(){
    try{
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }catch(e){ return []; }
  }

  function saveItems(items){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function addItem(text, date, time){
    const items = loadItems();
    items.push({
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).slice(2,7),
      text,
      date,
      time: time || '',
      done: false
    });
    saveItems(items);
  }

  function toggleDone(id){
    const items = loadItems();
    const item = items.find(i => i.id === id);
    if (item) item.done = !item.done;
    saveItems(items);
    render();
  }

  function deleteItem(id){
    const items = loadItems().filter(i => i.id !== id);
    saveItems(items);
    render();
  }

  function dayLabel(dateStr){
    const today = todayStr();
    const d = new Date(dateStr + 'T00:00:00');
    const t = new Date(today + 'T00:00:00');
    const diffDays = Math.round((d - t) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function getView(){
    return document.querySelector('.view-btn.active').dataset.view;
  }

  function setView(view){
    todayBtn.classList.toggle('active', view === 'today');
    weekBtn.classList.toggle('active', view === 'week');
    rangeHeading.textContent = view === 'today' ? 'Today' : 'This week';
    render();
  }

  function getRangeDates(view){
    const dates = [];
    const start = new Date();
    const count = view === 'today' ? 1 : 7;
    for (let i = 0; i < count; i++){
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(toDateStr(d));
    }
    return dates;
  }

  function render(){
    const view = getView();
    const rangeDates = getRangeDates(view);
    const items = loadItems();

    listWrap.innerHTML = '';
    let totalVisible = 0;

    rangeDates.forEach(dateStr => {
      let dayItems = items.filter(i => i.date === dateStr);
      if (!showCompleted) dayItems = dayItems.filter(i => !i.done);

      dayItems.sort((a,b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });

      if (dayItems.length === 0) return;
      totalVisible += dayItems.length;

      const group = document.createElement('div');
      group.className = 'day-group';

      const heading = document.createElement('div');
      heading.className = 'day-heading' + (dateStr === todayStr() ? ' is-today' : '');
      heading.innerHTML = `<span class="dot"></span>${dayLabel(dateStr)}`;
      group.appendChild(heading);

      dayItems.forEach(item => {
        const row = document.createElement('div');
        row.className = 'item-row' + (item.done ? ' is-done' : '');

        const check = document.createElement('input');
        check.type = 'checkbox';
        check.className = 'item-check';
        check.checked = item.done;
        check.setAttribute('aria-label', `Mark "${item.text}" as done`);
        check.addEventListener('change', () => toggleDone(item.id));

        const text = document.createElement('span');
        text.className = 'item-text';
        text.textContent = item.text;

        row.appendChild(check);
        row.appendChild(text);

        if (item.time){
          const time = document.createElement('span');
          time.className = 'item-time';
          time.textContent = formatTime(item.time);
          row.appendChild(time);
        }

        const del = document.createElement('button');
        del.className = 'item-delete';
        del.setAttribute('aria-label', `Delete "${item.text}"`);
        del.textContent = '✕';
        del.addEventListener('click', () => deleteItem(item.id));
        row.appendChild(del);

        group.appendChild(row);
      });

      listWrap.appendChild(group);
    });

    emptyState.hidden = totalVisible > 0;
  }

  function formatTime(t){
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${pad(m)} ${period}`;
  }

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    if (!text) return;
    const date = dateInput.value || todayStr();
    const time = timeInput.value;
    addItem(text, date, time);
    taskInput.value = '';
    timeInput.value = '';
    taskInput.focus();
    render();
  });

  todayBtn.addEventListener('click', () => setView('today'));
  weekBtn.addEventListener('click', () => setView('week'));

  toggleCompletedBtn.addEventListener('click', () => {
    showCompleted = !showCompleted;
    toggleCompletedBtn.textContent = showCompleted ? 'Hide completed' : 'Show completed';
    render();
  });

  // init
  dateInput.value = todayStr();
  dateInput.min = todayStr();

  const params = new URLSearchParams(window.location.search);
  const initialView = params.get('view') === 'week' ? 'week' : 'today';
  setView(initialView);
})();
