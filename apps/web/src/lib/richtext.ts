import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type LexicalNode = {
  children?: LexicalNode[]
  fields?: { url?: string }
  format?: number | string
  listType?: string
  tag?: string
  text?: string
  type?: string
  url?: string
}

export function richTextToHtml(content: SerializedEditorState | null | undefined): string {
  if (!content || !content.root || !content.root.children) return ''
  return content.root.children.map(serializeNode).join('')
}

const FMT_BOLD = 1
const FMT_ITALIC = 1 << 1
const FMT_STRIKETHROUGH = 1 << 2
const FMT_UNDERLINE = 1 << 3
const FMT_CODE = 1 << 4

function serializeNode(node: LexicalNode): string {
  if (!node) return ''

  if (node.type === 'text') {
    let text = escapeHtml(node.text || '')
    const f = typeof node.format === 'number' ? node.format : 0
    if (f & FMT_CODE) text = `<code>${text}</code>`
    if (f & FMT_BOLD) text = `<strong>${text}</strong>`
    if (f & FMT_ITALIC) text = `<em>${text}</em>`
    if (f & FMT_UNDERLINE) text = `<u>${text}</u>`
    if (f & FMT_STRIKETHROUGH) text = `<s>${text}</s>`
    return text
  }

  if (node.type === 'linebreak') return '<br>'

  const children = (node.children || []).map(serializeNode).join('')

  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`
    case 'heading': {
      const tag = node.tag && /^h[1-6]$/.test(node.tag) ? node.tag : 'h2'
      return `<${tag}>${children}</${tag}>`
    }
    case 'list': {
      const listTag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${listTag}>${children}</${listTag}>`
    }
    case 'listitem':
      return `<li>${children}</li>`
    case 'link':
    case 'autolink': {
      const raw = node.fields?.url || node.url || ''
      const { href, external } = sanitizeUrl(raw)
      const rel = external ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${escapeHtml(href)}"${rel}>${children}</a>`
    }
    default:
      return children
  }
}

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

function sanitizeUrl(url: string): { href: string; external: boolean } {
  const trimmed = (url || '').trim()
  if (!trimmed) return { href: '#', external: false }

  if (!/^\s*[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return { href: trimmed, external: false }
  }

  try {
    const parsed = new URL(trimmed)
    if (!SAFE_URL_PROTOCOLS.has(parsed.protocol)) {
      return { href: '#', external: false }
    }
    const external = parsed.protocol === 'http:' || parsed.protocol === 'https:'
    return { href: parsed.toString(), external }
  } catch {
    return { href: '#', external: false }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function richTextToPlainText(content: SerializedEditorState | null | undefined): string {
  if (!content || !content.root || !content.root.children) return ''
  return extractText(content.root).trim().slice(0, 160)
}

function extractText(node: LexicalNode): string {
  if (node.type === 'text') return node.text || ''
  if (node.type === 'linebreak') return ' '
  return (node.children || []).map(extractText).join('')
}
