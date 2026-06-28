import { useEffect, useRef, useState } from "react";
import * as React from "react";

// Host fuer das cortex-harness Second-Brain-Plugin (1:1 Visual-Klon der
// Variante auf cortex-sanexio.tech). Plugin liegt als statisches Bundle
// unter /second-brain-plugin.js + /second-brain-plugin.css. Plugin
// erwartet window.__CORTEX_PLUGIN_SDK__ + window.__CORTEX_PLUGINS__.
//
// Daten-Routing: Plugin-API-Calls (/api/plugins/second-brain/*) werden
// von authedFetch auf den public Portal-Graph-Endpoint umgeleitet, weil
// das cortex-harness-API auth-gated ist. Tutorial- und Recent-Endpoints
// liefern leere Default-Responses.

const PUBLIC_GRAPH = "https://cortex-sanexio.tech/portal-graph.json";

function isGraphRequest(url: string): boolean {
  return /\/api\/plugins\/second-brain\/graph(\?|$)/.test(url);
}

function isCategoriesRequest(url: string): boolean {
  return /\/api\/plugins\/second-brain\/categories(\?|$)/.test(url);
}

async function fetchProxy(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (isGraphRequest(url)) {
    // Portal-Graph-JSON hat anderes Schema als cortex-harness /graph erwartet.
    // Transform: label->title, cluster->category, source/target->from/to.
    const raw = await fetch(PUBLIC_GRAPH, { ...init, cache: "no-store" });
    if (!raw.ok) return raw;
    const data = await raw.json() as {
      nodes: Array<{ id: string; label: string; cluster: string; degree: number; meta?: { kind?: string; head_sha?: string; head_subject?: string } }>;
      edges: Array<{ source: string; target: string }>;
      clusters?: Array<{ id: string; color: string }>;
      stats?: Record<string, number>;
    };
    const transformed = {
      built_at: Date.now() / 1000,
      scope: "brain",
      latest_mtime: 0,
      nodes: data.nodes.map((n) => ({
        id: n.id,
        source: "vault",
        title: n.label,
        category: n.cluster === "__repos" ? "Repositories" : (n.cluster || "Vault"),
        tags: [] as string[],
        type: n.cluster === "__repos" ? "repository" : "",
        path: n.id,
        size: Math.max(1, (n.degree || 0) * 100),
        mtime: Date.now() / 1000,
        out_degree: Math.max(1, n.degree || 1),
        in_degree: Math.max(1, n.degree || 1),
        degree: Math.max(2, (n.degree || 0) * 2),
        frontmatter: n.meta || {},
        markdown: n.label,
        body: n.label.toLowerCase(),
        aliases: [] as string[],
      })),
      edges: data.edges.map((e) => ({ from: e.source, to: e.target, kind: "wikilink", inferred: false })),
      stats: data.stats || {},
    };
    return new Response(JSON.stringify(transformed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (isCategoriesRequest(url)) {
    // Plugin erwartet Array direkt — keine wrapping object.
    return new Response("[]", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (/\/recent/.test(url) || /\/usage\/insights/.test(url)) {
    return new Response("[]", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  // Tutorial / Notes / Events / Usage — leere Stub-Responses
  return new Response(JSON.stringify({ items: [], state: {}, ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function fetchJSON(url: string): Promise<unknown> {
  const r = await fetchProxy(url);
  return r.json();
}

function buildWsUrl(_path: string): string {
  // Keine Websocket-Brigde — Plugin events/* nicht benoetigt im Portal.
  return "wss://localhost/disabled";
}

const SDK_GLOBAL = "__CORTEX_PLUGIN_SDK__" as const;
const REGISTRY_GLOBAL = "__CORTEX_PLUGINS__" as const;
const PLUGIN_ID = "second-brain";

// Plugin registriert eine React-Component direkt (kein Factory-Wrapper).
type PluginRegistry = {
  register: (id: string, component: React.ComponentType<unknown>) => void;
  _factories: Map<string, React.ComponentType<unknown>>;
};

declare global {
  interface Window {
    [SDK_GLOBAL]?: Record<string, unknown>;
    [REGISTRY_GLOBAL]?: PluginRegistry;
  }
}

let pluginLoadPromise: Promise<void> | null = null;

function ensurePluginLoaded(): Promise<void> {
  if (pluginLoadPromise) return pluginLoadPromise;
  pluginLoadPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("window not available"));
      return;
    }

    // SDK + Registry installieren
    window[SDK_GLOBAL] = {
      React,
      hooks: { useState, useEffect, useRef, useCallback: React.useCallback, useMemo: React.useMemo },
      fetchJSON,
      authedFetch: fetchProxy,
      buildWsUrl,
      components: { Card: "div", Badge: "span" },
    };
    window[REGISTRY_GLOBAL] = {
      _factories: new Map(),
      register(id: string, component: React.ComponentType<unknown>) {
        this._factories.set(id, component);
      },
    };

    // CSS
    const cssId = "second-brain-plugin-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "/second-brain-plugin.css";
      document.head.appendChild(link);
    }

    // JS
    const scriptId = "second-brain-plugin-js";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "/second-brain-plugin.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load second-brain-plugin.js"));
    document.body.appendChild(script);
  });
  return pluginLoadPromise;
}

export function SecondBrainPluginHost() {
  const [Component, setComponent] = useState<React.ComponentType<unknown> | null>(null);
  const [errMsg, setErrMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    ensurePluginLoaded()
      .then(() => {
        if (cancelled) return;
        const registry = window[REGISTRY_GLOBAL];
        const C = registry?._factories.get(PLUGIN_ID);
        if (!C) {
          setErrMsg("Plugin nicht registriert");
          return;
        }
        setComponent(() => C);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrMsg(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="graph-section section-accents">
      <header className="graph-head">
        <h2 className="section-title t-h4">
          <span className="section-marker">04</span> Second Brain · Graph
        </h2>
        {!Component && !errMsg && <span className="hero-meta-label">Lade Plugin …</span>}
        {errMsg && <span className="hero-meta-label">Plugin-Fehler: {errMsg}</span>}
      </header>
      <div className="sb-plugin-mount">
        {Component ? <Component /> : null}
      </div>
    </section>
  );
}
