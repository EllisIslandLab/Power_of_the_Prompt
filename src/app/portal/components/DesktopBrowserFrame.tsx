'use client'

interface DesktopBrowserFrameProps {
  children: React.ReactNode
  url?: string
}

export default function DesktopBrowserFrame({ children, url = 'preview.local' }: DesktopBrowserFrameProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-4">
      <div className="w-full h-full bg-[#0a0e27] border-2 border-white/20 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col">
        {/* Browser chrome */}
        <div className="h-11 flex-shrink-0 flex items-center gap-4 px-4 bg-[#080c25] border-b-2 border-white/20">
          {/* Traffic lights */}
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#f0625a]" />
            <div className="w-3 h-3 rounded-full bg-[#f5bf4f]" />
            <div className="w-3 h-3 rounded-full bg-[#61c554]" />
          </div>

          {/* URL bar */}
          <div className="flex-1 max-w-[520px] mx-auto flex items-center justify-center gap-2 h-7 px-4 bg-[#0a0e27] border-2 border-white/30 rounded-lg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <span className="text-xs text-white/70 font-mono">{url}</span>
          </div>

          {/* Preview tag */}
          <div className="px-3 py-1 bg-[#b1c6f9]/20 border border-[#b1c6f9]/30 rounded-md">
            <span className="text-[10px] text-[#b1c6f9] font-bold uppercase tracking-widest">Preview</span>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 bg-white relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
