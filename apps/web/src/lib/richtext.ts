import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/**
 * Convert Lexical rich text JSON to simple HTML.
 * Handles: paragraphs, headings, lists, bold, italic, links, line breaks.
 */
export function richTextToHtml(content: SerializedEditorState | null | undefined): string {
  if (!content || !content.root || !content.root.children) return ''
  return content.root.children.map(serializeNode).join('')
}

function serializeNode(node: any): string {
  if (!node) return ''

  // Text node
  if (node.type === 'text') {
    let text = escapeHtml(node.text || '')
    if (node.format & 1) text = `<strong>${text}</strong>` // bold
    if (node.format & 2) text = `<em>${text}</em>` // italic
    return text
  }

  // Line break
  if (node.type === 'linebreak') return '<br>'

  // Recursively serialize children
  const children = (node.children || []).map(serializeNode).join('')

  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`
    case 'heading':
      const tag = node.tag || 'h2'
      return `<${tag}>${children}</${tag}>`
    case 'list':
      const listTag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${listTag}>${children}</${listTag}>`
    case 'listitem':
      return `<li>${children}</li>`
    case 'link':
    case 'autolink':
      const url = node.fields?.url || node.url || '#'
      return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${children}</a>`
    default:
      return children
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Extract plain text from Lexical JSON (for meta descriptions).
 */
export function richTextToPlainText(content: SerializedEditorState | null | undefined): string {
  if (!content || !content.root || !content.root.children) return ''
  return extractText(content.root).trim().slice(0, 160)
}

function extractText(node: any): string {
  if (node.type === 'text') return node.text || ''
  if (node.type === 'linebreak') return ' '
  return (node.children || []).map(extractText).join('')
}
