(function () {
  "use strict";

  var sdk = window.__CORTEX_PLUGIN_SDK__;
  var registry = window.__CORTEX_PLUGINS__;
  if (!sdk || !registry) {
    console.error("Second Brain plugin: Cortex plugin SDK is unavailable");
    return;
  }

  var React = sdk.React;
  var h = React.createElement;
  var hooks = sdk.hooks;
  var fetchJSON = sdk.fetchJSON;
  var authedFetch = sdk.authedFetch || window.fetch.bind(window);
  var buildWsUrl = sdk.buildWsUrl;
  var UI = sdk.components || {};
  var Card = UI.Card || "div";
  var Badge = UI.Badge || "span";

  var palette = [
    "#f59e0b", "#14b8a6", "#60a5fa", "#f97316", "#a78bfa",
    "#22c55e", "#ef4444", "#eab308", "#06b6d4", "#f472b6"
  ];

  function colorFor(node, categories) {
    if (node.source === "memory") return "#38bdf8";
    if (node.source === "repo") return "#94a3b8";
    var index = categories.indexOf(node.category);
    return palette[Math.abs(index) % palette.length];
  }

  function postUsage(payload) {
    try {
      return authedFetch("/api/plugins/second-brain/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(function () {});
    } catch (_) {
      return Promise.resolve();
    }
  }

  function resolveWsUrl(path) {
    try {
      var value = buildWsUrl(path);
      if (value && typeof value.then === "function") return value;
      return Promise.resolve(value);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  function useSecondBrainData(filters) {
    var _a = hooks.useState({ nodes: [], edges: [], stats: {}, built_at: null }), graph = _a[0], setGraph = _a[1];
    var _b = hooks.useState([]), categories = _b[0], setCategories = _b[1];
    var _c = hooks.useState(null), error = _c[0], setError = _c[1];
    var _d = hooks.useState(true), loading = _d[0], setLoading = _d[1];

    hooks.useEffect(function () {
      var cancelled = false;
      setLoading(true);
      var scope = filters.scope === "repo" ? "repo" : "brain";
      var params = new URLSearchParams();
      params.set("source", filters.source || "all");
      params.set("scope", scope);
      if (filters.category) params.set("category", filters.category);
      if (filters.q) params.set("q", filters.q);
      Promise.all([
        fetchJSON("/api/plugins/second-brain/graph?" + params.toString()),
        fetchJSON("/api/plugins/second-brain/categories?scope=" + scope)
      ]).then(function (values) {
        if (cancelled) return;
        setGraph(values[0]);
        setCategories(values[1]);
        setError(null);
      }).catch(function (err) {
        if (!cancelled) setError(err.message || String(err));
      }).finally(function () {
        if (!cancelled) setLoading(false);
      });
      return function () { cancelled = true; };
    }, [filters.source, filters.category, filters.q, filters.scope]);

    return { graph: graph, categories: categories, error: error, loading: loading };
  }

  function GraphCanvas(props) {
    var canvasRef = hooks.useRef(null);
    var stateRef = hooks.useRef({
      nodes: [],
      edges: [],
      positions: new Map(),
      velocities: new Map(),
      hover: null,
      dragging: null,
      pan: { x: 0, y: 0 },
      zoom: 1,
      pointer: { x: 0, y: 0 },
      frame: 0
    });

    hooks.useEffect(function () {
      var canvas = canvasRef.current;
      if (!canvas) return;
      var state = stateRef.current;
      state.nodes = props.nodes || [];
      state.edges = props.edges || [];
      var rect = canvas.getBoundingClientRect();
      state.nodes.forEach(function (node, i) {
        if (!state.positions.has(node.id)) {
          var angle = (i / Math.max(1, state.nodes.length)) * Math.PI * 2;
          state.positions.set(node.id, {
            x: Math.cos(angle) * Math.min(rect.width, rect.height) * 0.35,
            y: Math.sin(angle) * Math.min(rect.width, rect.height) * 0.35
          });
          state.velocities.set(node.id, { x: 0, y: 0 });
        }
      });
    }, [props.nodes, props.edges]);

    hooks.useEffect(function () {
      var canvas = canvasRef.current;
      if (!canvas || !props.selectedId) return;
      var state = stateRef.current;
      var pos = state.positions.get(props.selectedId);
      if (!pos) return;
      state.zoom = Math.max(0.7, Math.min(1.8, state.zoom));
      state.pan.x = -pos.x * state.zoom;
      state.pan.y = -pos.y * state.zoom;
    }, [props.selectedId]);

    hooks.useEffect(function () {
      var canvas = canvasRef.current;
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      var state = stateRef.current;
      var categories = (props.categories || []).map(function (c) { return c.category; });
      var nodeById = new Map();
      (props.nodes || []).forEach(function (node) { nodeById.set(node.id, node); });

      function resize() {
        var rect = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        canvas.height = Math.max(1, Math.floor(rect.height * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      function clampZoom(value) {
        return Math.max(0.1, Math.min(6, value));
      }

      function radius(node) {
        return 6 + Math.min(18, Math.sqrt(Math.max(1, node.degree || 1)) * 3);
      }

      function worldPoint(evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: (evt.clientX - rect.left - rect.width / 2 - state.pan.x) / state.zoom,
          y: (evt.clientY - rect.top - rect.height / 2 - state.pan.y) / state.zoom
        };
      }

      function screenPoint(pos) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: rect.width / 2 + state.pan.x + pos.x * state.zoom,
          y: rect.height / 2 + state.pan.y + pos.y * state.zoom
        };
      }

      function zoomAtScreen(screenX, screenY, nextZoom) {
        var rect = canvas.getBoundingClientRect();
        var worldX = (screenX - rect.width / 2 - state.pan.x) / state.zoom;
        var worldY = (screenY - rect.height / 2 - state.pan.y) / state.zoom;
        var zoom = clampZoom(nextZoom);
        state.zoom = zoom;
        state.pan.x = screenX - rect.width / 2 - worldX * zoom;
        state.pan.y = screenY - rect.height / 2 - worldY * zoom;
      }

      function zoomAtCenter(factor) {
        var rect = canvas.getBoundingClientRect();
        zoomAtScreen(rect.width / 2, rect.height / 2, state.zoom * factor);
      }

      function fitGraph() {
        var rect = canvas.getBoundingClientRect();
        if (!state.nodes.length || rect.width <= 0 || rect.height <= 0) {
          state.zoom = 1;
          state.pan.x = 0;
          state.pan.y = 0;
          return;
        }
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        state.nodes.forEach(function (node) {
          var pos = state.positions.get(node.id);
          if (!pos) return;
          minX = Math.min(minX, pos.x);
          minY = Math.min(minY, pos.y);
          maxX = Math.max(maxX, pos.x);
          maxY = Math.max(maxY, pos.y);
        });
        if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) return;
        var width = Math.max(1, maxX - minX);
        var height = Math.max(1, maxY - minY);
        var padding = 96;
        var nextZoom = clampZoom(Math.min(
          (rect.width - padding) / width,
          (rect.height - padding) / height
        ));
        if (!isFinite(nextZoom) || nextZoom <= 0) nextZoom = 1;
        state.zoom = nextZoom;
        state.pan.x = -((minX + maxX) / 2) * nextZoom;
        state.pan.y = -((minY + maxY) / 2) * nextZoom;
      }

      function pick(evt) {
        var p = worldPoint(evt);
        var best = null;
        var bestDistance = Infinity;
        state.nodes.forEach(function (node) {
          var pos = state.positions.get(node.id);
          if (!pos) return;
          var dx = pos.x - p.x;
          var dy = pos.y - p.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < radius(node) / state.zoom + 7 && d < bestDistance) {
            best = node;
            bestDistance = d;
          }
        });
        return best;
      }

      function tick() {
        var nodes = state.nodes;
        var positions = state.positions;
        var velocities = state.velocities;
        for (var i = 0; i < nodes.length; i += 1) {
          for (var j = i + 1; j < nodes.length; j += 1) {
            var a = positions.get(nodes[i].id);
            var b = positions.get(nodes[j].id);
            if (!a || !b) continue;
            var dx = b.x - a.x;
            var dy = b.y - a.y;
            var dist2 = Math.max(80, dx * dx + dy * dy);
            var force = 2400 / dist2;
            var dist = Math.sqrt(dist2);
            var fx = (dx / dist) * force;
            var fy = (dy / dist) * force;
            var va = velocities.get(nodes[i].id);
            var vb = velocities.get(nodes[j].id);
            va.x -= fx; va.y -= fy; vb.x += fx; vb.y += fy;
          }
        }
        state.edges.forEach(function (edge) {
          var a = positions.get(edge.from);
          var b = positions.get(edge.to);
          if (!a || !b) return;
          var dx = b.x - a.x;
          var dy = b.y - a.y;
          var dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          var target = edge.kind === "moc" ? 90 : 150;
          var force = (dist - target) * 0.012;
          var fx = (dx / dist) * force;
          var fy = (dy / dist) * force;
          var va = velocities.get(edge.from);
          var vb = velocities.get(edge.to);
          if (va && state.dragging !== edge.from) { va.x += fx; va.y += fy; }
          if (vb && state.dragging !== edge.to) { vb.x -= fx; vb.y -= fy; }
        });
        nodes.forEach(function (node) {
          var pos = positions.get(node.id);
          var vel = velocities.get(node.id);
          if (!pos || !vel || state.dragging === node.id) return;
          vel.x = (vel.x - pos.x * 0.0008) * 0.84;
          vel.y = (vel.y - pos.y * 0.0008) * 0.84;
          pos.x += vel.x;
          pos.y += vel.y;
        });
      }

      function draw() {
        var rect = canvas.getBoundingClientRect();
        var focusIds = null;
        if (props.selectedId) {
          focusIds = new Set([props.selectedId]);
          state.edges.forEach(function (edge) {
            if (edge.from === props.selectedId) focusIds.add(edge.to);
            if (edge.to === props.selectedId) focusIds.add(edge.from);
          });
        }
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.save();
        ctx.translate(rect.width / 2 + state.pan.x, rect.height / 2 + state.pan.y);
        ctx.scale(state.zoom, state.zoom);
        ctx.lineWidth = 1 / state.zoom;
        state.edges.forEach(function (edge) {
          var a = state.positions.get(edge.from);
          var b = state.positions.get(edge.to);
          if (!a || !b) return;
          var inFocus = !focusIds || (focusIds.has(edge.from) && focusIds.has(edge.to));
          ctx.beginPath();
          if (edge.inferred || edge.kind === "inferred") ctx.setLineDash([7 / state.zoom, 5 / state.zoom]);
          else ctx.setLineDash([]);
          ctx.strokeStyle = edge.kind === "moc"
            ? (inFocus ? "rgba(245,158,11,.62)" : "rgba(245,158,11,.16)")
            : (inFocus ? "rgba(226,232,240,.42)" : "rgba(148,163,184,.12)");
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        });
        ctx.setLineDash([]);
        state.nodes.forEach(function (node) {
          var pos = state.positions.get(node.id);
          if (!pos) return;
          var r = radius(node);
          var selected = props.selectedId === node.id;
          var highlighted = props.query && node.title.toLowerCase().indexOf(props.query.toLowerCase()) >= 0;
          var inFocus = !focusIds || focusIds.has(node.id);
          ctx.beginPath();
          ctx.fillStyle = colorFor(node, categories);
          ctx.globalAlpha = selected || highlighted ? 1 : (inFocus ? 0.86 : 0.22);
          ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.lineWidth = (selected ? 4 : node.type === "moc" ? 3 : 1.5) / state.zoom;
          ctx.strokeStyle = selected ? "#fef3c7" : (node.type === "moc" ? "#f59e0b" : "rgba(255,255,255,.45)");
          ctx.stroke();
          if (highlighted) {
            ctx.beginPath();
            ctx.lineWidth = 2 / state.zoom;
            ctx.strokeStyle = "#fef08a";
            ctx.arc(pos.x, pos.y, r + 5, 0, Math.PI * 2);
            ctx.stroke();
          }
        });
        ctx.restore();
        if (state.hover) {
          var hoverPos = state.positions.get(state.hover.id);
          if (hoverPos) {
            var sp = screenPoint(hoverPos);
            var label = state.hover.title + " · " + state.hover.source + " · " + (state.hover.degree || 0);
            ctx.font = "12px system-ui, sans-serif";
            var width = ctx.measureText(label).width + 18;
            ctx.fillStyle = "rgba(15,23,42,.92)";
            ctx.fillRect(sp.x + 12, sp.y - 30, width, 26);
            ctx.fillStyle = "#fde68a";
            ctx.fillText(label, sp.x + 21, sp.y - 13);
          }
        }
      }

      function animate() {
        tick();
        draw();
        state.frame = window.requestAnimationFrame(animate);
      }

      var pointerDown = false;
      var last = null;
      var moved = false;
      function onPointerDown(evt) {
        canvas.setPointerCapture(evt.pointerId);
        pointerDown = true;
        last = { x: evt.clientX, y: evt.clientY };
        moved = false;
        var picked = pick(evt);
        state.dragging = picked ? picked.id : null;
      }
      function onPointerMove(evt) {
        var p = worldPoint(evt);
        if (pointerDown && last) {
          var mx = evt.clientX - last.x;
          var my = evt.clientY - last.y;
          if (Math.sqrt(mx * mx + my * my) > 3) moved = true;
        }
        if (pointerDown && state.dragging) {
          state.positions.set(state.dragging, p);
          state.velocities.set(state.dragging, { x: 0, y: 0 });
        } else if (pointerDown && last) {
          state.pan.x += evt.clientX - last.x;
          state.pan.y += evt.clientY - last.y;
          last = { x: evt.clientX, y: evt.clientY };
        } else {
          state.hover = pick(evt);
        }
      }
      function onPointerUp(evt) {
        canvas.releasePointerCapture(evt.pointerId);
        var picked = state.dragging ? nodeById.get(state.dragging) : pick(evt);
        pointerDown = false;
        state.dragging = null;
        last = null;
        if (picked && !moved) props.onSelect(picked.id);
      }
      function onWheel(evt) {
        if (!(evt.ctrlKey || evt.metaKey)) return;
        evt.preventDefault();
        var rect = canvas.getBoundingClientRect();
        var factor = evt.deltaY > 0 ? 0.9 : 1.1;
        zoomAtScreen(evt.clientX - rect.left, evt.clientY - rect.top, state.zoom * factor);
      }
      function onZoomIn() {
        zoomAtCenter(1.22);
      }
      function onZoomOut() {
        zoomAtCenter(1 / 1.22);
      }
      function onFit() {
        fitGraph();
      }

      resize();
      var resizeObserver = null;
      if (typeof window.ResizeObserver !== "undefined") {
        resizeObserver = new window.ResizeObserver(resize);
        resizeObserver.observe(canvas);
      }
      window.addEventListener("resize", resize);
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("wheel", onWheel, { passive: false });
      if (props.controlsRef) {
        props.controlsRef.current = {
          zoomIn: onZoomIn,
          zoomOut: onZoomOut,
          fit: onFit
        };
      }
      animate();
      return function () {
        window.cancelAnimationFrame(state.frame);
        if (resizeObserver) resizeObserver.disconnect();
        window.removeEventListener("resize", resize);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("wheel", onWheel);
        if (props.controlsRef) props.controlsRef.current = null;
      };
    }, [props.nodes, props.edges, props.selectedId, props.query, props.categories, props.controlsRef]);

    return h("canvas", { ref: canvasRef, className: "sb-graph-canvas" });
  }

  function NoteModal(props) {
    var SPLIT_RATIO_STORAGE_KEY = "sb-note-split-ratio";
    var SPLIT_RATIO_CSS_VAR = "--sb-note-split";
    var QUEUE_POLL_INTERVAL_MS = 8000;
    var _noteText = hooks.useState(""), noteText = _noteText[0], setNoteText = _noteText[1];
    var _saveStatus = hooks.useState(""), saveStatus = _saveStatus[0], setSaveStatus = _saveStatus[1];
    var _processStatus = hooks.useState(""), processStatus = _processStatus[0], setProcessStatus = _processStatus[1];
    var _processing = hooks.useState(false), processing = _processing[0], setProcessing = _processing[1];
    var _processResult = hooks.useState(null), processResult = _processResult[0], setProcessResult = _processResult[1];
    var _processError = hooks.useState(false), processError = _processError[0], setProcessError = _processError[1];
    var _queueEntries = hooks.useState([]), queueEntries = _queueEntries[0], setQueueEntries = _queueEntries[1];
    var _archUi = hooks.useState({}), archUi = _archUi[0], setArchUi = _archUi[1];
    var _historyOpen = hooks.useState(false), historyOpen = _historyOpen[0], setHistoryOpen = _historyOpen[1];
    var _historyEntries = hooks.useState([]), historyEntries = _historyEntries[0], setHistoryEntries = _historyEntries[1];
    var _historyExpanded = hooks.useState({}), historyExpanded = _historyExpanded[0], setHistoryExpanded = _historyExpanded[1];
    var _activeArchExpanded = hooks.useState(false), activeArchExpanded = _activeArchExpanded[0], setActiveArchExpanded = _activeArchExpanded[1];
    var _activeArchItems = hooks.useState([]), activeArchItems = _activeArchItems[0], setActiveArchItems = _activeArchItems[1];
    var _splitRatio = hooks.useState(0.667), splitRatio = _splitRatio[0], setSplitRatio = _splitRatio[1];
    var debounceTimerRef = hooks.useRef(null);
    var loadedNoteIdRef = hooks.useRef(null);
    var skipSaveRef = hooks.useRef(false);
    var modalRef = hooks.useRef(null);
    var splitterDragCleanupRef = hooks.useRef(null);
    var queuePollRef = hooks.useRef(null);
    var processFlashTimerRef = hooks.useRef(null);

    function clampSplitRatio(value) {
      if (!isFinite(value)) return 0.667;
      return Math.max(0.25, Math.min(0.8, value));
    }

    function splitRatioStyle(value) {
      var ratio = clampSplitRatio(value);
      return {
        "--sb-note-split": ratio,
        "--sb-note-split-left": (ratio * 100) + "%"
      };
    }

    function readStoredSplitRatio() {
      try {
        var stored = window.localStorage && window.localStorage.getItem(SPLIT_RATIO_STORAGE_KEY);
        var parsed = stored === null ? 0.667 : parseFloat(stored);
        return clampSplitRatio(parsed);
      } catch (_) {
        return 0.667;
      }
    }

    function persistSplitRatio(value) {
      try {
        if (window.localStorage) window.localStorage.setItem(SPLIT_RATIO_STORAGE_KEY, String(clampSplitRatio(value)));
      } catch (_) {}
    }

    function clearSplitterDrag() {
      if (splitterDragCleanupRef.current) {
        splitterDragCleanupRef.current();
        splitterDragCleanupRef.current = null;
      }
    }

    function clearQueuePolling() {
      if (queuePollRef.current) {
        window.clearInterval(queuePollRef.current);
        queuePollRef.current = null;
      }
    }

    function clearProcessFlashTimer() {
      if (processFlashTimerRef.current) {
        window.clearTimeout(processFlashTimerRef.current);
        processFlashTimerRef.current = null;
      }
    }

    function hasActiveQueueEntry(entries, noteId) {
      var prefix = noteId + "#";
      return (entries || []).some(function (entry) {
        return entry && entry.id && entry.id.indexOf(prefix) === 0 && (entry.status === "approved" || entry.status === "in_progress");
      });
    }

    function fetchQueueEntries(noteId) {
      var encodedNoteId = encodeURIComponent(noteId);
      return fetchJSON("/api/plugins/second-brain/notes/" + encodedNoteId + "/queue")
        .then(function (payload) {
          var entries = Array.isArray(payload) ? payload : [];
          setQueueEntries(entries);
          updateActiveArchItems(historyEntries, entries, noteId);
          if (!hasActiveQueueEntry(entries, noteId)) clearQueuePolling();
          return entries;
        });
    }

    function ensureQueuePolling(noteId) {
      if (!noteId || queuePollRef.current) return;
      queuePollRef.current = window.setInterval(function () {
        fetchQueueEntries(noteId).catch(function () {});
      }, QUEUE_POLL_INTERVAL_MS);
    }

    function isActiveArchStatus(status) {
      return status === "approved" || status === "in_progress" || status === "blocked";
    }

    function queueEntryForHistoryItem(entries, noteId, index) {
      var queueId = noteId + "#" + index;
      for (var i = 0; i < (entries || []).length; i += 1) {
        if (entries[i] && entries[i].id === queueId) return entries[i];
      }
      return null;
    }

    function collectActiveArchItems(history, entries, noteId) {
      var active = [];
      (history || []).forEach(function (entry) {
        (entry.items || []).forEach(function (item, index) {
          if (!item || item.typ !== "architektur_aenderung") return;
          var queued = queueEntryForHistoryItem(entries, noteId, index);
          var status = (queued && queued.status) || item.status || (item.approved ? "approved" : "");
          if (!isActiveArchStatus(status)) return;
          active.push({
            title: item.eingabe || "Architektur-Auftrag",
            plan: item.plan || item.eingabe || "",
            status: status,
            ts: entry.ts
          });
        });
      });
      return active;
    }

    function updateActiveArchItems(history, entries, noteId) {
      if (!noteId) {
        setActiveArchItems([]);
        return [];
      }
      var active = collectActiveArchItems(history, entries, noteId);
      setActiveArchItems(active);
      return active;
    }

    function loadNoteHistory(noteId) {
      if (!noteId) return Promise.resolve([]);
      var encodedNoteId = encodeURIComponent(noteId);
      return fetchJSON("/api/plugins/second-brain/notes/" + encodedNoteId + "/history")
        .then(function (payload) {
          var history = payload && Array.isArray(payload.history) ? payload.history : [];
          setHistoryEntries(history);
          updateActiveArchItems(history, queueEntries, noteId);
          return history;
        });
    }

    function showHistoryPanel() {
      setHistoryOpen(true);
    }

    function hideHistoryPanel() {
      setHistoryOpen(false);
      setHistoryExpanded({});
    }

    hooks.useEffect(function () {
      if (!props.open) return function () {};
      function onKeyDown(evt) {
        if (evt.key === "Escape") props.onClose();
      }
      document.addEventListener("keydown", onKeyDown);
      return function () { document.removeEventListener("keydown", onKeyDown); };
    }, [props.open, props.onClose]);

    hooks.useEffect(function () {
      if (!props.open) {
        clearSplitterDrag();
        clearQueuePolling();
        return function () {};
      }
      setSplitRatio(readStoredSplitRatio());
      return function () {
        clearSplitterDrag();
        clearQueuePolling();
      };
    }, [props.open]);

    hooks.useEffect(function () {
      var noteId = props.note && props.note.id;
      if (!props.open || !noteId) {
        loadedNoteIdRef.current = null;
        skipSaveRef.current = true;
        setNoteText("");
        setSaveStatus("");
        setProcessStatus("");
        setProcessResult(null);
        setProcessError(false);
        setProcessing(false);
        setQueueEntries([]);
        setArchUi({});
        setHistoryOpen(false);
        setHistoryEntries([]);
        setHistoryExpanded({});
        setActiveArchItems([]);
        clearQueuePolling();
        clearProcessFlashTimer();
        return function () {};
      }
      var cancelled = false;
      var encodedNoteId = encodeURIComponent(noteId);
      loadedNoteIdRef.current = null;
      skipSaveRef.current = true;
      setNoteText("");
      setSaveStatus("");
      setProcessStatus("");
      setProcessResult(null);
      setProcessError(false);
      setProcessing(false);
      setQueueEntries([]);
      setArchUi({});
      setHistoryOpen(false);
      setHistoryEntries([]);
      setHistoryExpanded({});
      setActiveArchItems([]);
      clearProcessFlashTimer();
      fetchJSON("/api/plugins/second-brain/notes/" + encodedNoteId)
        .then(function (payload) {
          if (cancelled) return;
          loadedNoteIdRef.current = noteId;
          skipSaveRef.current = true;
          setNoteText(String((payload && payload.text) || ""));
          setSaveStatus(payload && payload.text ? "gespeichert" : "");
        })
        .catch(function () {
          if (!cancelled) {
            loadedNoteIdRef.current = noteId;
            skipSaveRef.current = true;
            setNoteText("");
            setSaveStatus("");
          }
        });
      loadNoteHistory(noteId).catch(function () {});
      fetchJSON("/api/plugins/second-brain/notes/" + encodedNoteId + "/process")
        .then(function (payload) {
          if (!cancelled && payload && Array.isArray(payload.items) && payload.items.length) {
            setProcessResult(payload);
          }
        })
        .catch(function () {});
      fetchJSON("/api/plugins/second-brain/notes/" + encodedNoteId + "/queue")
        .then(function (payload) {
          if (!cancelled) {
            var entries = Array.isArray(payload) ? payload : [];
            setQueueEntries(entries);
            updateActiveArchItems(historyEntries, entries, noteId);
            if (hasActiveQueueEntry(entries, noteId)) ensureQueuePolling(noteId);
          }
        })
        .catch(function () {});
      return function () {
        cancelled = true;
        clearQueuePolling();
      };
    }, [props.open, props.note && props.note.id]);

    hooks.useEffect(function () {
      var noteId = props.note && props.note.id;
      if (!props.open || !noteId || !hasActiveQueueEntry(queueEntries, noteId)) {
        clearQueuePolling();
        return function () {};
      }
      ensureQueuePolling(noteId);
      return function () {};
    }, [props.open, props.note && props.note.id, queueEntries]);

    hooks.useEffect(function () {
      var noteId = props.note && props.note.id;
      if (!props.open || !noteId) return function () {};
      updateActiveArchItems(historyEntries, queueEntries, noteId);
      return function () {};
    }, [props.open, props.note && props.note.id, historyEntries, queueEntries]);

    hooks.useEffect(function () {
      var noteId = props.note && props.note.id;
      if (!props.open || !noteId || loadedNoteIdRef.current !== noteId) return function () {};
      if (skipSaveRef.current) {
        skipSaveRef.current = false;
        return function () {};
      }
      if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = window.setTimeout(function () {
        var encodedNoteId = encodeURIComponent(noteId);
        setSaveStatus("speichert…");
        fetchJSON("/api/plugins/second-brain/notes/" + encodedNoteId, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: noteText })
        }).then(function () {
          setSaveStatus("gespeichert");
        }).catch(function (err) {
          setSaveStatus((err && err.message) || "Fehler beim Speichern");
        });
      }, 600);
      return function () {
        if (debounceTimerRef.current) {
          window.clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
      };
    }, [props.open, props.note && props.note.id, noteText]);

    function processAnnotation() {
      var noteId = props.note && props.note.id;
      if (!noteId || processing) return;
      var encodedNoteId = encodeURIComponent(noteId);
      setProcessing(true);
      setProcessError(false);
      setProcessStatus("");
      fetchJSON("/api/plugins/second-brain/notes/" + encodedNoteId + "/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }).then(function (payload) {
        setProcessResult(payload && Array.isArray(payload.items) ? payload : null);
        setNoteText("");
        loadNoteHistory(noteId).then(function (history) {
          var active = updateActiveArchItems(history, queueEntries, noteId);
          var returnedItems = payload && Array.isArray(payload.items) ? payload.items : [];
          var hasReturnedArch = returnedItems.some(function (item) {
            return item && item.typ === "architektur_aenderung";
          });
          if (active.length || hasReturnedArch) {
            setProcessStatus("");
          } else {
            setProcessStatus("✓ Erledigt – im Verlauf");
            clearProcessFlashTimer();
            processFlashTimerRef.current = window.setTimeout(function () {
              setProcessStatus("");
              processFlashTimerRef.current = null;
            }, 2000);
          }
        }).catch(function () {
          setProcessResult(null);
          setProcessStatus("✓ Erledigt – im Verlauf");
        });
        if (payload && payload.tutorial_updated && props.onRefreshNote) {
          props.onRefreshNote();
        }
      }).catch(function (err) {
        setProcessError(true);
        setProcessStatus((err && err.message) || "Fehler beim Verarbeiten");
      }).finally(function () {
        setProcessing(false);
      });
    }

    function truncateText(value, maxLength) {
      var text = String(value || "");
      if (text.length <= maxLength) return text;
      return text.slice(0, maxLength) + "...";
    }

    function formatHistoryTs(value) {
      if (!value) return "";
      var date = new Date(value);
      if (isNaN(date.getTime())) return String(value);
      return date.toLocaleDateString("de-DE") + " " + date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    }

    function historyBadgeForType(typ) {
      if (typ === "frage") return h("span", { className: "sb-history-badge sb-badge-frage" }, "Frage");
      if (typ === "tutorial_aenderung") return h("span", { className: "sb-history-badge sb-badge-tutorial" }, "Tutorial");
      if (typ === "architektur_aenderung") return h("span", { className: "sb-history-badge sb-badge-arch" }, "Architektur");
      return null;
    }

    function renderStatusBadge(status) {
      if (!status) return null;
      return h("span", { className: "sb-history-badge sb-badge-arch" }, status);
    }

    function toggleHistoryEntry(index) {
      setHistoryExpanded(function (current) {
        var next = {};
        Object.keys(current || {}).forEach(function (key) { next[key] = current[key]; });
        next[index] = !next[index];
        return next;
      });
    }

    function renderHistoryItemDetail(item, index) {
      if (!item) return null;
      if (item.typ === "frage") {
        return h("div", { key: index, className: "sb-history-detail" },
          h("strong", null, item.eingabe || "Frage"),
          h("p", null, item.antwort || "")
        );
      }
      if (item.typ === "tutorial_aenderung") {
        return h("div", { key: index, className: "sb-history-detail" },
          h("strong", null, "Tutorial-Aenderung"),
          h("p", null, item.eingabe || "")
        );
      }
      if (item.typ === "architektur_aenderung") {
        var noteId = props.note && props.note.id;
        var queued = noteId ? queueEntryForHistoryItem(queueEntries, noteId, index) : null;
        var status = (queued && queued.status) || item.status || (item.approved ? "approved" : "");
        return h("div", { key: index, className: "sb-history-detail" },
          h("strong", null, item.eingabe || "Architektur-Auftrag"),
          renderStatusBadge(status),
          h("p", null, item.plan || item.eingabe || "")
        );
      }
      return null;
    }

    function renderHistoryEntry(entry, index) {
      var items = Array.isArray(entry.items) ? entry.items : [];
      var expanded = !!historyExpanded[index];
      return h("div", {
        key: index,
        className: "sb-history-entry",
        onClick: function () { toggleHistoryEntry(index); }
      },
        h("div", { className: "sb-history-ts" }, formatHistoryTs(entry.ts)),
        h("div", { className: "sb-history-eingabe" }, truncateText(entry.eingabe, 80)),
        h("div", null, items.map(function (item) { return historyBadgeForType(item && item.typ); })),
        expanded ? h("div", { className: "sb-history-expanded" }, items.map(renderHistoryItemDetail)) : h("div", { className: "sb-history-preview" },
          items.map(function (item, itemIndex) {
            if (!item) return null;
            if (item.typ === "frage") return h("p", { key: itemIndex }, truncateText(item.antwort, 100));
            if (item.typ === "architektur_aenderung") {
              var noteId = props.note && props.note.id;
              var queued = noteId ? queueEntryForHistoryItem(queueEntries, noteId, itemIndex) : null;
              var status = (queued && queued.status) || item.status || (item.approved ? "approved" : "");
              return h("p", { key: itemIndex }, truncateText(item.plan || item.eingabe, 100), " ", renderStatusBadge(status));
            }
            return null;
          })
        )
      );
    }

    function renderHistoryPanel() {
      return h("div", { className: "sb-history-panel" },
        h("button", { type: "button", className: "sb-back-btn", onClick: hideHistoryPanel }, "← Zurück"),
        h("h3", { className: "sb-note-annotations-title" }, "Verlauf"),
        historyEntries.length ? historyEntries.map(renderHistoryEntry) : h("div", { className: "sb-history-eingabe" }, "Noch kein Verlauf.")
      );
    }

    function renderActiveArchWidget() {
      if (!activeArchItems.length) return null;
      return h("div", { className: "sb-arch-widget" },
        h("button", {
          type: "button",
          className: "sb-arch-widget-toggle",
          onClick: function () { setActiveArchExpanded(!activeArchExpanded); }
        }, "🏗 ", activeArchItems.length, " Architektur-Auftrag(e) aktiv"),
        activeArchExpanded ? h("div", { className: "sb-arch-widget-list" },
          activeArchItems.map(function (item, index) {
            return h("div", { key: index, className: "sb-arch-widget-item" },
              h("strong", null, truncateText(item.title, 80)),
              renderStatusBadge(item.status),
              h("p", null, truncateText(item.plan, 140))
            );
          })
        ) : null
      );
    }

    function updateArchUi(index, patch) {
      setArchUi(function (current) {
        var next = {};
        Object.keys(current || {}).forEach(function (key) { next[key] = current[key]; });
        next[index] = Object.assign({}, next[index] || {}, patch);
        return next;
      });
    }

    function queueEntryFor(noteId, index) {
      var queueId = noteId + "#" + index;
      for (var i = 0; i < queueEntries.length; i += 1) {
        if (queueEntries[i] && queueEntries[i].id === queueId) return queueEntries[i];
      }
      return null;
    }

    function renderQueueBadge(entry) {
      if (!entry || !entry.status) return null;
      var status = String(entry.status);
      var label = null;
      var detail = "";
      if (status === "approved") label = "✓ Freigegeben — in Warteschlange, wird von Claude bearbeitet";
      if (status === "in_progress") label = "⟳ Wird gerade umgesetzt…";
      if (status === "done") {
        label = "✓ Erledigt";
        if (entry.result && entry.result.summary) detail += " " + entry.result.summary;
        if (entry.result && entry.result.commit) detail += " · " + String(entry.result.commit).slice(0, 7);
      }
      if (status === "rejected") {
        label = "✗ Abgelehnt";
        if (entry.reason) detail += " " + entry.reason;
        if (entry.result && entry.result.reason) detail += " " + entry.result.reason;
      }
      if (status === "blocked") {
        label = "⏸ Blockiert — wartet auf deine Klärung";
        if (entry.result && entry.result.summary) detail += " " + entry.result.summary;
      }
      if (!label) return null;
      return h("div", { className: "sb-queue-status sb-queue-status-" + status }, label, detail);
    }

    function approveArchitectureItem(index) {
      var noteId = props.note && props.note.id;
      if (!noteId) return;
      var encodedNoteId = encodeURIComponent(noteId);
      updateArchUi(index, { approving: true, status: "" });
      fetchJSON("/api/plugins/second-brain/notes/" + encodedNoteId + "/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_index: index })
      }).then(function (payload) {
        var items = processResult && processResult.items ? processResult.items.slice() : [];
        if (items[index]) items[index] = Object.assign({}, items[index], { approved: true });
        setProcessResult(Object.assign({}, processResult || {}, { items: items }));
        setQueueEntries(function (current) {
          var queueId = noteId + "#" + index;
          var next = (current || []).slice();
          var found = false;
          var nextStatus = (payload && payload.status) || "approved";
          for (var i = 0; i < next.length; i += 1) {
            if (next[i] && next[i].id === queueId) {
              next[i] = Object.assign({}, next[i], { status: nextStatus, result: next[i].result || null });
              found = true;
            }
          }
          if (!found) {
            next.push({ id: queueId, note_id: noteId, status: nextStatus, result: null });
          }
          if (nextStatus === "approved" || nextStatus === "in_progress") ensureQueuePolling(noteId);
          return next;
        });
        updateArchUi(index, {
          approving: false,
          status: "✓ Freigegeben — in Warteschlange, wird von Claude bearbeitet"
        });
      }).catch(function (err) {
        updateArchUi(index, { approving: false, status: (err && err.message) || "Fehler bei der Freigabe" });
      });
    }

    function startSplitDrag(evt) {
      var modal = modalRef.current;
      if (!modal) return;
      evt.preventDefault();
      clearSplitterDrag();
      function updateFromPointer(pointerEvt) {
        var rect = modal.getBoundingClientRect();
        if (!rect.width) return;
        var nextRatio = clampSplitRatio((pointerEvt.clientX - rect.left) / rect.width);
        setSplitRatio(nextRatio);
        modal.style.setProperty(SPLIT_RATIO_CSS_VAR, String(nextRatio));
        modal.style.setProperty("--sb-note-split-left", (nextRatio * 100) + "%");
      }
      function onPointerMove(pointerEvt) {
        updateFromPointer(pointerEvt);
      }
      function onPointerUp(pointerEvt) {
        updateFromPointer(pointerEvt);
        var nextValue = modal.style.getPropertyValue(SPLIT_RATIO_CSS_VAR);
        persistSplitRatio(parseFloat(nextValue));
        clearSplitterDrag();
      }
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      splitterDragCleanupRef.current = function () {
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
      };
      updateFromPointer(evt);
    }

    function reviseArchitectureItem(index) {
      var noteId = props.note && props.note.id;
      var ui = archUi[index] || {};
      var feedback = String(ui.feedback || "").trim();
      if (!noteId || !feedback) return;
      var encodedNoteId = encodeURIComponent(noteId);
      updateArchUi(index, { revising: true, status: "überarbeite…" });
      fetchJSON("/api/plugins/second-brain/notes/" + encodedNoteId + "/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_index: index, feedback: feedback })
      }).then(function (payload) {
        var items = processResult && processResult.items ? processResult.items.slice() : [];
        if (items[index]) {
          items[index] = Object.assign({}, items[index], { plan: (payload && payload.plan) || "" });
          delete items[index].approved;
        }
        setProcessResult(Object.assign({}, processResult || {}, { items: items }));
        setQueueEntries(function (current) {
          var queueId = noteId + "#" + index;
          return (current || []).filter(function (entry) {
            return !entry || entry.id !== queueId;
          });
        });
        updateArchUi(index, { revising: false, showRevise: false, feedback: "", status: "" });
      }).catch(function (err) {
        updateArchUi(index, { revising: false, status: (err && err.message) || "Fehler bei der Ueberarbeitung" });
      });
    }

    function renderProcessResult() {
      var items = processResult && processResult.items ? processResult.items : [];
      if (!items.length) return null;
      return h("div", { id: "sb-process-result" },
        items.map(function (item, index) {
          if (item.typ === "frage") {
            return h("div", { key: index, className: "sb-result-item sb-result-frage" },
              h("div", { className: "sb-result-label" }, "Frage"),
              h("strong", null, item.eingabe || "Frage"),
              h("p", null, item.antwort || "")
            );
          }
          if (item.typ === "tutorial_aenderung") {
            return h("div", { key: index, className: "sb-result-item sb-result-tutorial" },
              h("div", { className: "sb-result-label" }, "Tutorial-Aenderung"),
              h("strong", null, processResult.tutorial_updated ? "Ins Tutorial eingearbeitet" : "Vorschlag (nicht automatisch uebernommen)"),
              item.eingabe ? h("p", null, item.eingabe) : null
            );
          }
          if (item.typ === "architektur_aenderung") {
            var noteId = props.note && props.note.id;
            var entry = noteId ? queueEntryFor(noteId, index) : null;
            var ui = archUi[index] || {};
            var approved = !!item.approved || (entry && entry.status === "approved") || (entry && entry.status === "in_progress") || (entry && entry.status === "done");
            return h("div", { key: index, className: "sb-result-item sb-result-architektur" },
              h("div", { className: "sb-result-label" }, "Architektur-Aenderung"),
              h("strong", null, "Wartet auf deine Freigabe (Stufe B)"),
              renderQueueBadge(entry),
              h("p", null, item.plan || item.eingabe || ""),
              h("div", null,
                h("button", {
                  type: "button",
                  className: "sb-approve-btn",
                  "data-item-index": index,
                  disabled: approved || ui.approving || ui.revising,
                  onClick: function () { approveArchitectureItem(index); }
                }, ui.approving ? "Freigabe..." : "Freigabe"),
                h("button", {
                  type: "button",
                  className: "sb-revise-btn",
                  "data-item-index": index,
                  disabled: ui.approving || ui.revising,
                  onClick: function () { updateArchUi(index, { showRevise: !ui.showRevise, status: "" }); }
                }, "Änderung")
              ),
              ui.showRevise ? h("div", { className: "sb-revise-area" },
                h("textarea", {
                  value: ui.feedback || "",
                  disabled: ui.revising,
                  onChange: function (evt) { updateArchUi(index, { feedback: evt.target.value }); },
                  "aria-label": "Feedback zur Plan-Aenderung"
                }),
                h("button", {
                  type: "button",
                  className: "sb-revise-btn",
                  disabled: ui.revising || !String(ui.feedback || "").trim(),
                  onClick: function () { reviseArchitectureItem(index); }
                }, "Absenden")
              ) : null,
              ui.status ? h("div", { className: "sb-status-line" }, ui.status) : null
            );
          }
          return null;
        })
      );
    }

    if (!props.open) return null;
    if (!props.note) {
      return h("div", {
        className: "sb-modal-backdrop",
        onClick: function (evt) { if (evt.target === evt.currentTarget) props.onClose(); }
      },
        h("aside", { className: "sb-note-modal sb-note-empty" },
          h("button", { type: "button", className: "sb-modal-close", onClick: props.onClose, "aria-label": "Schliessen" }, "x"),
          "Notiz lädt"
        )
      );
    }
    var note = props.note;
    function chip(node) {
      return h("button", { key: node.id, className: "sb-chip", onClick: function () { props.onSelect(node.id); } }, node.title);
    }
    return h("div", {
      className: "sb-modal-backdrop",
      onClick: function (evt) { if (evt.target === evt.currentTarget) props.onClose(); }
    },
      h("aside", {
        ref: modalRef,
        className: "sb-note-modal",
        role: "dialog",
        "aria-modal": "true",
        style: splitRatioStyle(splitRatio)
      },
        h("div", { className: "sb-note-head" },
          h("div", null,
            h("h2", null, note.title),
            h("div", { className: "sb-note-meta" }, note.source, " · ", note.category)
          ),
          h("div", { className: "sb-note-actions" },
            h(Badge, { className: "sb-source-badge" }, note.source),
            h("button", { type: "button", className: "sb-modal-close", onClick: props.onClose, "aria-label": "Schliessen" }, "x")
          )
        ),
        h("div", { className: "sb-note-modal-body" },
          h("div", { className: "sb-note-col-left" },
            h("div", { className: "sb-markdown", dangerouslySetInnerHTML: { __html: note.html || "" } }),
            h("div", { className: "sb-link-section" },
              h("h3", null, "Nachbarn"),
              h("div", { className: "sb-chip-row" }, (note.neighbors || []).map(chip))
            ),
            h("div", { className: "sb-link-grid" },
              h("div", null, h("h3", null, "Backlinks"), h("div", { className: "sb-chip-row" }, (note.backlinks || []).map(chip))),
              h("div", null, h("h3", null, "Outlinks"), h("div", { className: "sb-chip-row" }, (note.outlinks || []).map(chip)))
            )
          ),
          h("div", {
            className: "sb-note-splitter",
            role: "separator",
            "aria-orientation": "vertical",
            "aria-label": "Spaltenbreite anpassen",
            onPointerDown: startSplitDrag
          }),
          h("div", { className: "sb-note-col-right" },
            historyOpen ? renderHistoryPanel() : [
              h("div", { key: "head", className: "sb-note-annotations-head" },
                h("div", { className: "sb-note-annotations-title-wrap" },
                  h("h3", { className: "sb-note-annotations-title" }, "Meine Anmerkungen"),
                  h("button", {
                    type: "button",
                    className: "sb-history-btn",
                    onClick: function () {
                      var noteId = props.note && props.note.id;
                      loadNoteHistory(noteId).then(showHistoryPanel).catch(function (err) {
                        setProcessError(true);
                        setProcessStatus((err && err.message) || "Fehler beim Laden des Verlaufs");
                      });
                    }
                  }, "⏱")
                ),
                h("div", { className: "sb-save-status" }, saveStatus)
              ),
              h("textarea", {
                key: "textarea",
                className: "sb-note-textarea",
                value: noteText,
                onChange: function (evt) { setNoteText(evt.target.value); },
                "aria-label": "Meine Anmerkungen"
              }),
              h("button", {
                key: "process",
                type: "button",
                className: "sb-process-btn",
                disabled: processing,
                onClick: processAnnotation
              }, processing ? "Verarbeitet..." : "Verarbeiten"),
              h("div", { key: "status", className: "sb-process-status" + (processError ? " sb-process-status-error" : "") + (processStatus === "✓ Erledigt – im Verlauf" ? " sb-flash-ok" : "") }, processStatus),
              renderActiveArchWidget(),
              renderProcessResult()
            ]
          )
        )
      )
    );
  }

  function TutorialTab(props) {
    var state = props.state || { last_learned: [], open_gaps: [], change_log: [] };
    var insights = props.insights || { gap_suggestions: [], hot_notes: [], failed_searches: [] };
    var notes = props.notes || [];
    function itemText(item) {
      return item.title || item.query || item.node_id || item.path || "Eintrag";
    }
    return h("div", { className: "sb-tutorial" },
      h("div", { className: "sb-tutorial-head" },
        h("div", null,
          h("h2", null, "Tutorial"),
          h("div", { className: "sb-note-meta" }, props.liveStatus || "Bereit")
        ),
        h("button", { type: "button", className: "sb-action-button", onClick: props.onLearn, disabled: props.learning }, props.learning ? "Laeuft" : "Jetzt nachlernen")
      ),
      h("div", { className: "sb-tutorial-grid" },
        h(Card, { className: "sb-panel" },
          h("h3", null, "Notizen ", h("small", { className: "sb-note-count" }, notes.length)),
          h("div", { className: "sb-note-list" },
            props.loading ? h("div", { className: "sb-note-row-meta" }, "Index laedt") :
              notes.length ? notes.slice(0, 40).map(function (node) {
                return h("button", {
                  key: node.id,
                  type: "button",
                  className: "sb-note-row",
                  onClick: function () { props.onSelectNote(node.id); }
                },
                  h("span", { className: "sb-note-row-title" }, node.title),
                  h("span", { className: "sb-note-row-meta" }, node.source + (node.category ? " · " + node.category : ""))
                );
              }) : h("div", { className: "sb-note-row-meta" }, "Keine Notizen fuer diesen Filter.")
          )
        ),
        h(Card, { className: "sb-panel" },
          h("h3", null, "Gelernte Punkte"),
          h("ul", null, (state.last_learned || []).slice(0, 12).map(function (item, index) {
            return h("li", { key: index }, String(item));
          }))
        ),
        h(Card, { className: "sb-panel" },
          h("h3", null, "Offene Luecken"),
          h("ul", null, (state.open_gaps || insights.gap_suggestions || []).slice(0, 12).map(function (item, index) {
            return h("li", { key: index }, itemText(item), item.reason ? h("span", null, " · " + item.reason) : null);
          }))
        ),
        h(Card, { className: "sb-panel" },
          h("h3", null, "Nutzungs-Signale"),
          h("ul", null,
            (insights.hot_notes || []).slice(0, 8).map(function (item) {
              return h("li", { key: item.id }, item.title + " · " + item.visits + " Besuche");
            }),
            (insights.failed_searches || []).slice(0, 5).map(function (item) {
              return h("li", { key: "q-" + item.query }, "Suche ohne Treffer: " + item.query + " (" + item.count + ")");
            })
          )
        ),
        h(Card, { className: "sb-panel" },
          h("h3", null, "Change-Log"),
          h("ul", null, (state.change_log || []).slice().reverse().slice(0, 10).map(function (item, index) {
            var date = item.ts ? new Date(item.ts * 1000).toLocaleString() : "";
            return h("li", { key: index }, date, item.path ? " · " + item.path : "", item.changed === false ? " · unveraendert" : "");
          }))
        )
      )
    );
  }

  function RecentTab(props) {
    var items = props.items || [];
    function fmtTs(ts) {
      if (!ts) return "";
      var d = new Date(ts * 1000);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("de-DE") + " " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
    }
    function badgeClass(kind, source) {
      var key = kind === "file" ? ("file-" + (source || "repo")) : kind;
      return "sb-recent-badge sb-recent-badge-" + key;
    }
    return h("div", { className: "sb-recent" },
      h("div", { className: "sb-tutorial-head" },
        h("div", null,
          h("h2", null, "Last used"),
          h("div", { className: "sb-note-meta" }, "Zuletzt geändert oder vermerkt · " + items.length + " Einträge")
        ),
        h("button", { type: "button", className: "sb-action-button", onClick: props.onRefresh, disabled: props.loading }, props.loading ? "Lädt" : "Aktualisieren")
      ),
      props.loading && !items.length ? h("div", { className: "sb-note-row-meta" }, "Lädt…") :
        items.length ? h("div", { className: "sb-recent-list" },
          items.map(function (it, index) {
            var clickable = !!it.node_id;
            return h(clickable ? "button" : "div", {
              key: index,
              type: clickable ? "button" : undefined,
              className: "sb-recent-row" + (clickable ? " sb-recent-row-clickable" : ""),
              onClick: clickable ? function () { props.onSelectNote(it.node_id); } : undefined
            },
              h("div", { className: "sb-recent-row-head" },
                h("span", { className: badgeClass(it.kind, it.source) }, it.label || it.kind),
                h("span", { className: "sb-recent-row-title" }, it.title || it.node_id || "Eintrag"),
                h("span", { className: "sb-recent-row-ts" }, fmtTs(it.ts))
              ),
              it.detail ? h("div", { className: "sb-recent-row-detail" }, it.detail) : null,
              h("div", { className: "sb-recent-row-meta" }, [it.category, it.path].filter(Boolean).join(" · "))
            );
          })
        ) : h("div", { className: "sb-note-row-meta" }, "Noch keine Aktivität.")
    );
  }

  function SecondBrainDashboard() {
    var _tab = hooks.useState("graph"), activeTab = _tab[0], setActiveTab = _tab[1];
    var _a = hooks.useState(""), query = _a[0], setQuery = _a[1];
    var _b = hooks.useState("all"), source = _b[0], setSource = _b[1];
    var _c = hooks.useState(""), category = _c[0], setCategory = _c[1];
    var _d = hooks.useState(null), selectedId = _d[0], setSelectedId = _d[1];
    var _e = hooks.useState(null), note = _e[0], setNote = _e[1];
    var _f = hooks.useState(null), tutorialState = _f[0], setTutorialState = _f[1];
    var _g = hooks.useState(null), usageInsights = _g[0], setUsageInsights = _g[1];
    var _h = hooks.useState("Live bereit"), liveStatus = _h[0], setLiveStatus = _h[1];
    var _i = hooks.useState(false), learning = _i[0], setLearning = _i[1];
    var _j = hooks.useState(false), modalOpen = _j[0], setModalOpen = _j[1];
    var _k = hooks.useState(false), fullscreen = _k[0], setFullscreen = _k[1];
    var _l = hooks.useState("brain"), scope = _l[0], setScope = _l[1];
    var _m = hooks.useState(null), catPanel = _m[0], setCatPanel = _m[1];
    var _n = hooks.useState({ items: [], loading: false, loaded: false }), recent = _n[0], setRecent = _n[1];
    var graphRef = hooks.useRef(null);
    var graphControlsRef = hooks.useRef(null);
    var data = useSecondBrainData({ q: query, source: source, category: category, scope: scope });

    function switchScope(next) {
      if (next === scope) return;
      setScope(next);
      setCategory("");
      if (next === "brain" && source === "repo") setSource("all");
    }

    function refreshTutorial() {
      return Promise.all([
        fetchJSON("/api/plugins/second-brain/tutorial/state"),
        fetchJSON("/api/plugins/second-brain/usage/insights")
      ]).then(function (values) {
        setTutorialState(values[0]);
        setUsageInsights(values[1]);
      }).catch(function () {});
    }

    function refreshRecent() {
      setRecent(function (cur) { return Object.assign({}, cur, { loading: true }); });
      return fetchJSON("/api/plugins/second-brain/recent?limit=80")
        .then(function (payload) {
          setRecent({ items: (payload && payload.items) || [], loading: false, loaded: true });
        })
        .catch(function () {
          setRecent(function (cur) { return Object.assign({}, cur, { loading: false, loaded: true }); });
        });
    }

    function selectNode(id, action) {
      setSelectedId(id);
      setModalOpen(true);
      postUsage({ node_id: id, action: action || "navigate" });
    }

    function refreshSelectedNote() {
      if (!selectedId) return Promise.resolve();
      return fetchJSON("/api/plugins/second-brain/note/" + encodeURIComponent(selectedId))
        .then(function (payload) {
          setNote(payload);
          return payload;
        });
    }

    function toggleFullscreen() {
      var el = graphRef.current;
      if (!el || !document.fullscreenEnabled) return;
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(function () {});
      } else {
        el.requestFullscreen().catch(function () {});
      }
    }

    hooks.useEffect(function () {
      if (!selectedId) { setNote(null); return; }
      var cancelled = false;
      fetchJSON("/api/plugins/second-brain/note/" + encodeURIComponent(selectedId))
        .then(function (payload) {
          if (!cancelled) {
            setNote(payload);
            postUsage({ node_id: selectedId, action: "view" });
          }
        })
        .catch(function () { if (!cancelled) setNote(null); });
      return function () { cancelled = true; };
    }, [selectedId]);

    hooks.useEffect(function () {
      if (!query || query.trim().length < 2) return;
      var handle = window.setTimeout(function () {
        postUsage({ action: "search", query: query.trim(), good_match: ((data.graph.nodes || []).length > 0) });
      }, 550);
      return function () { window.clearTimeout(handle); };
    }, [query, data.graph.nodes]);

    hooks.useEffect(function () {
      refreshTutorial();
    }, []);

    hooks.useEffect(function () {
      if (activeTab === "last_used") refreshRecent();
    }, [activeTab]);

    hooks.useEffect(function () {
      function onFullscreenChange() {
        setFullscreen(document.fullscreenElement === graphRef.current);
      }
      document.addEventListener("fullscreenchange", onFullscreenChange);
      return function () { document.removeEventListener("fullscreenchange", onFullscreenChange); };
    }, []);

    hooks.useEffect(function () {
      if (!modalOpen) return function () {};
      function onKeyDown(evt) {
        if (evt.key === "Escape") setModalOpen(false);
      }
      document.addEventListener("keydown", onKeyDown);
      return function () { document.removeEventListener("keydown", onKeyDown); };
    }, [modalOpen]);

    hooks.useEffect(function () {
      var ws = null;
      var closed = false;
      if (!buildWsUrl || typeof window.WebSocket === "undefined") return function () {};
      resolveWsUrl("/api/plugins/second-brain/events").then(function (url) {
        if (closed) return;
        ws = new window.WebSocket(url);
        ws.onmessage = function (evt) {
          try {
            var payload = JSON.parse(evt.data);
            (payload.events || []).forEach(function (event) {
              if (event.kind === "index_updated") setLiveStatus("Index aktualisiert");
              if (event.kind === "tutorial_updated") {
                setLiveStatus("Tutorial aktualisiert");
                refreshTutorial();
              }
            });
          } catch (_) {}
        };
      }).catch(function () {});
      return function () {
        closed = true;
        if (ws) ws.close();
      };
    }, []);

    function triggerLearn() {
      setLearning(true);
      setLiveStatus("Lernjob startet");
      fetchJSON("/api/plugins/second-brain/tutorial/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apply: false, max_notes: 8 })
      }).then(function (payload) {
        setLiveStatus("Lernjob gestartet · PID " + payload.pid);
      }).catch(function (err) {
        setLiveStatus(err.message || "Lernjob fehlgeschlagen");
      }).finally(function () {
        setLearning(false);
        refreshTutorial();
      });
    }

    var categoryOptions = data.categories || [];
    function renderToolbar(extraClassName) {
      return h("div", { className: "sb-toolbar" + (extraClassName ? " " + extraClassName : "") },
        h("div", { className: "sb-scope-toggle", role: "group", "aria-label": "Graph-Umfang" },
          h("button", {
            type: "button",
            className: "sb-filter-chip" + (scope === "brain" ? " sb-filter-chip-active" : ""),
            title: "Kuratiertes Second Brain: Vault + Memory",
            onClick: function () { switchScope("brain"); }
          }, "Brain"),
          h("button", {
            type: "button",
            className: "sb-filter-chip" + (scope === "repo" ? " sb-filter-chip-active" : ""),
            title: "Repo-Gesamtansicht: zusaetzlich alle Nexus-Repo-Dokumente",
            onClick: function () { switchScope("repo"); }
          }, "Repo")
        ),
        h("input", {
          className: "sb-search",
          placeholder: "Suchen",
          value: query,
          onChange: function (evt) { setQuery(evt.target.value); }
        }),
        h("select", { className: "sb-select", value: source, onChange: function (evt) { setSource(evt.target.value); } },
          h("option", { value: "all" }, "Alle Quellen"),
          h("option", { value: "vault" }, "Vault"),
          h("option", { value: "memory" }, "Memory"),
          scope === "repo" ? h("option", { value: "repo" }, "Repo-Doku") : null
        ),
        h("select", { className: "sb-select", value: category, onChange: function (evt) { setCategory(evt.target.value); } },
          h("option", { value: "" }, "Alle Kategorien"),
          categoryOptions.map(function (cat) {
            return h("option", { key: cat.category, value: cat.category }, cat.category + " (" + cat.count + ")");
          })
        ),
        h("button", { type: "button", className: "sb-action-button", onClick: function () { setQuery(""); setSource("all"); setCategory(""); } }, "Reset"),
        activeTab === "graph" ? h("button", { type: "button", className: "sb-action-button", onClick: toggleFullscreen }, fullscreen ? "Fenster" : "Fullscreen") : null,
        h("div", { className: "sb-status" },
          data.loading ? "Index lädt" : ((data.graph.stats && data.graph.stats.filtered_nodes) || 0) + " Knoten",
          data.graph.built_at ? " · " + new Date(data.graph.built_at * 1000).toLocaleString() : "",
          " · ", liveStatus
        )
      );
    }
    function renderFilters(extraClassName) {
      return h("div", { className: "sb-filter-row" + (extraClassName ? " " + extraClassName : "") },
        (scope === "repo" ? ["all", "vault", "memory", "repo"] : ["all", "vault", "memory"]).map(function (item) {
          return h("button", {
            key: item,
            className: "sb-filter-chip" + (source === item ? " sb-filter-chip-active" : ""),
            onClick: function () { setSource(item); }
          }, item === "all" ? "Alle" : item);
        }),
        categoryOptions.slice(0, 12).map(function (cat) {
          return h("button", {
            key: cat.category,
            className: "sb-filter-chip" + (category === cat.category ? " sb-filter-chip-active" : ""),
            onClick: function () { setCategory(cat.category); setCatPanel(cat.category); }
          }, cat.category);
        })
      );
    }
    return h("div", { className: "sb-root" },
      h("div", { className: "sb-tabs" },
        h("div", { className: "sb-tab-list" },
          h("button", { type: "button", onClick: function () { setActiveTab("graph"); }, className: "sb-tab" + (activeTab === "graph" ? " sb-tab-active" : "") }, "Graph"),
          h("button", { type: "button", onClick: function () { setActiveTab("tutorial"); }, className: "sb-tab" + (activeTab === "tutorial" ? " sb-tab-active" : "") }, "Tutorial"),
          h("button", { type: "button", onClick: function () { setActiveTab("last_used"); }, className: "sb-tab" + (activeTab === "last_used" ? " sb-tab-active" : "") }, "Last used")
        )
      ),
      data.error ? h("div", { className: "sb-error" }, data.error) : null,
      activeTab === "tutorial" ? h(React.Fragment, null,
        renderToolbar(""),
        renderFilters(""),
        h(TutorialTab, {
          state: tutorialState,
          insights: usageInsights,
          liveStatus: liveStatus,
          learning: learning,
          onLearn: triggerLearn,
          notes: data.graph.nodes || [],
          onSelectNote: function (id) { selectNode(id, "navigate"); },
          loading: data.loading
        })
      ) : activeTab === "last_used" ? h(RecentTab, {
        items: recent.items,
        loading: recent.loading,
        onRefresh: refreshRecent,
        onSelectNote: function (id) { selectNode(id, "navigate"); }
      }) : h("div", { className: "sb-main" },
        h("div", { className: "sb-graph-card", ref: graphRef },
          h("div", { className: "sb-graph-overlay" },
            renderToolbar("sb-toolbar-compact"),
            renderFilters("sb-filter-row-compact")
          ),
          h(GraphCanvas, {
            nodes: data.graph.nodes || [],
            edges: data.graph.edges || [],
            categories: categoryOptions,
            selectedId: selectedId,
            query: query,
            controlsRef: graphControlsRef,
            onSelect: function (id) { selectNode(id, "navigate"); }
          }),
          h("div", { className: "sb-zoom-controls" },
            h("button", { type: "button", onClick: function () { if (graphControlsRef.current) graphControlsRef.current.zoomIn(); }, "aria-label": "Vergroessern" }, "+"),
            h("button", { type: "button", onClick: function () { if (graphControlsRef.current) graphControlsRef.current.zoomOut(); }, "aria-label": "Verkleinern" }, "-"),
            h("button", { type: "button", onClick: function () { if (graphControlsRef.current) graphControlsRef.current.fit(); } }, "Fit")
          ),
          h("div", { className: "sb-legend" },
            h("span", null, "Vault"),
            h("span", { className: "sb-dot sb-dot-memory" }),
            h("span", null, "Memory"),
            scope === "repo" ? h("span", { className: "sb-dot", style: { background: "#94a3b8" } }) : null,
            scope === "repo" ? h("span", null, "Repo") : null,
            h("span", { className: "sb-dashed" }),
            h("span", null, "inferred")
          )
        )
      ),
      catPanel ? h("div", {
        className: "sb-modal-backdrop",
        onClick: function (evt) { if (evt.target === evt.currentTarget) setCatPanel(null); }
      },
        h("aside", { className: "sb-note-modal sb-cat-panel", role: "dialog", "aria-modal": "true" },
          h("div", { className: "sb-note-head" },
            h("div", null,
              h("h2", { className: "sb-cat-title" }, catPanel),
              h("div", { className: "sb-note-meta" },
                data.loading ? "laedt…"
                  : ((data.graph.nodes || []).filter(function (n) { return n.category === catPanel; }).length + " Eintraege"))
            ),
            h("button", { type: "button", className: "sb-modal-close", onClick: function () { setCatPanel(null); }, "aria-label": "Schliessen" }, "x")
          ),
          h("div", { className: "sb-note-list sb-cat-list" },
            data.loading
              ? h("div", { className: "sb-note-row-meta" }, "Index laedt")
              : (function () {
                  var items = (data.graph.nodes || []).filter(function (n) { return n.category === catPanel; });
                  if (!items.length) return h("div", { className: "sb-note-row-meta" }, "Keine Eintraege in dieser Kategorie.");
                  return items.slice(0, 200).map(function (node) {
                    return h("button", {
                      key: node.id,
                      type: "button",
                      className: "sb-note-row",
                      onClick: function () { selectNode(node.id, "navigate"); }
                    },
                      h("span", { className: "sb-note-row-title" }, node.title),
                      h("span", { className: "sb-note-row-meta" }, node.source));
                  });
                })()
          )
        )
      ) : null,
      h(NoteModal, {
        open: modalOpen,
        note: note,
        onClose: function () { setModalOpen(false); },
        onSelect: function (id) { selectNode(id, "navigate"); },
        onRefreshNote: refreshSelectedNote
      })
    );
  }

  registry.register("second-brain", SecondBrainDashboard);
}());
