(() => {
  const THEME_KEY = 'pathway:theme';

  const THEMES = [
    { id: 'paper', label: 'Warm Paper', swatch: '#F7F4EE' },
    { id: 'mint',  label: 'Soft Mint',  swatch: '#5E8367' },
    { id: 'sky',   label: 'Dusty Sky',  swatch: '#3F6E92' },
    { id: 'dusk',  label: 'Calm Dusk',  swatch: '#27241F' }
  ];

  function getTheme(){
    return localStorage.getItem(THEME_KEY) || 'paper';
  }

  function applyTheme(id){
    if (id === 'paper'){
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', id);
    }
    localStorage.setItem(THEME_KEY, id);
  }

  function buildWidget(){
    const wrap = document.createElement('div');
    wrap.className = 'theme-switcher';

    const btn = document.createElement('button');
    btn.className = 'theme-toggle-btn';
    btn.setAttribute('aria-label', 'Change color theme');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '🎨';

    const panel = document.createElement('div');
    panel.className = 'theme-panel';
    panel.hidden = true;

    const label = document.createElement('div');
    label.className = 'theme-panel-label';
    label.textContent = 'Color theme';
    panel.appendChild(label);

    const current = getTheme();

    THEMES.forEach(theme => {
      const opt = document.createElement('button');
      opt.className = 'theme-option' + (theme.id === current ? ' active' : '');
      opt.dataset.theme = theme.id;
      opt.innerHTML = `<span class="theme-swatch" style="background:${theme.swatch}"></span><span>${theme.label}</span>`;
      opt.addEventListener('click', () => {
        applyTheme(theme.id);
        panel.querySelectorAll('.theme-option').forEach(o => o.classList.toggle('active', o === opt));
      });
      panel.appendChild(opt);
    });

    btn.addEventListener('click', () => {
      const isHidden = panel.hidden;
      panel.hidden = !isHidden;
      btn.setAttribute('aria-expanded', String(isHidden));
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) panel.hidden = true;
    });

    wrap.appendChild(panel);
    wrap.appendChild(btn);
    document.body.appendChild(wrap);
  }

  // apply saved theme immediately (before widget exists) to avoid flash
  applyTheme(getTheme());

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', buildWidget);
  } else {
    buildWidget();
  }
})();
