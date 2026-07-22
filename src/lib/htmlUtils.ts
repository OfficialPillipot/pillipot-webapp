/**
 * Utility functions for cleaning and parsing rich text HTML (such as Quill.js output).
 */

export function cleanQuillHtml(html: string | null | undefined): string {
  if (!html) return "";

  let cleaned = html.trim();

  // If no HTML tags exist, wrap plain text line breaks in paragraphs
  if (!/<[a-z][\s\S]*>/i.test(cleaned)) {
    return cleaned
      .split(/\n\s*\n/)
      .map((para) => `<p>${para.replace(/\n/g, "<br/>")}</p>`)
      .join("");
  }

  // 1. Remove Quill UI helper elements (<span class="ql-ui" ...></span>)
  cleaned = cleaned.replace(/<span[^>]*class=["'][^"']*ql-ui[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, "");

  // 2. Convert Quill bullet lists (<ol> with data-list="bullet" items) into <ul>
  cleaned = cleaned.replace(/<ol([^>]*)>([\s\S]*?)<\/ol>/gi, (match, olAttrs, content) => {
    if (/data-list=["']bullet["']/i.test(content) || /data-list=["']bullet["']/i.test(olAttrs)) {
      return `<ul${olAttrs}>${content}</ul>`;
    }
    return match;
  });

  // 3. Strip data-list attributes from <li> items
  cleaned = cleaned.replace(/\s*data-list=["'](bullet|ordered)["']/gi, "");

  // 4. Strip contenteditable attributes if present
  cleaned = cleaned.replace(/\s*contenteditable=["'](true|false)["']/gi, "");

  // 5. Wrap any orphan <li> items not enclosed in <ul> or <ol> in <ul>
  if (!/<(ul|ol)[\s\S]*?>[\s\S]*?<\/li>/i.test(cleaned) && /<li[\s\S]*?>/i.test(cleaned)) {
    cleaned = `<ul>${cleaned}</ul>`;
  }

  // 6. Remove empty <li> items (e.g. <li></li>, <li><br/></li>, <li>&nbsp;</li>)
  cleaned = cleaned.replace(/<li[^>]*>\s*(<br\s*\/?>|&nbsp;)?\s*<\/li>/gi, "");

  return cleaned;
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<span[^>]*class=["'][^"']*ql-ui[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
