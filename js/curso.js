
(function () {
  'use strict';
  var DATA = window.AIE || { modules: [], total: 0, current: null };
  var KEY = 'aie_esencial_progress_v1';
  var THEME_KEY = 'aie_esencial_theme';
  var root = document.documentElement;
  var flat = [];
  DATA.modules.forEach(function (m) {
    m.lessons.forEach(function (l) {
      l.mod = m.num; l.modTitle = m.title; flat.push(l);
    });
  });
  var byId = {};
  flat.forEach(function (l) { byId[l.id] = l; });

  function safeParse(s) { try { return JSON.parse(s) || {}; } catch (e) { return {}; } }
  var state = safeParse(localStorage.getItem(KEY));
  Object.keys(state).forEach(function (k) { if (!byId[k]) delete state[k]; });

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function isDone(id) { return !!state[id]; }
  function doneCount() { return Object.keys(state).filter(isDone).length; }

  /* ---------------- Tema ---------------- */
  function currentTheme() { return root.getAttribute('data-theme') || 'light'; }
  function paintTheme() {
    var dark = currentTheme() === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', dark ? 'Activar modo claro' : 'Activar modo oscuro');
      b.setAttribute('title', dark ? 'Modo claro' : 'Modo oscuro');
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#13110d' : '#f5f1e8');
  }
  document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      paintTheme();
    });
  });
  paintTheme();

  /* ---------------- Progreso ---------------- */
  function ringSet(el, pct) {
    if (!el) return;
    var r = parseFloat(el.getAttribute('r')) || 18;
    var c = 2 * Math.PI * r;
    el.style.strokeDasharray = c + ' ' + c;
    el.style.strokeDashoffset = c * (1 - pct / 100);
  }
  function modulePct(num) {
    var m = DATA.modules.filter(function (x) { return x.num === num; })[0];
    if (!m || !m.lessons.length) return 0;
    var d = m.lessons.filter(function (l) { return isDone(l.id); }).length;
    return Math.round(d * 100 / m.lessons.length);
  }
  function applyProgress() {
    var done = doneCount(), total = DATA.total || flat.length;
    var pct = total ? Math.round(done * 100 / total) : 0;
    document.querySelectorAll('[data-done-count]').forEach(function (e) { e.textContent = done; });
    document.querySelectorAll('[data-total-count]').forEach(function (e) { e.textContent = total; });
    document.querySelectorAll('[data-pct]').forEach(function (e) { e.textContent = pct + '%'; });
    document.querySelectorAll('[data-ring]').forEach(function (e) { ringSet(e, pct); });
    document.querySelectorAll('[data-bar]').forEach(function (e) { e.style.width = pct + '%'; });
    document.querySelectorAll('[data-modbar]').forEach(function (e) {
      e.style.width = modulePct(e.getAttribute('data-modbar')) + '%';
    });
    document.querySelectorAll('[data-modcount]').forEach(function (e) {
      var num = e.getAttribute('data-modcount');
      var m = DATA.modules.filter(function (x) { return x.num === num; })[0];
      var d = m ? m.lessons.filter(function (l) { return isDone(l.id); }).length : 0;
      e.textContent = d + '/' + (m ? m.lessons.length : 0);
    });
    document.querySelectorAll('.lesson-link[data-lesson]').forEach(function (a) {
      a.classList.toggle('is-done', isDone(a.getAttribute('data-lesson')));
    });
    document.querySelectorAll('[data-lesson-row]').forEach(function (a) {
      a.classList.toggle('is-done', isDone(a.getAttribute('data-lesson-row')));
    });
    document.querySelectorAll('.module[data-module]').forEach(function (d) {
      var n = d.querySelector('[data-modcount]');
      if (n && doneCount() > 0) d.classList.toggle('has-progress', !!n.textContent && n.textContent.indexOf('0/') !== 0);
    });
    var next = flat.filter(function (l) { return !isDone(l.id); })[0] || flat[flat.length - 1];
    document.querySelectorAll('[data-resume]').forEach(function (a) {
      if (next) { a.href = next.href; }
    });
    document.querySelectorAll('[data-resume-title]').forEach(function (e) {
      if (next) e.textContent = next.title;
    });
    document.querySelectorAll('[data-resume-label]').forEach(function (e) {
      e.textContent = done > 0 ? 'Continuar donde lo dejaste' : 'Empezar el curso';
    });
    // Página de progreso
    document.querySelectorAll('[data-mp]').forEach(function (row) {
      var num = row.getAttribute('data-mp');
      var p = modulePct(num);
      var bar = row.querySelector('[data-mpbar]');
      var txt = row.querySelector('[data-mppct]');
      if (bar) bar.style.width = p + '%';
      if (txt) txt.textContent = p + '%';
    });
    var list = document.querySelector('[data-completed-list]');
    if (list) {
      var ids = Object.keys(state).filter(isDone).sort(function (a, b) { return state[b] - state[a]; });
      if (!ids.length) {
        list.innerHTML = '<div class="empty">Todavía no has completado ninguna lección. Abre la primera y pulsa «Completar y seguir».</div>';
      } else {
        list.innerHTML = '';
        ids.forEach(function (id) {
          var l = byId[id]; if (!l) return;
          var a = document.createElement('a');
          a.href = l.href; a.className = 'done-link';
          var tick = document.createElement('span'); tick.className = 'tick';
          tick.innerHTML = '<svg viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1 4.2 3 6.1 7 1.9"/></svg>';
          var t = document.createElement('span'); t.textContent = l.title;
          a.appendChild(tick); a.appendChild(t);
          list.appendChild(a);
        });
      }
      var empty = document.querySelector('[data-completed-empty]');
      if (empty) empty.style.display = ids.length ? 'none' : '';
    }
  }
  function markDone(id, silent) {
    if (!id || !byId[id]) return;
    state[id] = Date.now(); save(); applyProgress();
    if (!silent) {
      var l = byId[id];
      toast('Lección completada · ' + l.title);
    }
  }
  window.AIE_markDone = markDone;

  document.querySelectorAll('[data-complete-link]').forEach(function (a) {
    a.addEventListener('click', function () {
      markDone(a.getAttribute('data-complete-link'), true);
    });
  });

  document.querySelectorAll('[data-complete-btn]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-complete-btn');
      markDone(id);
      b.textContent = 'Completada';
      b.disabled = true;
      document.querySelectorAll('[data-lesson-row="' + id + '"]').forEach(function (r) { r.classList.add('is-done'); });
      var finish = document.querySelector('.finish');
      if (finish) finish.classList.add('done');
    });
  });

  /* ---------------- Toast ---------------- */
  var toastEl = document.querySelector('[data-toast]');
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------------- Sidebar ---------------- */
  var sidebar = document.getElementById('sidebar');
  var overlay = document.querySelector('[data-overlay]');
  function openSidebar(open) {
    if (!sidebar) return;
    sidebar.classList.toggle('open', open);
    if (overlay) overlay.classList.toggle('open', open);
    document.body.classList.toggle('nav-open', open);
    var btn = document.querySelector('[data-menu-toggle]');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  document.querySelectorAll('[data-menu-toggle]').forEach(function (b) {
    b.addEventListener('click', function () { openSidebar(!sidebar.classList.contains('open')); });
  });
  if (overlay) overlay.addEventListener('click', function () { openSidebar(false); });
  document.querySelectorAll('.side-nav a').forEach(function (a) {
    a.addEventListener('click', function () { if (window.innerWidth <= 1100) openSidebar(false); });
  });
  // centrar la lección actual en la barra lateral
  var currentLink = document.querySelector('.lesson-link.is-current');
  if (currentLink) {
    var nav = document.querySelector('.side-nav');
    if (nav) {
      var target = currentLink.offsetTop - nav.clientHeight / 2 + currentLink.offsetHeight / 2;
      nav.scrollTop = Math.max(0, target);
    }
  }

  /* ---------------- Búsqueda ---------------- */
  var search = document.querySelector('[data-search]');
  var searchInput = search ? search.querySelector('.search-input') : null;
  var resultsEl = search ? search.querySelector('.search-results') : null;
  var selIndex = 0, currentResults = [];

  function norm(s) {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function openSearch(open) {
    if (!search) return;
    search.classList.toggle('open', open);
    if (open) {
      document.body.style.overflow = 'hidden';
      setTimeout(function () { if (searchInput) { searchInput.value = ''; searchInput.focus(); } renderResults(''); }, 20);
    } else {
      document.body.style.overflow = '';
    }
  }
  function renderResults(q) {
    if (!resultsEl) return;
    var query = norm(q.trim());
    currentResults = flat.filter(function (l) {
      if (!query) return true;
      return norm(l.title + ' ' + l.modTitle + ' ' + (l.search || '')).indexOf(query) >= 0;
    }).slice(0, 30);
    if (!currentResults.length) {
      resultsEl.innerHTML = '<div class="sr-empty">Sin resultados. Prueba con «evaluación», «RAG» o «prompt».</div>';
      return;
    }
    selIndex = 0;
    resultsEl.innerHTML = '';
    currentResults.forEach(function (l, i) {
      var a = document.createElement('a');
      a.className = 'sr-item' + (i === 0 ? ' sel' : '');
      a.href = l.href;
      var n = document.createElement('span'); n.className = 'sn'; n.textContent = l.mod + '.' + l.lnum;
      var t = document.createElement('span'); t.className = 'st'; t.textContent = l.title;
      var m = document.createElement('span'); m.className = 'sm'; m.textContent = l.kind === 'quiz' ? 'Evaluación' : 'Lección';
      a.appendChild(n); a.appendChild(t); a.appendChild(m);
      a.addEventListener('mouseenter', function () {
        selIndex = i;
        resultsEl.querySelectorAll('.sr-item').forEach(function (x) { x.classList.remove('sel'); });
        a.classList.add('sel');
      });
      resultsEl.appendChild(a);
    });
  }
  function moveSel(delta) {
    if (!currentResults.length) return;
    selIndex = (selIndex + delta + currentResults.length) % currentResults.length;
    var items = resultsEl.querySelectorAll('.sr-item');
    items.forEach(function (x) { x.classList.remove('sel'); });
    var el = items[selIndex];
    if (el) { el.classList.add('sel'); el.scrollIntoView({ block: 'nearest' }); }
  }
  document.querySelectorAll('[data-search-open]').forEach(function (b) {
    b.addEventListener('click', function () { openSearch(true); });
  });
  if (search) {
    search.addEventListener('click', function (e) { if (e.target === search) openSearch(false); });
    var close = search.querySelector('[data-search-close]');
    if (close) close.addEventListener('click', function () { openSearch(false); });
    if (searchInput) {
      searchInput.addEventListener('input', function () { renderResults(searchInput.value); });
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(1); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(-1); }
        else if (e.key === 'Enter') {
          e.preventDefault();
          if (currentResults[selIndex]) window.location.href = currentResults[selIndex].href;
        }
      });
    }
  }

  /* ---------------- Atajos y avance ---------------- */
  var isTyping = function (el) {
    if (!el) return false;
    return /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable;
  };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (search && search.classList.contains('open')) { openSearch(false); return; }
      if (sidebar && sidebar.classList.contains('open')) { openSidebar(false); return; }
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); openSearch(true); return;
    }
    if (isTyping(document.activeElement)) return;
    if (search && search.classList.contains('open')) return;
    if (e.key === '/') { e.preventDefault(); openSearch(true); return; }
    if (e.key === 'ArrowRight' && DATA.next) { window.location.href = DATA.next.href; }
    if (e.key === 'ArrowLeft' && DATA.prev) { window.location.href = DATA.prev.href; }
    if (e.key.toLowerCase() === 'c' && DATA.current) {
      markDone(DATA.current);
      var b = document.querySelector('[data-complete-btn]');
      if (b) { b.textContent = 'Completada'; b.disabled = true; }
      var f = document.querySelector('.finish'); if (f) f.classList.add('done');
    }
    if (e.key === '?') {
      toast('Atajos: ← anterior · → siguiente · C completar · / buscar · Esc cerrar');
    }
  });

  /* ---------------- Lectura / TOC ---------------- */
  var readbar = document.querySelector('[data-readbar]');
  var headings = Array.prototype.slice.call(document.querySelectorAll('.prose h2[id], .prose h3[id]'));
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  function onScroll() {
    if (readbar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) * 100 : 0;
      readbar.style.width = Math.min(100, Math.max(0, p)) + '%';
      var dockBar = document.querySelector('[data-dockbar]');
      if (dockBar) dockBar.style.width = Math.min(100, Math.max(0, p)) + '%';
    }
    if (headings.length && tocLinks.length) {
      var active = null;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top <= 120) active = headings[i];
        else break;
      }
      tocLinks.forEach(function (a) {
        a.classList.toggle('active', !!active && a.getAttribute('href') === '#' + active.id);
      });
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { onScroll(); ticking = false; }); }
  }, { passive: true });
  onScroll();

  /* ---------------- Glosario ---------------- */
  var glossInput = document.querySelector('[data-gloss-input]');
  if (glossInput) {
    var terms = Array.prototype.slice.call(document.querySelectorAll('[data-term]'));
    glossInput.addEventListener('input', function () {
      var q = norm(glossInput.value);
      terms.forEach(function (t) {
        t.classList.toggle('hidden', q && norm(t.getAttribute('data-term')).indexOf(q) < 0);
      });
    });
    document.querySelectorAll('[data-alpha]').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('[data-alpha]').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var letter = b.getAttribute('data-alpha');
        terms.forEach(function (t) {
          t.classList.toggle('hidden', letter !== '*' && norm(t.getAttribute('data-term')).charAt(0) !== norm(letter));
        });
        if (glossInput) glossInput.value = '';
      });
    });
  }

  /* ---------------- Examen ---------------- */
  var exam = document.querySelector('[data-exam]');
  if (exam) {
    var questions = Array.prototype.slice.call(exam.querySelectorAll('.q'));
    var check = exam.querySelector('[data-check]');
    var retry = exam.querySelector('[data-retry]');
    var scoreEl = exam.querySelector('[data-score]');
    var passEl = exam.querySelector('.exam-pass');
    check.addEventListener('click', function () {
      var correct = 0, answered = 0;
      questions.forEach(function (q) {
        var chosen = q.querySelector('input[type="radio"]:checked');
        var fb = q.querySelector('.fb');
        var answer = parseInt(q.getAttribute('data-answer'), 10);
        var opts = q.querySelectorAll('.opt');
        if (!chosen) { fb.className = 'fb no show'; fb.textContent = 'Elige una opción antes de comprobar.'; return; }
        answered++;
        var val = parseInt(chosen.value, 10);
        opts.forEach(function (o) { o.classList.add('locked'); });
        if (val === answer) {
          correct++;
          chosen.closest('.opt').classList.add('correct');
          fb.className = 'fb ok show';
          fb.textContent = 'Correcto. ' + q.getAttribute('data-why');
        } else {
          chosen.closest('.opt').classList.add('wrong');
          opts.forEach(function (o) {
            if (parseInt(o.querySelector('input').value, 10) === answer) o.classList.add('correct');
          });
          fb.className = 'fb no show';
          fb.textContent = 'Incorrecto. ' + q.getAttribute('data-why');
        }
      });
      if (!answered) return;
      var need = Math.ceil(questions.length * 0.66);
      if (scoreEl) scoreEl.innerHTML = '<b>' + correct + ' / ' + questions.length + '</b> correctas';
      if (correct >= need) {
        passEl.classList.add('show');
        passEl.textContent = 'Aprobado. Has consolidado las ideas clave del módulo; puedes seguir adelante.';
        var lid = exam.getAttribute('data-exam');
        markDone(lid, true);
        toast('Evaluación superada · ' + correct + '/' + questions.length);
      } else {
        passEl.classList.remove('show');
      }
      check.hidden = true;
      retry.hidden = false;
    });
    retry.addEventListener('click', function () {
      questions.forEach(function (q) {
        q.querySelectorAll('.opt').forEach(function (o) { o.classList.remove('locked', 'correct', 'wrong'); });
        var inputs = q.querySelectorAll('input');
        inputs.forEach(function (i) { i.checked = false; });
        var fb = q.querySelector('.fb'); fb.className = 'fb'; fb.textContent = '';
      });
      if (scoreEl) scoreEl.innerHTML = '<b>0 / ' + questions.length + '</b> correctas';
      passEl.classList.remove('show');
      check.hidden = false; retry.hidden = true;
    });
  }

  /* ---------------- Índice ---------------- */
  // Abrir el módulo de la siguiente lección (solo si hay progreso)
  if (document.body.classList.contains('is-home') && doneCount() > 0) {
    var next = flat.filter(function (l) { return !isDone(l.id); })[0];
    if (next) {
      var mod = document.querySelector('.module[data-module="' + next.mod + '"]');
      if (mod) mod.open = true;
    }
  }
  // Contraer / expandir todo el temario
  var toggleAll = document.querySelector('[data-toggle-all]');
  if (toggleAll) {
    toggleAll.addEventListener('click', function () {
      var mods = Array.prototype.slice.call(document.querySelectorAll('.module[data-module]'));
      var anyOpen = mods.some(function (m) { return m.open; });
      mods.forEach(function (m) { m.open = !anyOpen; });
      toggleAll.textContent = anyOpen ? 'Expandir el temario' : 'Contraer el temario';
    });
  }
  // Botón de reinicio
  document.querySelectorAll('[data-reset]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!confirm('¿Borrar todo el progreso guardado en este navegador?')) return;
      state = {}; save(); applyProgress(); toast('Progreso borrado');
    });
  });

  applyProgress();
})();
