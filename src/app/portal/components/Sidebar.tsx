'use client'

import { useState, useEffect } from 'react'

interface SidebarProps {
  onModeChange?: (mode: 'builder' | 'chat') => void
  initialTheme?: string
  user?: any
  clientAccount?: any
  onLayoutChange?: (layout: 'left' | 'right' | 'top' | 'bottom' | 'floating') => void
  onImageUpload?: () => void
  modifiedFiles?: Array<{ path: string; type: 'modified' | 'created' | 'deleted' }>
}

type SidebarTool = 'explorer' | 'search' | 'git' | 'targets' | 'mode' | 'balance' | 'settings' | 'layout' | 'upload' | 'help'

export default function Sidebar({ onModeChange, initialTheme = 'dark', user, clientAccount, onLayoutChange, onImageUpload, modifiedFiles = [] }: SidebarProps) {
  const [activeTool, setActiveTool] = useState<SidebarTool | null>(null)
  const [currentMode, setCurrentMode] = useState<'builder' | 'chat'>('builder')
  const [chatLayout, setChatLayout] = useState<'left' | 'right' | 'top' | 'bottom' | 'floating'>('left')

  // Apply initial theme on mount
  useEffect(() => {
    if (initialTheme) {
      document.documentElement.setAttribute('data-theme', initialTheme)
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [initialTheme])

  const handleModeToggle = () => {
    const newMode = currentMode === 'builder' ? 'chat' : 'builder'
    setCurrentMode(newMode)
    onModeChange?.(newMode)
  }

  const mainTools = [
    {
      id: 'upload' as const,
      label: 'Upload Image • Drag & drop images into chat or click here',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      action: () => onImageUpload?.(),
    },
    {
      id: 'layout' as const,
      label: 'Chat Layout Configuration',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h14a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3z" />
        </svg>
      ),
    },
    {
      id: 'explorer' as const,
      label: 'Explorer',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      id: 'search' as const,
      label: 'Search',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      id: 'git' as const,
      label: 'Version Control',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      id: 'targets' as const,
      label: 'Targets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'mode' as const,
      label: currentMode === 'builder' ? 'Switch to Chat' : 'Switch to Builder',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {currentMode === 'builder' ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          )}
        </svg>
      ),
      action: handleModeToggle,
    },
  ]

  const bottomTools = [
    {
      id: 'help' as const,
      label: 'Help & Tips',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'balance' as const,
      label: `Account Balance: $${(clientAccount?.account_balance || 0).toFixed(2)}`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: 'settings' as const,
      label: 'Account Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      action: () => {
        window.location.href = '/portal/settings'
      },
    },
  ]

  return (
    <>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-12 bg-card border-r border-border flex flex-col items-center py-4 z-30">
        {/* Main Tools */}
        <div className="flex flex-col items-center">
          {mainTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => {
                if (tool.action) {
                  tool.action()
                } else {
                  setActiveTool(activeTool === tool.id ? null : tool.id)
                }
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors mb-2 relative ${
                activeTool === tool.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
              title={tool.label}
            >
              {tool.icon}
              {/* VS Code style indicator for modified files */}
              {tool.id === 'explorer' && modifiedFiles.length > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Tools */}
        <div className="flex flex-col items-center border-t border-border pt-2">
          {bottomTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => {
                if (tool.action) {
                  tool.action()
                } else {
                  setActiveTool(activeTool === tool.id ? null : tool.id)
                }
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors mb-2 ${
                activeTool === tool.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar Panel */}
      {activeTool && activeTool !== 'mode' && activeTool !== 'settings' && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-20"
            onClick={() => setActiveTool(null)}
          />

          {/* Panel */}
          <div className="fixed left-12 top-0 h-full w-64 bg-card border-r border-border z-30 shadow-lg">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">
                  {[...mainTools, ...bottomTools].find(t => t.id === activeTool)?.label}
                </h2>
                <button
                  onClick={() => setActiveTool(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Explorer Content */}
              {activeTool === 'explorer' && (
                <div className="text-sm text-muted-foreground">
                  {modifiedFiles.length > 0 ? (
                    <>
                      <p className="mb-2 font-semibold text-foreground">
                        Modified Files ({modifiedFiles.length})
                      </p>
                      <div className="space-y-1 max-h-[400px] overflow-y-auto scrollbar-thin pr-2">
                        {modifiedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/50 font-mono text-xs"
                          >
                            <span className={`w-2 h-2 rounded-full ${
                              file.type === 'modified' ? 'bg-yellow-500' :
                              file.type === 'created' ? 'bg-green-500' :
                              'bg-red-500'
                            }`} />
                            <span className="truncate text-foreground">{file.path}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs mt-4 text-muted-foreground">
                        Review and approve changes below
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mb-2">Project Files</p>
                      <div className="space-y-1 font-mono text-xs">
                        <div className="pl-2">📁 src</div>
                        <div className="pl-4">📁 app</div>
                        <div className="pl-6">📁 portal</div>
                        <div className="pl-8">📄 page.tsx</div>
                        <div className="pl-6">📁 api</div>
                        <div className="pl-4">📁 components</div>
                        <div className="pl-2">📁 public</div>
                        <div className="pl-4">📁 images</div>
                      </div>
                      <p className="text-xs mt-4 text-muted-foreground">
                        No pending changes
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Search Content */}
              {activeTool === 'search' && (
                <div>
                  <input
                    type="text"
                    placeholder="Search in files..."
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-xs mt-4 text-muted-foreground">
                    Search functionality coming soon
                  </p>
                </div>
              )}

              {/* Git Content */}
              {activeTool === 'git' && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-3">Version Control</p>
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 text-left text-sm bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      View Commit History
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      Rollback Changes
                    </button>
                    <button className="w-full px-3 py-2 text-left text-sm bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      Compare Versions
                    </button>
                  </div>
                  <p className="text-xs mt-4 text-muted-foreground">
                    Git integration coming soon
                  </p>
                </div>
              )}

              {/* Targets Content */}
              {activeTool === 'targets' && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-3">Your Projects</p>
                  <div className="space-y-2">
                    <div className="p-3 border border-border rounded-lg bg-muted/30">
                      <div className="font-medium text-foreground mb-1">Current Project</div>
                      <div className="text-xs text-muted-foreground">Website Builder</div>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    + Add Project
                  </button>
                  <p className="text-xs mt-4 text-muted-foreground">
                    Multi-project support coming soon
                  </p>
                </div>
              )}

              {/* Balance Content */}
              {activeTool === 'balance' && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-3">Account Balance</p>
                  <div className="p-4 border border-border rounded-lg bg-muted/30 mb-4">
                    <div className={`text-2xl font-bold mb-1 ${
                      (clientAccount?.account_balance || 0) === 0
                        ? 'text-red-500'
                        : (clientAccount?.account_balance || 0) < 5
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }`}>
                      ${(clientAccount?.account_balance || 0).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Available Balance</div>
                  </div>
                  <button
                    onClick={() => {
                      window.location.href = '/portal/billing'
                    }}
                    className="w-full px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mb-2"
                  >
                    Add Funds
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = '/portal/billing'
                    }}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    Manage Billing
                  </button>
                </div>
              )}

              {/* Layout Configuration Content */}
              {activeTool === 'layout' && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-3">Chat Position</p>
                  <div className="space-y-2">
                    {['left', 'right', 'top', 'bottom', 'floating'].map(layout => (
                      <button
                        key={layout}
                        onClick={() => {
                          setChatLayout(layout as any)
                          onLayoutChange?.(layout as any)
                          setActiveTool(null)
                        }}
                        className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                          chatLayout === layout
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <span className="capitalize">{layout}</span>
                        {layout === 'floating' && (
                          <span className="text-xs ml-2">(Draggable)</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Help Content */}
              {activeTool === 'help' && (
                <div className="text-sm">
                  <p className="text-muted-foreground mb-3">Tips & Shortcuts</p>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-foreground mb-1">💡 Quick Tip</div>
                      <div className="text-xs text-muted-foreground">
                        Describe one change at a time for best results
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-foreground mb-1">🖼️ Images</div>
                      <div className="text-xs text-muted-foreground">
                        Drag & drop or use the upload icon to add images
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-foreground mb-1">👁️ Preview</div>
                      <div className="text-xs text-muted-foreground">
                        Click fullscreen button to interact with your preview
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-foreground mb-1">⌨️ Shortcuts</div>
                      <div className="text-xs text-muted-foreground">
                        ESC to exit fullscreen • Enter to send message
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
