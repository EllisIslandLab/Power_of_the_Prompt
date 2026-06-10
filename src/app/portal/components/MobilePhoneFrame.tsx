'use client'

import { useRef, useLayoutEffect, useState } from 'react'

interface MobilePhoneFrameProps {
  children: React.ReactNode
}

export default function MobilePhoneFrame({ children }: MobilePhoneFrameProps) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const FRAME_W = 416
    const FRAME_H = 870

    const fit = () => {
      const aw = stage.clientWidth - 36
      const ah = stage.clientHeight - 36
      setScale(Math.min(1, aw / FRAME_W, ah / FRAME_H))
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(stage)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-4" ref={stageRef}>
      <div
        className="transition-transform duration-300"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Phone frame - iPhone style */}
        <div
          className="relative bg-gradient-to-br from-[#303034] via-[#161618] to-[#0d0d0f] rounded-[58px] p-[13px] shadow-2xl"
          style={{
            width: '416px',
            height: '858px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 50px 90px -40px rgba(0,0,0,0.8), inset 0 0 0 1.5px rgba(255,255,255,0.07), inset 0 0 0 7px #000',
          }}
        >
          {/* Screen */}
          <div className="relative w-[390px] h-[832px] bg-white rounded-[46px] overflow-hidden flex flex-col">
            {/* Status bar */}
            <div className="relative z-10 h-[50px] flex-shrink-0 bg-white flex items-center justify-between px-8">
              <div className="font-semibold text-[15px] text-black tracking-tight" style={{ fontFeatureSettings: '"tnum"' }}>
                9:41
              </div>

              {/* Notch */}
              <div
                className="absolute top-[11px] left-1/2 -translate-x-1/2 w-[124px] h-[33px] bg-black rounded-[22px] z-20"
              />

              {/* Status icons */}
              <div className="flex items-center gap-2 text-black">
                {/* Signal */}
                <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
                  <rect x="0" y="7.5" width="3" height="4.5" rx="1" />
                  <rect x="5" y="5" width="3" height="7" rx="1" />
                  <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
                  <rect x="15" y="0" width="3" height="12" rx="1" />
                </svg>
                {/* WiFi */}
                <svg width="17" height="12" viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
                  <path d="M1.5 3.6a11 11 0 0 1 14 0" />
                  <path d="M4 6.4a7 7 0 0 1 9 0" />
                  <path d="M6.5 9.1a3 3 0 0 1 4 0" />
                  <circle cx="8.5" cy="11" r="0.7" fill="currentColor" stroke="none" />
                </svg>
                {/* Battery */}
                <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
                  <rect x="0.5" y="0.5" width="22" height="12" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.4" />
                  <rect x="2.2" y="2.2" width="18.6" height="8.6" rx="1.8" fill="currentColor" />
                  <rect x="24" y="4" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.5" />
                </svg>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 bg-white relative z-0">
              {children}
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] rounded-full bg-black opacity-30 z-10" />
          </div>
        </div>
      </div>
    </div>
  )
}
