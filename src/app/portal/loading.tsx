export default function PortalLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#080c25]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#FFB800] border-r-transparent mb-4"></div>
        <p className="text-[#c4c7c8] text-sm">Loading portal...</p>
      </div>
    </div>
  )
}
