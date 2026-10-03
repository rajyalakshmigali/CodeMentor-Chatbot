'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Archive,
  ArrowUp,
  Check,
  ChevronDown,
  Clipboard,
  Code2,
  FileCode2,
  FileText,
  Menu,
  MoreHorizontal,
  Paperclip,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sparkles,
  Square,
  Trash2,
  X,
} from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string; attachment?: string }
type Conversation = { id: number; title: string; group: string; messages: Message[] }

const initialConversations: Conversation[] = [
  { id: 1, title: 'Explain async/await in Python', group: 'Today', messages: [
    { role: 'user', content: 'Can you explain async/await in Python with a practical example?' },
    { role: 'assistant', content: 'Absolutely. Think of `async` and `await` as a way to pause one task while it waits for something slow, like a network response, without blocking the rest of your program.\n\n```python\nimport asyncio\n\nasync def fetch_user(user_id):\n    await asyncio.sleep(1)  # Simulate I/O\n    return {"id": user_id, "name": "Ada"}\n\nasync def main():\n    users = await asyncio.gather(\n        fetch_user(1),\n        fetch_user(2),\n    )\n    print(users)\n\nasyncio.run(main())\n```\n\n`async def` creates a coroutine, and `await` yields control while that coroutine is waiting. `asyncio.gather` runs both requests concurrently, so the total wait is about one second instead of two.' },
  ] },
  { id: 2, title: 'Review binary search implementation', group: 'Today', messages: [{ role: 'user', content: 'Review my binary search implementation for edge cases.' }, { role: 'assistant', content: 'Share your implementation and I will check correctness, boundary conditions, complexity, and readability.' }] },
  { id: 3, title: 'Debug Java null pointer', group: 'Yesterday', messages: [{ role: 'user', content: 'Help me debug a NullPointerException in Java.' }, { role: 'assistant', content: 'Paste the stack trace and the smallest relevant code sample.' }] },
  { id: 4, title: 'Optimize SQL query', group: 'Yesterday', messages: [{ role: 'user', content: 'How can I optimize a slow SQL query?' }, { role: 'assistant', content: 'Start with the query plan, indexes, and the cardinality of the filtered columns.' }] },
  { id: 5, title: 'Explain a project brief', group: 'Previous 7 Days', messages: [{ role: 'user', content: 'Summarize the attached project brief.' }, { role: 'assistant', content: 'I can summarize it and cite the relevant pages once you upload the document.' }] },
]

function formatContent(content: string) {
  const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g)
  return parts.map((part, index) => {
    if (part.startsWith('```')) return <pre key={index}><code>{part.replace(/```python\n?|```\n?/g, '')}</code></pre>
    if (part.startsWith('`')) return <code className="inline-code" key={index}>{part.slice(1, -1)}</code>
    return <span key={index}>{part}</span>
  })
}

export default function Page() {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeId, setActiveId] = useState(1)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const active = conversations.find((conversation) => conversation.id === activeId) ?? conversations[0]
  const visibleGroups = useMemo(() => conversations.filter((conversation) => conversation.title.toLowerCase().includes(search.toLowerCase())).reduce<Record<string, Conversation[]>>((groups, conversation) => {
    ;(groups[conversation.group] ??= []).push(conversation)
    return groups
  }, {}), [conversations, search])

  function createConversation() {
    const next = { id: Date.now(), title: 'New conversation', group: 'Today', messages: [] }
    setConversations((items) => [next, ...items])
    setActiveId(next.id)
    setDraft('')
    setMobileOpen(false)
  }

  function sendMessage() {
    const text = draft.trim()
    if (!text || isGenerating) return
    const userMessage: Message = { role: 'user', content: text }
    const reply: Message = { role: 'assistant', content: 'I can help with that. I\'ll break the problem down clearly, call out assumptions, and include an example where it is useful.\n\nWhat language or codebase should we use for the solution?' }
    setConversations((items) => items.map((conversation) => conversation.id === activeId ? { ...conversation, title: conversation.messages.length ? conversation.title : text.slice(0, 38), messages: [...conversation.messages, userMessage] } : conversation))
    setDraft('')
    setIsGenerating(true)
    window.setTimeout(() => {
      setConversations((items) => items.map((conversation) => conversation.id === activeId ? { ...conversation, messages: [...conversation.messages, userMessage, reply] } : conversation))
      setIsGenerating(false)
    }, 650)
  }

  function copyMessage(content: string) {
    navigator.clipboard?.writeText(content)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return <div className="app-shell">
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-top">
        <button className="brand" onClick={createConversation} aria-label="New conversation"><span className="brand-mark"><Code2 /></span>{!collapsed && <span>CodeMentor <strong>AI</strong></span>}</button>
        <button className="icon-button sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</button>
      </div>
      <button className="new-chat" onClick={createConversation}><Plus />{!collapsed && 'New chat'}<span className="shortcut">⌘ K</span></button>
      {!collapsed && <>
        <label className="search-box"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" /></label>
        <div className="conversation-list">{Object.entries(visibleGroups).map(([group, items]) => <section key={group} className="conversation-group"><div className="group-label">{group}</div>{items.map((conversation) => <button key={conversation.id} className={`conversation-item ${conversation.id === activeId ? 'active' : ''}`} onClick={() => { setActiveId(conversation.id); setMobileOpen(false) }}><span>{conversation.title}</span>{conversation.id === activeId && <MoreHorizontal />}</button>)}</section>)}</div>
        <div className="sidebar-footer"><button><Archive /> Archived chats</button><p>CodeMentor AI <span>v0.1</span></p></div>
      </>}
    </aside>
    {mobileOpen && <button className="backdrop" aria-label="Close sidebar" onClick={() => setMobileOpen(false)} />}
    <main className="chat-area">
      <header className="chat-header"><button className="mobile-menu icon-button" onClick={() => setMobileOpen(true)}><Menu /></button><div className="header-title"><span className="online-dot" /><span>{active.title === 'New conversation' ? 'New conversation' : 'CodeMentor AI'}</span><ChevronDown /></div><button className="icon-button" aria-label="More options"><MoreHorizontal /></button></header>
      <div className="message-scroller">
        {active.messages.length === 0 ? <div className="empty-state"><div className="empty-mark"><Sparkles /></div><p className="eyebrow">YOUR AI CODING MENTOR</p><h1>What are you building today?</h1><p className="empty-copy">Ask questions, debug code, review an approach, or drop in a document to get started.</p><div className="prompt-suggestions"><button onClick={() => setDraft('Explain this code to me like I am a beginner')}><FileCode2 /><span><strong>Explain code</strong><small>Understand any snippet</small></span></button><button onClick={() => setDraft('Help me debug this error: ')}><Code2 /><span><strong>Debug an error</strong><small>Find the root cause</small></span></button><button onClick={() => setDraft('Review my implementation for edge cases')}><Sparkles /><span><strong>Review an approach</strong><small>Improve your solution</small></span></button></div></div> : <div className="messages">{active.messages.map((message, index) => <article className={`message ${message.role}`} key={`${active.id}-${index}`}><div className="message-avatar">{message.role === 'assistant' ? <Code2 /> : 'You'}</div><div className="message-body"><div className="message-meta"><strong>{message.role === 'assistant' ? 'CodeMentor AI' : 'You'}</strong><span>{message.role === 'assistant' ? 'Just now' : 'Just now'}</span></div><div className="message-content">{formatContent(message.content)}</div>{message.role === 'assistant' && <div className="message-actions"><button onClick={() => copyMessage(message.content)}>{copied ? <Check /> : <Clipboard />} {copied ? 'Copied' : 'Copy'}</button><button><ArrowUp /> Regenerate</button></div>}</div></article>)}{isGenerating && <article className="message assistant"><div className="message-avatar"><Code2 /></div><div className="message-body"><div className="message-meta"><strong>CodeMentor AI</strong><span>Thinking</span></div><div className="typing"><i /><i /><i /></div></div></article>}</div>}
      </div>
      <div className="composer-wrap"><div className="composer"><div className="attachment-row"><span className="file-chip"><FileText /> project-context.md <button aria-label="Remove attachment"><X /></button></span></div><textarea ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); sendMessage() } }} placeholder="Ask anything about programming..." rows={1} /><div className="composer-bottom"><div className="composer-tools"><button className="tool-button" aria-label="Attach file"><Paperclip /></button><span>Press <kbd>Enter</kbd> to send <span className="muted">·</span> <kbd>Shift + Enter</kbd> for a new line</span></div><button className="send-button" onClick={isGenerating ? () => setIsGenerating(false) : sendMessage} aria-label={isGenerating ? 'Stop generating' : 'Send message'}>{isGenerating ? <Square /> : <ArrowUp />}</button></div></div><p className="disclaimer">CodeMentor AI can make mistakes. Check important code and sources.</p></div>
    </main>
  </div>
}
