'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Archive,
  ArrowUp,
  Check,
  ChevronDown,
  Clipboard,
  FileCode2,
  FileText,
  FolderOpen,
  Menu,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Square,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Chat = { id: number; title: string; time: string; active?: boolean }
type Message = { role: 'user' | 'assistant'; content: string; code?: string }

const initialChats: Chat[] = [
  { id: 1, title: 'Explain async generators in Python', time: '2m ago', active: true },
  { id: 2, title: 'Review my binary search tree', time: 'Yesterday' },
  { id: 3, title: 'PostgreSQL query optimization', time: 'Yesterday' },
  { id: 4, title: 'React state management patterns', time: 'Sep 28' },
  { id: 5, title: 'System design interview prep', time: 'Sep 24' },
]

const initialMessages: Message[] = [
  { role: 'user', content: 'Can you explain async generators in Python with a practical example?' },
  {
    role: 'assistant',
    content: 'Absolutely. An async generator is a function that produces values one at a time using `yield`, while allowing each value to be produced asynchronously with `await`. They are useful for streaming data without loading everything into memory.',
    code: `async def read_chunks(urls):
    for url in urls:
        data = await fetch(url)
        yield data

async for chunk in read_chunks(urls):
    process(chunk)`,
  },
]

export function ChatWorkspace() {
  const [chats, setChats] = useState(initialChats)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [attachment, setAttachment] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const filteredChats = useMemo(() => chats.filter((chat) => chat.title.toLowerCase().includes(query.toLowerCase())), [chats, query])

  function startNewChat() {
    setMessages([])
    setInput('')
    setChats((current) => current.map((chat) => ({ ...chat, active: false })))
    setSidebarOpen(false)
  }

  function submitMessage() {
    const trimmed = input.trim()
    if (!trimmed || isGenerating) return
    setMessages((current) => [...current, { role: 'user', content: trimmed }])
    setInput('')
    setIsGenerating(true)
    window.setTimeout(() => {
      setMessages((current) => [...current, { role: 'assistant', content: 'Here is a clear way to think about that. I would start by identifying the input, the desired output, and the constraints. From there, we can choose the simplest approach that stays readable and easy to test.' }])
      setIsGenerating(false)
    }, 900)
  }

  async function copyResponse(content: string) {
    await navigator.clipboard?.writeText(content)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  function handleFile(file?: File) {
    if (file) setAttachment(file.name)
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <aside className={cn('fixed inset-y-0 left-0 z-30 flex w-[292px] -translate-x-full flex-col border-r border-border bg-sidebar transition-transform duration-200 md:relative md:translate-x-0', sidebarOpen && 'translate-x-0')}>
        <div className="flex items-center justify-between px-5 pb-5 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground"><Sparkles className="size-4" /></div>
            <span className="text-[15px] font-semibold tracking-[-0.02em]">CodeMentor <span className="text-primary">AI</span></span>
          </div>
          <Button variant="ghost" size="icon" className="size-8 md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar"><X /></Button>
        </div>
        <div className="px-3">
          <Button onClick={startNewChat} className="h-10 w-full justify-start gap-2.5 rounded-lg text-[13px] font-medium"><Plus data-icon="inline-start" /> New conversation</Button>
        </div>
        <div className="px-4 pb-3 pt-6"><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search conversations" className="h-9 w-full rounded-md border border-border bg-background/60 pl-9 pr-3 text-[12px] outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" /></div></div>
        <nav className="flex-1 overflow-y-auto px-3" aria-label="Conversations">
          <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recent</div>
          <div className="flex flex-col gap-1">{filteredChats.map((chat) => <button key={chat.id} onClick={() => setChats((current) => current.map((item) => ({ ...item, active: item.id === chat.id })))} className={cn('group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-accent', chat.active && 'bg-accent')}><span className="min-w-0 truncate pr-2">{chat.title}</span><span className="shrink-0 text-[10px] text-muted-foreground">{chat.time}</span></button>)}</div>
          <div className="mb-2 mt-7 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Pinned</div>
          <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] text-muted-foreground hover:bg-accent"><Archive className="size-3.5" /> Saved prompts</button>
        </nav>
        <div className="border-t border-border px-5 py-4"><p className="text-[11px] leading-5 text-muted-foreground">Your conversations stay private in this session.</p></div>
      </aside>
      {sidebarOpen && <button className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[68px] items-center justify-between border-b border-border px-4 sm:px-8">
          <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu /></Button><div><p className="text-[13px] font-medium">{chats.find((chat) => chat.active)?.title ?? 'New conversation'}</p><p className="text-[11px] text-muted-foreground">CodeMentor AI <span className="mx-1.5">·</span> Python mentor</p></div></div>
          <Button variant="ghost" size="icon" className="size-9" aria-label="More options"><MoreHorizontal /></Button>
        </header>

        <section className="flex-1 overflow-y-auto" aria-label="Chat messages"><div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-12">
          {messages.length === 0 ? <div className="flex min-h-[55vh] flex-col items-center justify-center text-center"><div className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-sm"><Sparkles className="size-6 text-primary" /></div><h1 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">What are you building?</h1><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Ask about code, architecture, debugging, or upload a document to start exploring.</p></div> : messages.map((message, index) => <article key={index} className={cn('flex gap-3', message.role === 'user' && 'justify-end')}><div className={cn('flex size-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold', message.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'order-2 bg-accent text-accent-foreground')}>{message.role === 'assistant' ? 'AI' : 'YOU'}</div><div className={cn('max-w-[min(100%,680px)] text-[14px] leading-7', message.role === 'user' && 'rounded-2xl bg-accent px-4 py-2.5 leading-6')}><p className="whitespace-pre-wrap">{message.content}</p>{message.code && <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card"><div className="flex items-center justify-between border-b border-border px-4 py-2.5"><span className="flex items-center gap-2 text-[11px] text-muted-foreground"><FileCode2 className="size-3.5" /> python</span><Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[11px]" onClick={() => copyResponse(message.code!)}>{copied ? <Check /> : <Clipboard />} {copied ? 'Copied' : 'Copy'}</Button></div><pre className="overflow-x-auto p-4 text-[12px] leading-6 text-foreground/85"><code>{message.code}</code></pre></div>}{message.role === 'assistant' && index === 1 && <div className="mt-3 flex gap-1"><Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[11px]" onClick={() => copyResponse(message.content)}>{copied ? <Check /> : <Clipboard />} {copied ? 'Copied' : 'Copy'}</Button><Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[11px]"><Pencil /> Edit</Button></div>}</div></article>)}
          {isGenerating && <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="flex size-7 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">AI</div><span className="flex items-center gap-1.5">Thinking<span className="animate-pulse">...</span></span></div>}
        </div></section>

        <div className="mx-auto w-full max-w-3xl px-4 pb-5 sm:px-8 sm:pb-7"><div className="rounded-2xl border border-border bg-card p-2 shadow-[0_8px_30px_-18px_hsl(var(--foreground)/0.3)]"><div className="flex items-end gap-2"><input ref={fileRef} type="file" className="hidden" accept=".pdf,.txt,.md,.docx,.csv,.xlsx,.py,.js,.ts,.java,.sql,.json,.png,.jpg,.jpeg,.webp" onChange={(event) => handleFile(event.target.files?.[0])} /><Button variant="ghost" size="icon" className="mb-0.5 size-9 shrink-0" onClick={() => fileRef.current?.click()} aria-label="Attach file"><Paperclip /></Button><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); submitMessage() } }} placeholder="Ask anything about programming..." rows={1} className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-[14px] outline-none placeholder:text-muted-foreground" /><Button onClick={isGenerating ? () => setIsGenerating(false) : submitMessage} disabled={!input.trim() && !isGenerating} size="icon" className="mb-0.5 size-9 shrink-0 rounded-xl" aria-label={isGenerating ? 'Stop generation' : 'Send message'}>{isGenerating ? <Square /> : <ArrowUp />}</Button></div>{attachment && <div className="mt-2 flex items-center gap-2 border-t border-border px-2 pt-2 text-[11px] text-muted-foreground"><FileText className="size-3.5" /> {attachment}<button onClick={() => setAttachment(null)} className="ml-auto rounded p-1 hover:bg-accent" aria-label="Remove attachment"><X className="size-3" /></button></div>}</div><p className="mt-2 text-center text-[10px] text-muted-foreground">CodeMentor can make mistakes. Verify important code before shipping.</p></div>
      </main>
    </div>
  )
}

export default ChatWorkspace
