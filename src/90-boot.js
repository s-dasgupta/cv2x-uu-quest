/* ---------- boot ---------- */
(function boot() {
  const hot = window.claude && window.claude.hot;
  try { if (hot && typeof hot.snapshot === 'function') hot.snapshot(() => ({ hash: location.hash, idx: cur ? cur.idx : 0 })); } catch (e) { /* optional */ }
  const start = (data) => {
    if (data && data.idx != null && data.hash && data.hash === location.hash) pendingIdx = data.idx;
    route();
  };
  if (hot && typeof hot.ready === 'function') hot.ready(start);
  else start((hot && hot.data) || {});
})();
