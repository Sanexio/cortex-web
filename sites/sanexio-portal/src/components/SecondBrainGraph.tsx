import { useEffect, useRef, useState } from "react";
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

export function SecondBrainGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/graph.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((g: GraphData) => {
        if (!cancelled) setData(g);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    <section className="graph-section">
      <header className="graph-head">
        <h2 className="section-title">
          <span className="section-marker">04</span> Second Brain · Graph
        </h2>
        {data && (
          <p className="graph-stats">
            {data.stats.nodes} Knoten · {data.stats.edges} Kanten ·{" "}
            {data.stats.files_scanned} Files · Stand{" "}
            {new Date(data.generated_at).toLocaleString("de-DE")}
          </p>
        )}
        {!data && !error && <p className="graph-stats">Lade Graph …</p>}
        {error && (
          <p className="graph-stats graph-stats-error">
            Graph nicht geladen ({error}) — Run <code>npm run build:graph</code>
          </p>
        )}
      </header>
      <div ref={containerRef} className="graph-canvas" aria-label="Second-Brain-Graph" />
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
