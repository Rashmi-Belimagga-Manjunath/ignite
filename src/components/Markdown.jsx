import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({ gfm: true, breaks: true });

export default function Markdown({ text, className = "" }) {
  const html = DOMPurify.sanitize(marked.parse(text || "", { async: false }));
  return <div className={`md ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
