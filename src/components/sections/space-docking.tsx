'use client'

export function SpaceDocking() {
  return (
    <section className="px-5 md:px-16 py-32 max-w-[1440px] mx-auto">
      <div className="glass-panel p-8 md:p-16 rounded-xl text-center flex flex-col items-center border-b-2 border-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-8">Request Docking</h2>

        <p className="text-base text-[#c4c7c8] max-w-xl mb-12 leading-relaxed">
          The bay doors are open for the next wave of recruits. Initialize your sequence to begin the final phase of your career evolution.
        </p>

        <button className="bg-[#FFB800] text-[#271900] px-12 py-5 rounded-lg text-xs font-bold uppercase tracking-wider gold-glow hover:scale-105 transition-all flex items-center gap-3">
          INITIALIZE SEQUENCE →
        </button>

        <div className="mt-8 flex flex-col md:flex-row gap-4 opacity-50">
          <span className="text-[10px] font-medium tracking-[0.05em] text-[#c4c7c8] uppercase">AUTH_TOKEN: VERIFIED</span>
          <span className="text-[10px] font-medium tracking-[0.05em] text-[#c4c7c8] uppercase">ENCRYPTION: 256-BIT</span>
        </div>
      </div>

      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </section>
  )
}
