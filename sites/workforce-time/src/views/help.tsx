// In-app help panel: table of contents (role-filtered) + rendered chapter.
// Markdown rendering is intentionally a small in-house parser instead of a
// dependency — the content is authored in this repo (src/help/content/) and
// only uses headings, paragraphs, lists, tables, blockquotes, bold and code.
import { useEffect, useMemo, type ReactNode } from "react";
import { BookOpen, X } from "lucide-react";
import { chapterById, chaptersForRole, type HelpChapter, type HelpRole } from "../help";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Split on **bold** and `code` spans; everything else is plain text.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    return <span key={key}>{part}</span>;
  });
}

function splitTableRow(line: string): string[] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderMarkdown(content: string): ReactNode[] {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  let blockKey = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(<h4 key={blockKey++}>{renderInline(trimmed.slice(4), `h${blockKey}`)}</h4>);
      index += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push(<h3 key={blockKey++}>{renderInline(trimmed.slice(3), `h${blockKey}`)}</h3>);
      index += 1;
      continue;
    }

    if (trimmed === "---") {
      blocks.push(<hr key={blockKey++} />);
      index += 1;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("> ")) {
        quoteLines.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push(
        <blockquote key={blockKey++}>
          {renderInline(quoteLines.join(" "), `q${blockKey}`)}
        </blockquote>
      );
      continue;
    }

    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      const [headerLine, ...rest] = tableLines;
      const bodyLines = rest.filter((row) => !/^\|[\s:|-]+\|$/.test(row));
      blocks.push(
        <table key={blockKey++}>
          <thead>
            <tr>
              {splitTableRow(headerLine).map((cell, cellIndex) => (
                <th key={cellIndex}>{renderInline(cell, `th${blockKey}-${cellIndex}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyLines.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {splitTableRow(row).map((cell, cellIndex) => (
                  <td key={cellIndex}>{renderInline(cell, `td${blockKey}-${rowIndex}-${cellIndex}`)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
      continue;
    }

    if (/^[-*] /.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*] /.test(lines[index].trim())) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push(
        <ul key={blockKey++}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item, `ul${blockKey}-${itemIndex}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\. /.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\. /.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\. /, ""));
        index += 1;
      }
      blocks.push(
        <ol key={blockKey++}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInline(item, `ol${blockKey}-${itemIndex}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph: consume consecutive plain lines.
    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (
        !current ||
        current.startsWith("#") ||
        current.startsWith("|") ||
        current.startsWith("> ") ||
        current === "---" ||
        /^[-*] /.test(current) ||
        /^\d+\. /.test(current)
      ) {
        break;
      }
      paragraphLines.push(current);
      index += 1;
    }
    blocks.push(<p key={blockKey++}>{renderInline(paragraphLines.join(" "), `p${blockKey}`)}</p>);
  }

  return blocks;
}

export function HelpPanel({
  chapterId,
  role,
  onSelect,
  onClose
}: {
  chapterId: string;
  role: HelpRole;
  onSelect: (chapterId: string) => void;
  onClose: () => void;
}) {
  const chapters = useMemo(() => chaptersForRole(role), [role]);
  const active: HelpChapter = chapterById(chapterId) ?? chapters[0];
  const rendered = useMemo(() => renderMarkdown(active.content), [active.content]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <section
        className="help-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Hilfe"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="dialog-header">
          <div className="help-title">
            <BookOpen size={18} />
            <div>
              <p className="eyebrow">Handbuch</p>
              <h2>{active.title}</h2>
            </div>
          </div>
          <button className="icon-button" type="button" aria-label="Hilfe schließen" onClick={onClose}>
            <X size={17} />
          </button>
        </header>
        <div className="help-layout">
          <nav className="help-toc" aria-label="Hilfe-Kapitel">
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                className={chapter.id === active.id ? "help-toc-item active" : "help-toc-item"}
                onClick={() => onSelect(chapter.id)}
              >
                <span>{chapter.title}</span>
                {!chapter.roles.includes("employee") ? <span className="help-badge">Admin</span> : null}
              </button>
            ))}
          </nav>
          <article className="help-content">{rendered}</article>
        </div>
      </section>
    </div>
  );
}
