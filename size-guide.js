(function () {
  function build(root) {
    root.querySelectorAll('table.sc-table').forEach(function (table) {
      if (table.dataset.scBuilt) return;
      table.dataset.scBuilt = '1';

      var headCells = Array.prototype.slice.call(table.querySelectorAll('thead tr th'));
      if (headCells.length < 2) return;
      var cornerLabel = table.dataset.label || headCells[0].textContent.trim();
      var sizeLabels = headCells.slice(1).map(function (th) { return th.textContent.trim(); });

      var rowsAll = Array.prototype.slice.call(table.querySelectorAll('tbody tr')).map(function (row) {
        return {
          label: row.querySelector('th').textContent.trim(),
          values: Array.prototype.slice.call(row.querySelectorAll('td')).map(function (td) { return td.textContent.trim(); })
        };
      });

      var titleRowIdx = table.dataset.cardTitleRow !== undefined ? parseInt(table.dataset.cardTitleRow, 10) : -1;
      var titleRow = titleRowIdx >= 0 ? rowsAll[titleRowIdx] : null;
      var attrs = titleRow ? rowsAll.filter(function (_, i) { return i !== titleRowIdx; }) : rowsAll;

      var cards = document.createElement('div');
      cards.className = 'sc-cards';

      sizeLabels.forEach(function (size, idx) {
        var values = attrs.map(function (a) { return a.values[idx] || '—'; });
        if (values.every(function (v) { return v === '—' || v === ''; })) return;

        var card = document.createElement('div');
        card.className = 'sc-card';

        var title = document.createElement('div');
        title.className = 'sc-card-title';
        if (titleRow) {
          title.innerHTML = escapeHtml(titleRow.values[idx] || '') +
            '<small>' + escapeHtml(cornerLabel + ' ' + size) + '</small>';
        } else {
          title.textContent = (cornerLabel + ' ' + size).trim();
        }
        card.appendChild(title);

        var body = document.createElement('div');
        body.className = 'sc-card-body';
        attrs.forEach(function (a, i) {
          var row = document.createElement('div');
          row.className = 'sc-card-row';
          row.innerHTML =
            '<span class="sc-k">' + escapeHtml(a.label) + '</span>' +
            '<span class="sc-v">' + escapeHtml(values[i] || '—') + '</span>';
          body.appendChild(row);
        });
        card.appendChild(body);
        cards.appendChild(card);
      });

      var wrap = table.closest('.sc-table-wrap');
      if (wrap) wrap.insertAdjacentElement('afterend', cards);
    });

    // Wire up jump-nav anchors to smooth-scroll within the guide itself
    // (so they work both standalone and inside a scrollable modal container)
    root.querySelectorAll('.sc-jump a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href').slice(1);
        var target = root.querySelector('[id="' + id + '"]');
        if (!target) return;
        e.preventDefault();
        var cs = getComputedStyle(root).overflowY;
        if (cs === 'auto' || cs === 'scroll') {
          var top = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 8;
          root.scrollTo({ top: top, behavior: 'smooth' });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function init() {
    document.querySelectorAll('.sc-sg').forEach(build);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
