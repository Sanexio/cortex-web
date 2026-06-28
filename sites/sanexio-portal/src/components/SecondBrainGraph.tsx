import { useCallback, useEffect, useRef, useState } from "react";
import cytoscape, { type Core, type ElementsDefinition } from "cytoscape";
// @ts-expect-error fcose ships without local declarations in current version
import fcose from "cytoscape-fcose";

cytoscape.use(fcose);

type GraphData = {
  generated_at: string;
  stats: {
    nodes: number;
    edges: number;
    files_scanned: number;
  };
  clusters: { id: string; color: string }[];
  nodes: { id: string; label: string; cluster: string; degree: number }[];
  edges: { source: string; target: string }[];
};

const FALLBACK_CLUSTER_COLOR = "#5e6166";
const REFRESH_INTERVAL_MS = 60_000;
// Dynamische Quelle: VPS regeneriert alle 5 Min via systemd-Timer
// (sanexio-portal-graph.timer), Caddy serviert das public mit CORS.
// Fallback: Vite-Middleware (Dev) + lokales Build-Artefakt (Preview).
const ENDPOINTS = [
  "https://cortex-sanexio.tech/portal-graph.json",
  "/api/graph",
  "/graph.json",
];

async function fetchGraph(signal: AbortSignal): Promise<GraphData> {
  let lastErr: unknown;
  for (const url of ENDPOINTS) {
    try {
      const r = await fetch(url, { signal, cache: "no-store" });
      if (!r.ok) {
        lastErr = new Error(`${url} → HTTP ${r.status}`);
        continue;
      }
      return (await r.json()) as GraphData;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("graph fetch failed");
}

export function SecondBrainGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const refresh = useCallback(async (manual = false) => {
    const ctl = new AbortController();
    if (manual) setRefreshing(true);
    try {
      const g = await fetchGraph(ctl.signal);
      setData((prev) => {
        if (
          prev &&
          prev.generated_at === g.generated_at &&
          prev.stats.nodes === g.stats.nodes &&
          prev.stats.edges === g.stats.edges
        ) {
          return prev;
        }
        return g;
      });
      setLastSync(new Date());
      setError(null);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError((e as Error).message);
      }
    } finally {
      if (manual) setRefreshing(false);
    }
    return ctl;
  }, []);

  // Initial-Fetch + Interval-Polling + Window-Focus-Refresh.
  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    void (async () => {
      await refresh(false);
      if (cancelled) return;
      interval = setInterval(() => void refresh(false), REFRESH_INTERVAL_MS);
    })();

    const onFocus = () => void refresh(false);
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  // Render Cytoscape whenever the data signature changes.
  useEffect(() => {
    if (!data || !containerRef.current) return;

    const clusterColors = new Map<string, string>();
    for (const c of data.clusters) clusterColors.set(c.id, c.color);

    const elements: ElementsDefinition = {
      nodes: data.nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label,
          cluster: n.cluster,
          degree: n.degree,
          color: clusterColors.get(n.cluster) ?? FALLBACK_CLUSTER_COLOR,
        },
      })),
      edges: data.edges
        .filter(
          (e) =>
            data.nodes.some((n) => n.id === e.source) &&
            data.nodes.some((n) => n.id === e.target)
        )
        .map((e) => ({
          data: { id: `${e.source}->${e.target}`, source: e.source, target: e.target },
        })),
    };

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            "border-color": "#0a0a0f",
            "border-width": 1,
            label: "data(label)",
            color: "#dde4ec",
            "font-family": "'IBM Plex Mono', monospace",
            "font-size": 10,
            "text-outline-color": "#0a0a0f",
            "text-outline-width": 2,
            "text-valign": "bottom",
            "text-margin-y": 6,
            "min-zoomed-font-size": 8,
            width: "mapData(degree, 0, 30, 8, 38)",
            height: "mapData(degree, 0, 30, 8, 38)",
          },
        },
        {
          selector: "edge",
          style: {
            width: 1,
            "line-color": "rgba(0, 240, 255, 0.16)",
            "curve-style": "haystack",
            opacity: 0.6,
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "#ffea00",
            "border-width": 3,
          },
        },
      ],
      layout: {
        name: "fcose",
        animate: false,
        nodeSeparation: 80,
        idealEdgeLength: 90,
        nodeRepulsion: 6500,
        gravity: 0.18,
      } as unknown as cytoscape.LayoutOptions,
      minZoom: 0.18,
      maxZoom: 2.2,
      wheelSensitivity: 0.25,
    });

    cyRef.current = cy;
    cy.fit(undefined, 32);

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [data]);

  return (
    <section className="graph-section section-accents">
      <header className="graph-head">
        <h2 className="section-title t-h4">
          <span className="section-marker">04</span> Second Brain · Graph
        </h2>
        <div className="graph-meta">
          {data && (
            <p className="graph-stats">
              {data.stats.nodes} Knoten · {data.stats.edges} Kanten ·{" "}
              {data.stats.files_scanned} Files
              {lastSync && (
                <>
                  {" "}
                  · sync {lastSync.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </>
              )}
            </p>
          )}
          {!data && !error && <p className="graph-stats">Lade Graph …</p>}
          {error && (
            <p className="graph-stats graph-stats-error">
              Graph nicht geladen ({error})
            </p>
          )}
          <button
            type="button"
            className="graph-refresh btn btn--outline"
            onClick={() => void refresh(true)}
            disabled={refreshing}
            aria-label="Graph aktualisieren"
            title="Vault neu scannen"
          >
            <span className={refreshing ? "spin" : ""} aria-hidden="true">
              ↻
            </span>
            {refreshing ? " sync …" : " sync"}
          </button>
        </div>
      </header>
      <div ref={containerRef} className="graph-canvas cyber-frame" aria-label="Second-Brain-Graph" />
      {data && (
        <ul className="graph-legend" aria-label="Cluster-Legende">
          {data.clusters.map((c) => (
            <li key={c.id} className="graph-legend-item">
              <span
                className="graph-legend-swatch"
                style={{ background: c.color }}
                aria-hidden="true"
              />
              {c.id}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
