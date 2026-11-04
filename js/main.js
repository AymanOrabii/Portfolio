/* ==================================================================
 * Footnote — main.js
 * Vanilla JavaScript only. One function per feature, guard clauses.
 * Every section is readable without JavaScript; this file enhances.
 * ================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var TYPES = [
    { key: 'journal', label: 'History articles', cssVar: '--t-journal' },
    { key: 'conference', label: 'Social Studies papers', cssVar: '--t-conference' },
    { key: 'preprint', label: 'Egyptology', cssVar: '--t-preprint' },
    { key: 'chapter', label: 'Archaeology chapters', cssVar: '--t-chapter' }
  ];

  /* Small helpers ------------------------------------------------- */
  function announce(message) {
    var live = document.getElementById('announcer');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(function () { live.textContent = message; }, 60);
  }

  function svgEl(name, attrs) {
    var el = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    return el;
  }

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function normalise(str) {
    return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  /* ----------------------------------------------------------------
   * Navigation: close the mobile menu after a tap, shadow on scroll.
   * ---------------------------------------------------------------- */
  function initNav() {
    var collapse = document.getElementById('primary-nav');
    if (!collapse) return;
    collapse.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (!collapse.classList.contains('show') || !window.bootstrap) return;
        window.bootstrap.Collapse.getOrCreateInstance(collapse).hide();
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !collapse.classList.contains('show') || !window.bootstrap) return;
      window.bootstrap.Collapse.getOrCreateInstance(collapse).hide();
      var toggler = document.querySelector('.navbar-toggler');
      if (toggler) toggler.focus();
    });
  }

  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----------------------------------------------------------------
   * Gentle reveal on scroll (content stays visible without JS).
   * ---------------------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------------
   * News: older items collapse behind a toggle.
   * ---------------------------------------------------------------- */
  function initNewsToggle() {
    var btn = document.querySelector('.news-toggle');
    var list = document.getElementById('news-list');
    if (!btn || !list) return;
    var older = list.querySelectorAll('.is-older');
    if (!older.length) { btn.hidden = true; return; }
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('show-all');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Show fewer' : 'Show older news';
      if (open) {
        older[0].setAttribute('tabindex', '-1');
        older[0].focus({ preventScroll: false });
      }
    });
  }

  /* ----------------------------------------------------------------
   * Forms: browser-side validation, then a success state.
   * Nothing is sent; connect the form to a service to make it live.
   * ---------------------------------------------------------------- */
  function initForms() {
    var forms = document.querySelectorAll('form[data-validate]');
    if (!forms.length) return;

    function check(field) {
      var ok = field.checkValidity();
      field.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', String(!ok));
      return ok;
    }

    forms.forEach(function (form) {
      var fields = form.querySelectorAll('input, select, textarea');
      fields.forEach(function (f) {
        f.addEventListener('blur', function () { if (f.value) check(f); });
        f.addEventListener('input', function () { if (f.classList.contains('is-invalid')) check(f); });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var firstBad = null;
        fields.forEach(function (f) { if (!check(f) && !firstBad) firstBad = f; });
        if (firstBad) { firstBad.focus(); return; }
        var success = form.querySelector('.form-success');
        form.classList.add('is-sent');
        if (success) { success.classList.add('is-visible'); success.focus(); }
        form.reset();
      });
    });
  }

  /* ----------------------------------------------------------------
   * BibTeX: built from each entry's markup, copied to the clipboard.
   * ---------------------------------------------------------------- */
  function bibAuthor(name) {
    var clean = name.replace(/[‡*†]/g, '').trim();
    var i = clean.lastIndexOf(' ');
    return i > 0 ? clean.slice(i + 1) + ', ' + clean.slice(0, i) : clean;
  }

  function buildBibtex(pub) {
    var d = pub.dataset;
    var authors = Array.prototype.map.call(pub.querySelectorAll('.pub-authors .au'), function (el) {
      return bibAuthor(el.textContent);
    });
    var title = (pub.querySelector('.pub-title') || {}).textContent || '';
    var venueEl = pub.querySelector('.pub-venue cite');
    var venue = venueEl ? venueEl.textContent.trim() : '';
    var doiEl = pub.querySelector('.pub-doi');
    var doi = doiEl ? doiEl.textContent.replace(/^doi:/, '').trim() : '';
    var kind = { journal: 'article', conference: 'inproceedings', chapter: 'incollection', preprint: 'misc' }[d.type] || 'misc';
    var f = [['author', authors.join(' and ')], ['title', '{' + title.trim() + '}']];

    if (d.type === 'journal') f.push(['journal', venue]);
    if (d.type === 'conference' || d.type === 'chapter') f.push(['booktitle', venue]);
    if (d.type === 'preprint') { f.push(['howpublished', venue]); f.push(['note', 'Preprint']); }
    if (d.editors) f.push(['editor', d.editors]);
    if (d.publisher) f.push(['publisher', d.publisher]);
    f.push(['year', d.year]);
    if (d.volume) f.push(['volume', d.volume]);
    if (d.number) f.push(['number', d.number]);
    if (d.pages) f.push(['pages', d.pages.replace('–', '--')]);
    if (doi) f.push(['doi', doi]);

    return '@' + kind + '{' + d.key + ',\n' + f.map(function (p) {
      return '  ' + p[0] + ' = {' + String(p[1]).replace(/([&%$#_])/g, '\\$1') + '}';
    }).join(',\n') + '\n}';
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      if (ok) { resolve(); } else { reject(new Error('copy failed')); }
    });
  }

  function initBibtex() {
    var buttons = document.querySelectorAll('.pub .btn-bib');
    if (!buttons.length) return;
    buttons.forEach(function (btn) {
      var label = btn.querySelector('.bib-label');
      btn.addEventListener('click', function () {
        var pub = btn.closest('.pub');
        if (!pub) return;
        var bib = buildBibtex(pub);
        var title = (pub.querySelector('.pub-title') || {}).textContent || 'this publication';
        copyText(bib).then(function () {
          btn.classList.add('is-copied');
          if (label) label.textContent = 'Copied';
          announce('BibTeX for “' + title.trim() + '” copied to the clipboard.');
          window.setTimeout(function () {
            btn.classList.remove('is-copied');
            if (label) label.textContent = 'Copy BibTeX';
          }, 2200);
        }).catch(function () {
          // Clipboard blocked: show the entry so it can be copied by hand.
          var box = pub.querySelector('.bib-fallback');
          if (!box) {
            box = document.createElement('div');
            box.className = 'bib-fallback';
            box.innerHTML = '<span class="label">BibTeX</span><pre tabindex="0"></pre>';
            pub.appendChild(box);
          }
          var pre = box.querySelector('pre');
          pre.textContent = bib;
          pre.focus();
          var range = document.createRange();
          range.selectNodeContents(pre);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          announce('Clipboard unavailable. The BibTeX entry is shown and selected below the publication.');
        });
      });
    });
  }

  /* ----------------------------------------------------------------
   * Publications page: type filters, search, counts and year groups.
   * ---------------------------------------------------------------- */
  function initPublicationFilters() {
    var groupsWrap = document.getElementById('pub-groups');
    var search = document.getElementById('pub-search');
    var chips = document.querySelectorAll('.chip[data-filter]');
    if (!groupsWrap || !search || !chips.length) return;

    var pubs = Array.prototype.slice.call(groupsWrap.querySelectorAll('.pub'));
    var groups = groupsWrap.querySelectorAll('[data-year-group]');
    var countEl = document.getElementById('result-count');
    var empty = document.getElementById('pub-empty');
    var reset = document.getElementById('pub-reset');
    var state = { type: 'all', q: '' };
    var timer = null;

    // Cache searchable text and the original markup we highlight into.
    pubs.forEach(function (pub) {
      pub._text = normalise(Array.prototype.map.call(pub.querySelectorAll('.pub-type, .pub-title, .pub-authors, .pub-venue'), function (el) { return el.textContent; }).join(' '));
      pub._parts = Array.prototype.map.call(pub.querySelectorAll('.pub-title, .pub-venue cite'), function (el) {
        return { el: el, text: el.textContent };
      });
    });

    // Counts on chips and summary stats.
    var totals = { all: pubs.length };
    TYPES.forEach(function (t) { totals[t.key] = pubs.filter(function (p) { return p.dataset.type === t.key; }).length; });
    document.querySelectorAll('[data-chip-count]').forEach(function (el) { el.textContent = totals[el.dataset.chipCount]; });
    document.querySelectorAll('.stat-line [data-count]').forEach(function (el) {
      var k = el.dataset.count;
      if (k === 'students') el.textContent = pubs.filter(function (p) { return p.querySelector('.pub-authors sup'); }).length;
      else if (totals[k] !== undefined) el.textContent = totals[k];
    });

    function escapeHtml(s) {
      return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
    }

    function highlight(part, q) {
      if (!q) { part.el.textContent = part.text; return; }
      var norm = normalise(part.text);
      var idx = norm.indexOf(q);
      if (idx === -1) { part.el.textContent = part.text; return; }
      part.el.innerHTML = escapeHtml(part.text.slice(0, idx)) + '<mark>' + escapeHtml(part.text.slice(idx, idx + q.length)) + '</mark>' + escapeHtml(part.text.slice(idx + q.length));
    }

    function apply(announceCount) {
      var q = normalise(state.q.trim());
      var shown = 0;
      pubs.forEach(function (pub) {
        var ok = (state.type === 'all' || pub.dataset.type === state.type) && (!q || pub._text.indexOf(q) !== -1);
        pub.classList.toggle('is-hidden', !ok);
        pub._parts.forEach(function (part) { highlight(part, ok ? q : ''); });
        if (ok) shown += 1;
      });
      groups.forEach(function (g) {
        var n = g.querySelectorAll('.pub:not(.is-hidden)').length;
        g.classList.toggle('is-empty', n === 0);
        var c = g.querySelector('[data-year-count]');
        if (c) c.textContent = n + (n === 1 ? ' item' : ' items');
        var link = document.querySelector('[data-year-link="' + g.dataset.yearGroup + '"]');
        if (link) {
          link.classList.toggle('is-empty', n === 0);
          var ln = link.querySelector('.n');
          if (ln) ln.textContent = n;
        }
      });
      if (empty) empty.hidden = shown !== 0;
      if (countEl) {
        var typeLabel = state.type === 'all' ? 'publications' : TYPES.filter(function (t) { return t.key === state.type; })[0].label.toLowerCase();
        var msg = shown === pubs.length ? 'Showing all ' + pubs.length + ' publications'
          : 'Showing ' + shown + ' of ' + pubs.length + ' ' + (state.type === 'all' ? 'publications' : '(' + typeLabel + ')');
        if (q) msg += ' matching “' + state.q.trim() + '”';
        if (announceCount !== false) countEl.textContent = msg;
      }
    }

    function setType(type) {
      state.type = type;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.filter === type)); });
      apply();
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () { setType(chip.dataset.filter); });
    });

    search.addEventListener('input', function () {
      state.q = search.value;
      window.clearTimeout(timer);
      timer = window.setTimeout(apply, 180);
    });
    search.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && search.value) { search.value = ''; state.q = ''; apply(); }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        search.value = '';
        state.q = '';
        setType('all');
        search.focus();
      });
    }

    // Deep link: publications.html?type=preprint&q=sediment
    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) { search.value = params.get('q'); state.q = search.value; }
    var t = params.get('type');
    if (t && totals[t] !== undefined) { setType(t); } else { apply(false); }
  }

  /* ----------------------------------------------------------------
   * Download the currently visible entries as a .bib file.
   * ---------------------------------------------------------------- */
  function initBibDownload() {
    var btn = document.getElementById('bib-download');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var visible = document.querySelectorAll('#pub-groups .pub:not(.is-hidden)');
      if (!visible.length) { announce('No publications to download.'); return; }
      var text = Array.prototype.map.call(visible, buildBibtex).join('\n\n') + '\n';
      var blob = new Blob([text], { type: 'application/x-bibtex' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'halloran-publications.bib';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      announce(visible.length + ' BibTeX entries downloaded.');
    });
  }

  /* ----------------------------------------------------------------
   * Publications-per-year chart, stacked by type, drawn as SVG
   * from the list on the page.
   * ---------------------------------------------------------------- */
  function initPubChart() {
    var host = document.getElementById('pub-chart');
    var legend = document.getElementById('pub-chart-legend');
    var pubs = document.querySelectorAll('#pub-groups .pub');
    if (!host || !pubs.length) return;

    var byYear = {};
    var minY = Infinity;
    var maxY = -Infinity;
    pubs.forEach(function (p) {
      var y = parseInt(p.dataset.year, 10);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      byYear[y] = byYear[y] || {};
      byYear[y][p.dataset.type] = (byYear[y][p.dataset.type] || 0) + 1;
    });
    var years = [];
    for (var y = minY; y <= maxY; y += 1) years.push(y);
    var totals = years.map(function (yr) {
      return TYPES.reduce(function (s, t) { return s + ((byYear[yr] || {})[t.key] || 0); }, 0);
    });
    var maxT = Math.max.apply(null, totals.concat([1]));

    var W = 360; var H = 170; var padL = 6; var padB = 22; var padT = 16;
    var slot = (W - padL * 2) / years.length;
    var bw = Math.min(26, slot * 0.6);
    var unit = (H - padB - padT) / maxT;

    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-labelledby': 'pub-chart-title pub-chart-desc' });
    var desc = svgEl('desc', { id: 'pub-chart-desc' });
    desc.textContent = years.map(function (yr, i) { return yr + ': ' + totals[i]; }).join(', ') + '.';
    svg.appendChild(desc);
    svg.appendChild(svgEl('line', { x1: 0, x2: W, y1: H - padB + 0.5, y2: H - padB + 0.5, stroke: cssVar('--rule-2') }));

    years.forEach(function (yr, i) {
      var x = padL + slot * i + (slot - bw) / 2;
      var yTop = H - padB;
      TYPES.forEach(function (t) {
        var n = (byYear[yr] || {})[t.key] || 0;
        if (!n) return;
        var h = n * unit;
        yTop -= h;
        var r = svgEl('rect', { x: x, y: yTop + 1, width: bw, height: Math.max(h - 1, 1), fill: cssVar(t.cssVar), rx: 1 });
        var tt = svgEl('title');
        tt.textContent = yr + ' · ' + t.label + ': ' + n;
        r.appendChild(tt);
        svg.appendChild(r);
      });
      var label = svgEl('text', { x: x + bw / 2, y: H - 6, 'text-anchor': 'middle' });
      label.textContent = "'" + String(yr).slice(2);
      svg.appendChild(label);
      if (totals[i]) {
        var tot = svgEl('text', { x: x + bw / 2, y: yTop - 4, 'text-anchor': 'middle', class: 'bar-total' });
        tot.textContent = totals[i];
        svg.appendChild(tot);
      }
    });
    host.appendChild(svg);

    if (legend) {
      TYPES.forEach(function (t) {
        var li = document.createElement('li');
        li.innerHTML = '<i style="background:var(' + t.cssVar + ')"></i>' + t.label;
        legend.appendChild(li);
      });
    }
  }

  /* ----------------------------------------------------------------
   * Research page: grant timeline drawn from the funding table.
   * ---------------------------------------------------------------- */
  function initGrantTimeline() {
    var host = document.getElementById('grant-timeline');
    var rows = document.querySelectorAll('#grant-table tbody tr[data-start]');
    if (!host || !rows.length) return;

    var data = Array.prototype.map.call(rows, function (tr) {
      return { label: tr.dataset.short, start: parseFloat(tr.dataset.start), end: parseFloat(tr.dataset.end), role: tr.dataset.role };
    }).sort(function (a, b) { return a.start - b.start; });

    var from = Math.floor(Math.min.apply(null, data.map(function (d) { return d.start; })));
    var to = Math.ceil(Math.max.apply(null, data.map(function (d) { return d.end; })));
    var W = 1000; var rowH = 32; var padL = 190; var padR = 12; var padT = 26;
    var H = padT + data.length * rowH + 8;
    var scale = function (v) { return padL + (v - from) / (to - from) * (W - padL - padR); };

    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Timeline of grants from ' + from + ' to ' + to + '. The same information is in the table below.' });

    for (var yr = from; yr <= to; yr += 1) {
      var gx = scale(yr);
      svg.appendChild(svgEl('line', { x1: gx, x2: gx, y1: padT - 6, y2: H - 4, stroke: cssVar('--rule'), 'stroke-width': 1 }));
      var yt = svgEl('text', { x: gx, y: 14, 'text-anchor': 'middle' });
      yt.textContent = yr;
      svg.appendChild(yt);
    }

    data.forEach(function (d, i) {
      var y = padT + i * rowH;
      var lbl = svgEl('text', { x: 0, y: y + 17, class: 'lbl' });
      lbl.textContent = d.label;
      svg.appendChild(lbl);
      var color = d.role === 'coi' ? cssVar('--t-conference') : cssVar('--accent');
      svg.appendChild(svgEl('rect', { x: scale(d.start), y: y + 6, width: Math.max(scale(d.end) - scale(d.start), 4), height: 14, rx: 2, fill: color, opacity: 0.9 }));
    });

    // "Today" marker
    var now = new Date();
    var t = now.getFullYear() + now.getMonth() / 12;
    if (t > from && t < to) {
      var tx = scale(t);
      svg.appendChild(svgEl('line', { x1: tx, x2: tx, y1: padT - 6, y2: H - 4, class: 'today', 'stroke-width': 1.5 }));
    }
    host.appendChild(svg);
  }

  /* ----------------------------------------------------------------
   * CV: paper size switch (A4 / US Letter) and print-to-PDF.
   * ---------------------------------------------------------------- */
  function initPrintCv() {
    var btn = document.getElementById('print-cv');
    var sheet = document.getElementById('cv');
    if (!btn || !sheet) return;

    var pageStyle = document.createElement('style');
    pageStyle.id = 'page-size';
    document.head.appendChild(pageStyle);

    function setPaper(paper) {
      sheet.dataset.paper = paper;
      pageStyle.textContent = paper === 'letter'
        ? '@page { size: letter; margin: 0.6in 0.65in 0.7in; }'
        : '@page { size: A4; margin: 16mm 16mm 18mm; }';
      // Page margins only; the running footer comes from the @page rule in style.css.
      try { localStorage.setItem('footnote-paper', paper); } catch (e) { /* storage unavailable */ }
    }

    var saved = null;
    try { saved = localStorage.getItem('footnote-paper'); } catch (e) { saved = null; }
    var radios = document.querySelectorAll('input[name="paper"]');
    radios.forEach(function (r) {
      if (saved && r.value === saved) r.checked = true;
      r.addEventListener('change', function () { if (r.checked) setPaper(r.value); });
    });
    setPaper(saved === 'letter' ? 'letter' : 'a4');

    btn.addEventListener('click', function () { window.print(); });
  }

  /* Boot ------------------------------------------------------------ */
  function init() {
    initNav();
    initStickyHeader();
    initReveal();
    initNewsToggle();
    initForms();
    initBibtex();
    initPublicationFilters();
    initBibDownload();
    initPubChart();
    initGrantTimeline();
    initPrintCv();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
