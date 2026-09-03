/* ============================================================
   Shared site chrome behavior: language switcher, theme toggle,
   mobile menu. Linked from every page.
   Call SiteChrome.init(translations) once the header/menu markup
   is in the DOM, passing that page's i18n dictionary (only
   'nav.*' keys are required; a full-content dictionary works too).
   ============================================================ */
window.SiteChrome = (function() {
  'use strict';

  var LANG_META = {
    en: { label: 'English', shortLabel: 'US', flag: 'https://flagcdn.com/24x18/us.png' },
    es: { label: 'Español', shortLabel: 'ES', flag: 'https://flagcdn.com/24x18/es.png' },
    de: { label: 'Deutsch', shortLabel: 'DE', flag: 'https://flagcdn.com/24x18/de.png' },
    fr: { label: 'Français', shortLabel: 'FR', flag: 'https://flagcdn.com/24x18/fr.png' },
    pt: { label: 'Português', shortLabel: 'BR', flag: 'https://flagcdn.com/24x18/br.png' },
    zh: { label: '繁體中文', shortLabel: 'TW', flag: 'https://flagcdn.com/24x18/tw.png' },
    it: { label: 'Italiano', shortLabel: 'IT', flag: 'https://flagcdn.com/24x18/it.png' },
    vi: { label: 'Tiếng Việt', shortLabel: 'VN', flag: 'https://flagcdn.com/24x18/vn.png' },
    tr: { label: 'Türkçe', shortLabel: 'TR', flag: 'https://flagcdn.com/24x18/tr.png' },
    nl: { label: 'Nederlands', shortLabel: 'NL', flag: 'https://flagcdn.com/24x18/nl.png' },
    ja: { label: '日本語', shortLabel: 'JP', flag: 'https://flagcdn.com/24x18/jp.png' }
  };
  var SUPPORTED_LANGS = Object.keys(LANG_META);

  function updateLangSwitchUI(lang) {
    var meta = LANG_META[lang] || LANG_META.en;
    document.querySelectorAll('.lang-switch').forEach(function(switchEl) {
      var currentFlag = switchEl.querySelector('.lang-current .lang-flag');
      var currentLabel = switchEl.querySelector('.lang-current-label');
      if (currentFlag) currentFlag.src = meta.flag;
      if (currentLabel) currentLabel.textContent = switchEl.classList.contains('lang-switch--mobile') ? meta.label : meta.shortLabel;
      switchEl.querySelectorAll('.lang-option').forEach(function(opt) {
        var isActive = opt.getAttribute('data-lang') === lang;
        opt.classList.toggle('active', isActive);
        opt.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    });
  }

  function closeAllLangSwitches() {
    document.querySelectorAll('.lang-switch.open').forEach(function(sw) {
      sw.classList.remove('open');
      var btn = sw.querySelector('.lang-current');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  function detectInitialLanguage() {
    try {
      var saved = localStorage.getItem('ssx-lang');
      if (SUPPORTED_LANGS.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    if (nav.indexOf('zh-tw') === 0 || nav.indexOf('zh-hk') === 0) return 'zh';
    var short = nav.slice(0, 2);
    return SUPPORTED_LANGS.indexOf(short) !== -1 ? short : 'en';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('ssx-theme', theme); } catch (e) {}
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  }

  function initThemeToggle() {
    [document.getElementById('themeToggleDesktop'), document.getElementById('themeToggleMobile')].forEach(function(btn) {
      if (btn) btn.addEventListener('click', toggleTheme);
    });
  }

  function initLangSwitch(translations) {
    function applyLanguage(lang) {
      var dict = translations[lang] || translations.en;
      document.documentElement.lang = lang;
      document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (dict[key] !== undefined) el.textContent = dict[key];
      });
      document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
        var key = el.getAttribute('data-i18n-html');
        if (dict[key] !== undefined) el.innerHTML = dict[key];
      });
      updateLangSwitchUI(lang);
      try { localStorage.setItem('ssx-lang', lang); } catch (e) {}
    }

    applyLanguage(detectInitialLanguage());

    document.querySelectorAll('.lang-switch').forEach(function(switchEl) {
      var currentBtn = switchEl.querySelector('.lang-current');
      currentBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = switchEl.classList.contains('open');
        closeAllLangSwitches();
        if (!isOpen) {
          switchEl.classList.add('open');
          currentBtn.setAttribute('aria-expanded', 'true');
        }
      });
      switchEl.querySelectorAll('.lang-option').forEach(function(opt) {
        opt.addEventListener('click', function(e) {
          e.stopPropagation();
          applyLanguage(opt.getAttribute('data-lang'));
          closeAllLangSwitches();
        });
      });
    });

    document.addEventListener('click', closeAllLangSwitches);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeAllLangSwitches();
    });

    return applyLanguage;
  }

  function initMobileMenu() {
    var burger = document.getElementById('burgerBtn');
    var overlay = document.getElementById('menuOverlay');
    var sheet = document.getElementById('menuSheet');
    if (!burger || !overlay || !sheet) return;

    function openMenu() {
      burger.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      overlay.classList.add('open');
      sheet.hidden = false;
      requestAnimationFrame(function() { sheet.classList.add('open'); });
      document.body.classList.add('menu-open');
    }
    function closeMenu() {
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      overlay.classList.remove('open');
      sheet.classList.remove('open');
      document.body.classList.remove('menu-open');
      setTimeout(function() { sheet.hidden = true; }, 380);
    }

    burger.addEventListener('click', function() {
      if (sheet.classList.contains('open')) closeMenu(); else openMenu();
    });
    overlay.addEventListener('click', closeMenu);
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && sheet.classList.contains('open')) closeMenu();
    });
    sheet.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() { closeMenu(); });
    });
    window.addEventListener('resize', function() {
      if (window.innerWidth > 900 && sheet.classList.contains('open')) closeMenu();
    });
  }

  function init(translations) {
    var applyLanguage = initLangSwitch(translations || { en: {} });
    initThemeToggle();
    initMobileMenu();
    return { applyLanguage: applyLanguage };
  }

  return {
    init: init,
    LANG_META: LANG_META,
    SUPPORTED_LANGS: SUPPORTED_LANGS,
    detectInitialLanguage: detectInitialLanguage,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme
  };
})();
