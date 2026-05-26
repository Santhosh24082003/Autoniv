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

export default function CallPage() {
  const apiKey = import.meta.env.VITE_VAPI_PUBLIC_KEY ?? ''
  const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID ?? ''

  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [message, setMessage] = useState('Click the button to launch the receptionist.')

  async function launchWidget() {
    if (!apiKey.trim()) {
      setStatus('error')
      setMessage('Missing Vapi public key in environment.')
      return
    }

    if (!assistantId.trim()) {
      setStatus('error')
      setMessage('Missing Vapi assistant ID in environment.')
      return
    }

    try {
      setStatus('loading')
      setMessage('Opening the receptionist...')
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
      setMessage('Ready. Allow microphone access and start speaking.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Failed to launch the widget.')
    }
  }

  const statusClasses: Record<typeof status, string> = {
    idle: 'text-slate-300',
    loading: 'text-amber-300',
    ready: 'text-emerald-300',
    error: 'text-rose-300',
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.2),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.55))]" />

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
                Vapi browser test
              </span>
              <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
                Receptionist call page
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                A clean browser-only launch page for your receptionist. The key and assistant stay in
                the environment, so the UI stays focused on one thing: starting the call.
              </p>
            </div>

            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-100">
              Ready for browser voice
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Mode', value: 'Browser voice' },
              { label: 'Visibility', value: 'Private config' },
              { label: 'Action', value: 'Call receptionist' },
            ].map((item) => (
              <article
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-sky-200/80">{item.label}</p>
                <p className="mt-3 text-lg font-medium text-white">{item.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
                  Call details
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300 sm:text-base">
                  Open the widget, allow microphone access, and test the full receptionist flow from
                  your browser.
                </p>
              </div>

              <button
                type="button"
                onClick={launchWidget}
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-sky-500/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'loading' ? 'Launching...' : 'Call receptionist'}
              </button>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <span className={`text-sm font-medium ${statusClasses[status]}`}>{message}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
