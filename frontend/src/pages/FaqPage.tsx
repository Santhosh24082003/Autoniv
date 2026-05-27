import { useState } from 'react'

declare global {
  interface Window {
    vapiSDK?: {
      run: (options: { apiKey: string; assistant?: string }) => void
    }
  }
}

const VAPI_SCRIPT_ID = 'vapi-web-widget-sdk'
const VAPI_SCRIPT_SRC = 'https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js'

function loadVapiWidget() {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(VAPI_SCRIPT_ID)

    if (existingScript) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.id = VAPI_SCRIPT_ID
    script.src = VAPI_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load the Vapi widget script.'))

    document.head.appendChild(script)
  })
}

export default function FaqPage() {
  const apiKey = import.meta.env.VITE_VAPI_PUBLIC_KEY ?? ''
  const assistantId = import.meta.env.VITE_VAPI_FAQ_ASSISTANT_ID ?? ''

  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [message, setMessage] = useState('Click the button to launch the FAQ assistant.')

  async function launchWidget() {
    if (!apiKey.trim()) {
      setStatus('error')
      setMessage('Missing Vapi public key in environment.')
      return
    }

    if (!assistantId.trim()) {
      setStatus('error')
      setMessage('Missing FAQ assistant ID in environment.')
      return
    }

    try {
      setStatus('loading')
      setMessage('Opening the FAQ assistant...')
      await loadVapiWidget()

      const vapi = window.vapiSDK
      if (!vapi) {
        throw new Error('Vapi SDK is not available on window.')
      }

      vapi.run({
        apiKey: apiKey.trim(),
        assistant: assistantId.trim(),
      })

      setStatus('ready')
      setMessage('Ready. Ask about timings, services, or pricing.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to launch the FAQ widget.')
    }
  }

  const statusClasses: Record<typeof status, string> = {
    idle: 'text-slate-300',
    loading: 'text-amber-300',
    ready: 'text-emerald-300',
    error: 'text-rose-300',
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.16),_transparent_26%)]" />
      <div className="relative">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-100">
              FAQ / Support
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
              Clinic FAQ assistant
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Use this page to test the clinic support agent from the browser. It answers clinic
              timings, services, and pricing guidance from the prompt.
            </p>
          </div>

          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100">
            Monday to Friday, 9 AM - 9 PM
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Answers', value: 'Timings' },
            { label: 'Answers', value: 'Services' },
            { label: 'Answers', value: 'Pricing guidance' },
          ].map((item) => (
            <article
              key={item.value}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-100/80">{item.label}</p>
              <p className="mt-3 text-lg font-medium text-white">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">Clinic hours</p>
            <p className="mt-3 text-lg font-medium text-white">Monday to Friday, 9:00 AM to 9:00 PM</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              The clinic is closed on Saturday and Sunday.
            </p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">Behavior</p>
            <p className="mt-3 text-lg font-medium text-white">Short, friendly, and factual</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              The assistant should not invent prices and should guide users to booking when needed.
            </p>
          </article>
        </div>

        <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-fuchsia-200/80">
                Test assistant
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-300 sm:text-base">
                Open the widget from here and ask about timings, services, or pricing.
              </p>
            </div>

            <button
              type="button"
              onClick={launchWidget}
              disabled={status === 'loading'}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-300 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-fuchsia-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-fuchsia-500/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'loading' ? 'Launching...' : 'Open FAQ assistant'}
            </button>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
            <span className={`text-sm font-medium ${statusClasses[status]}`}>{message}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
