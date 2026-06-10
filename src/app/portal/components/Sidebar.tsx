'use client'

import { useState, useEffect } from 'react'
import GitHubAccountSelector from './GitHubAccountSelector'
import HelpAssistant from './HelpAssistant'

interface SidebarProps {
  onModeChange?: (mode: 'builder' | 'chat') => void
  initialTheme?: string
  user?: any
  clientAccount?: any
  onLayoutChange?: (layout: 'left' | 'right' | 'top' | 'bottom' | 'floating') => void
  modifiedFiles?: Array<{ path: string; type: 'modified' | 'created' | 'deleted' }>
  onPanelOpenChange?: (isOpen: boolean) => void
  onFileOpen?: (file: { path: string; name: string; content: string }) => void
  onExplorerStateChange?: (isOpen: boolean) => void
}

type SidebarTool = 'explorer' | 'search' | 'source-control' | 'balance' | 'settings' | 'help' | 'layout'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'dir'
  sha: string
  size: number
  children?: FileNode[]
  expanded?: boolean
  loading?: boolean
}

export default function Sidebar({ onModeChange, initialTheme = 'dark', user, clientAccount, onLayoutChange, modifiedFiles = [], onPanelOpenChange, onFileOpen, onExplorerStateChange }: SidebarProps) {
  const [activeTool, setActiveTool] = useState<SidebarTool | null>(null)
  const [currentMode, setCurrentMode] = useState<'builder' | 'chat'>('builder')
  const [chatLayout, setChatLayout] = useState<'left' | 'right' | 'top' | 'bottom' | 'floating'>('bottom')
  const [fileTree, setFileTree] = useState<FileNode[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [githubConnected, setGithubConnected] = useState<boolean | null>(null)
  const [availableInstallations, setAvailableInstallations] = useState<any[]>([])
  const [showAccountSelector, setShowAccountSelector] = useState(false)
  const [selectedInstallationId, setSelectedInstallationId] = useState<number | null>(null)
  const [fileContentCache, setFileContentCache] = useState<Map<string, string>>(new Map())
  const [folderCache, setFolderCache] = useState<Map<string, FileNode[]>>(new Map())
  const [fileLoadError, setFileLoadError] = useState<string | null>(null)
  const [showReconnectHelp, setShowReconnectHelp] = useState(false)
  const [projectName, setProjectName] = useState<string | null>(null)

  // Force space theme for portal
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'space')
    document.documentElement.classList.add('dark')

    // Load selected installation from localStorage
    const saved = localStorage.getItem('selected_github_installation')
    if (saved) {
      setSelectedInstallationId(parseInt(saved))
    }
  }, [])

  // Check GitHub connection status when explorer is opened
  useEffect(() => {
    if (activeTool === 'explorer') {
      checkGitHubConnection()
    }
  }, [activeTool])

  // Notify parent when panel opens/closes
  useEffect(() => {
    const isPanelOpen = activeTool !== null && activeTool !== 'layout' && activeTool !== 'settings'
    onPanelOpenChange?.(isPanelOpen)

    // Notify parent when Explorer state changes
    const isExplorerOpen = activeTool === 'explorer'
    onExplorerStateChange?.(isExplorerOpen)
  }, [activeTool, onPanelOpenChange, onExplorerStateChange])

  const checkGitHubConnection = async () => {
    try {
      let response = await fetch('/api/integrations/github/repositories')
      let data = await response.json()

      // If no installations found, try syncing from GitHub first
      if (!data.installations || data.installations.length === 0) {
        console.log('No installations found, attempting to sync from GitHub...')
        const syncResponse = await fetch('/api/integrations/github/sync-installations', {
          method: 'POST'
        })

        if (syncResponse.ok) {
          const syncData = await syncResponse.json()
          console.log('Sync result:', syncData)

          // Recheck after sync
          if (syncData.synced > 0) {
            response = await fetch('/api/integrations/github/repositories')
            data = await response.json()
          }
        }
      }

      const installations = data.installations || []
      setAvailableInstallations(installations)

      if (installations.length === 0) {
        setGithubConnected(false)
        return
      }

      setGithubConnected(true)

      // Handle multiple installations
      if (installations.length > 1) {
        // Check if user has already selected one
        if (selectedInstallationId) {
          // Verify the selection still exists
          const stillExists = installations.find(
            (i: any) => i.installation_id === selectedInstallationId
          )
          if (stillExists) {
            loadFileTree()
            return
          }
        }
        // Show selection UI
        setShowAccountSelector(true)
      } else if (installations.length === 1) {
        // Only one installation, use it automatically
        setSelectedInstallationId(installations[0].installation_id)
        localStorage.setItem('selected_github_installation', installations[0].installation_id.toString())
        loadFileTree()
      }
    } catch (error) {
      console.error('Failed to check GitHub connection:', error)
      setGithubConnected(false)
    }
  }

  const handleInstallationSelect = (installationId: number) => {
    setSelectedInstallationId(installationId)
    localStorage.setItem('selected_github_installation', installationId.toString())
    setShowAccountSelector(false)
    // Clear caches when switching installations
    setFileContentCache(new Map())
    setFolderCache(new Map())
    loadFileTree()
  }

  const loadFileTree = async (path: string = '') => {
    setLoadingFiles(true)
    setFileLoadError(null)
    try {
      const installationParam = selectedInstallationId
        ? `&installation_id=${selectedInstallationId}`
        : ''
      const response = await fetch(`/api/portal/files?path=${path}${installationParam}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch files' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const files = data.files || []
      setFileTree(files)

      // Extract project/repo name for Explorer title
      if (data.project?.repo) {
        setProjectName(data.project.repo)
      }

      // Cache root level
      setFolderCache(prev => new Map(prev).set(path, files))

      // Prefetch root-level subdirectories
      const subfolders = files.filter((f: FileNode) => f.type === 'dir')
      subfolders.forEach((folder: FileNode) => {
        prefetchFolder(folder.path)
      })

      // Prefetch small files at root
      const smallFiles = files.filter((f: FileNode) =>
        f.type === 'file' && f.size < 100000
      )
      smallFiles.forEach((file: FileNode) => {
        prefetchFileContent(file.path)
      })
    } catch (error: any) {
      console.error('Failed to load files:', error)
      setFileLoadError(error.message || 'Failed to load files')
    } finally {
      setLoadingFiles(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    try {
      const response = await fetch(`/api/portal/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleModeToggle = () => {
    const newMode = currentMode === 'builder' ? 'chat' : 'builder'
    setCurrentMode(newMode)
    onModeChange?.(newMode)
  }

  const mainTools = [
    {
      id: 'layout' as const,
      label: chatLayout === 'bottom' ? 'Desktop View' : 'Mobile-First Preview',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {chatLayout === 'bottom' ? (
            // Desktop monitor icon
            <>
              <rect x="3" y="4" width="18" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              <line x1="9" y1="20" x2="15" y2="20" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              <line x1="12" y1="16" x2="12" y2="20" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </>
          ) : (
            // Mobile phone icon
            <>
              <rect x="8" y="3" width="8" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              <line x1="11" y1="18" x2="13" y2="18" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </>
          )}
        </svg>
      ),
      action: () => {
        const newLayout = chatLayout === 'bottom' ? 'floating' : 'bottom'
        setChatLayout(newLayout)
        onLayoutChange?.(newLayout)
      },
    },
    {
      id: 'explorer' as const,
      label: projectName || 'Explorer',
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
      id: 'source-control' as const,
      label: 'Source Control',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
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

  const handleFolderClick = async (folderPath: string) => {
    // Toggle expanded state
    setFileTree(prevTree => {
      const toggleExpanded = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === folderPath && node.type === 'dir') {
            return { ...node, expanded: !node.expanded, loading: !node.expanded && !node.children }
          }
          if (node.children) {
            return { ...node, children: toggleExpanded(node.children) }
          }
          return node
        })
      }
      return toggleExpanded(prevTree)
    })

    // Load children if not already loaded
    const folder = findNode(fileTree, folderPath)
    if (folder && !folder.children) {
      await loadFolderContents(folderPath)
    }
  }

  const findNode = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node
      if (node.children) {
        const found = findNode(node.children, path)
        if (found) return found
      }
    }
    return null
  }

  const loadFolderContents = async (folderPath: string) => {
    // Check cache first
    if (folderCache.has(folderPath)) {
      setFileTree(prevTree => {
        const addChildren = (nodes: FileNode[]): FileNode[] => {
          return nodes.map(node => {
            if (node.path === folderPath) {
              return {
                ...node,
                children: folderCache.get(folderPath) || [],
                loading: false
              }
            }
            if (node.children) {
              return { ...node, children: addChildren(node.children) }
            }
            return node
          })
        }
        return addChildren(prevTree)
      })
      return
    }

    try {
      const installationParam = selectedInstallationId
        ? `&installation_id=${selectedInstallationId}`
        : ''
      const response = await fetch(`/api/portal/files?path=${folderPath}${installationParam}`)
      if (response.ok) {
        const data = await response.json()
        const files = data.files || []

        // Cache the result
        setFolderCache(prev => new Map(prev).set(folderPath, files))

        setFileTree(prevTree => {
          const addChildren = (nodes: FileNode[]): FileNode[] => {
            return nodes.map(node => {
              if (node.path === folderPath) {
                return {
                  ...node,
                  children: files,
                  loading: false
                }
              }
              if (node.children) {
                return { ...node, children: addChildren(node.children) }
              }
              return node
            })
          }
          return addChildren(prevTree)
        })

        // Prefetch immediate subdirectories
        const subfolders = files.filter((f: FileNode) => f.type === 'dir')
        subfolders.forEach((folder: FileNode) => {
          if (!folderCache.has(folder.path)) {
            prefetchFolder(folder.path)
          }
        })

        // Prefetch small file contents (< 100KB) for instant loading
        const smallFiles = files.filter((f: FileNode) =>
          f.type === 'file' && f.size < 100000 && !fileContentCache.has(f.path)
        )
        smallFiles.forEach((file: FileNode) => {
          prefetchFileContent(file.path)
        })
      }
    } catch (error) {
      console.error('Failed to load folder contents:', error)
    }
  }

  const prefetchFolder = async (folderPath: string) => {
    try {
      const installationParam = selectedInstallationId
        ? `&installation_id=${selectedInstallationId}`
        : ''
      const response = await fetch(`/api/portal/files?path=${folderPath}${installationParam}`)
      if (response.ok) {
        const data = await response.json()
        setFolderCache(prev => new Map(prev).set(folderPath, data.files || []))
      }
    } catch (error) {
      // Silent fail for prefetch
    }
  }

  const prefetchFileContent = async (filePath: string) => {
    try {
      const installationParam = selectedInstallationId
        ? `&installation_id=${selectedInstallationId}`
        : ''
      const response = await fetch(`/api/portal/file-content?path=${encodeURIComponent(filePath)}${installationParam}`)
      if (response.ok) {
        const data = await response.json()
        setFileContentCache(prev => new Map(prev).set(filePath, data.content))
      }
    } catch (error) {
      // Silent fail for prefetch
    }
  }

  const handleFileClick = async (file: FileNode) => {
    // Check cache first for instant response
    if (fileContentCache.has(file.path)) {
      onFileOpen?.({
        path: file.path,
        name: file.name,
        content: fileContentCache.get(file.path)!
      })
      return
    }

    try {
      const installationParam = selectedInstallationId
        ? `&installation_id=${selectedInstallationId}`
        : ''
      const response = await fetch(`/api/portal/file-content?path=${encodeURIComponent(file.path)}${installationParam}`)
      if (response.ok) {
        const data = await response.json()

        // Cache the content
        setFileContentCache(prev => new Map(prev).set(file.path, data.content))

        onFileOpen?.({
          path: file.path,
          name: file.name,
          content: data.content
        })
      }
    } catch (error) {
      console.error('Failed to load file content:', error)
    }
  }

  const renderFileTree = (files: FileNode[], depth: number = 0) => {
    return files.map((file) => (
      <div key={file.path}>
        <div
          className="flex items-center gap-2 px-2 py-1 hover:bg-muted/50 cursor-pointer text-xs group"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => file.type === 'dir' ? handleFolderClick(file.path) : handleFileClick(file)}
        >
          {file.type === 'dir' ? (
            <>
              <span className="text-muted-foreground text-xs">
                {file.expanded ? '▼' : '▶'}
              </span>
              <span>📁</span>
            </>
          ) : (
            <>
              <span className="w-3"></span>
              <span>📄</span>
            </>
          )}
          <span className="text-foreground flex-1 truncate">{file.name}</span>
          {file.loading && <span className="text-xs text-muted-foreground">...</span>}
        </div>
        {file.type === 'dir' && file.expanded && file.children && renderFileTree(file.children, depth + 1)}
      </div>
    ))
  }

  return (
    <>
      {/* GitHub Account Selector Modal */}
      {showAccountSelector && (
        <GitHubAccountSelector
          installations={availableInstallations.map((inst: any) => ({
            installation_id: inst.installation_id,
            account_login: inst.account_login,
            account_type: inst.account_type || 'user',
            repository_count: inst.repository_count
          }))}
          onSelect={handleInstallationSelect}
          onCancel={() => setShowAccountSelector(false)}
        />
      )}

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-12 bg-[#080c25] backdrop-blur-md border-r border-white/20 flex flex-col items-center py-4 z-30 shadow-lg shadow-black/50">
        {/* Main Tools */}
        <div className="flex flex-col items-center">
          {mainTools.map(tool => (
            <button
              key={tool.id}
              onClick={() => {
                if (tool.action) {
                  tool.action()
                } else {
                  // VS Code style: toggle off if clicking active tool
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
              {/* Badge for modified files */}
              {tool.id === 'source-control' && modifiedFiles.length > 0 && (
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
          {bottomTools.map(tool => {
            const isLowBalance = tool.id === 'balance' && (clientAccount?.account_balance || 0) < 10
            return (
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
                    : isLowBalance
                    ? 'text-red-500 hover:bg-red-500/10 hover:text-red-400'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
                title={tool.label}
              >
                {tool.icon}
              </button>
            )
          })}
        </div>
      </div>

      {/* Sidebar Panel */}
      {activeTool && activeTool !== 'layout' && activeTool !== 'settings' && (
        <>
          {/* Panel */}
          <div className="fixed left-12 top-0 h-full w-64 bg-[#0a0e27] backdrop-blur-sm border-r border-white/20 z-30 shadow-2xl shadow-black/60">
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
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
                <div className="text-sm flex-1 overflow-y-auto panel-scroll">
                  {githubConnected === null ? (
                    <p className="text-muted-foreground">Checking GitHub connection...</p>
                  ) : !githubConnected ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/30 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold text-foreground">Connect GitHub</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Connect your GitHub repository to browse files, search code, and enable AI-powered development.
                        </p>
                        <button
                          onClick={() => {
                            window.location.href = '/api/integrations/github/install?redirect_to=/portal/projects/new'
                          }}
                          className="w-full px-3 py-2 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                        >
                          Install GitHub App
                        </button>
                      </div>
                      <div className="px-2">
                        <p className="text-xs text-muted-foreground">
                          After connecting GitHub, you'll be prompted to connect other services like Vercel and Stripe.
                        </p>
                      </div>
                    </div>
                  ) : loadingFiles ? (
                    <p className="text-muted-foreground">Loading files...</p>
                  ) : fileLoadError ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-2 mb-3">
                          <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-destructive mb-1">Connection Error</p>
                            <p className="text-xs text-destructive/90">{fileLoadError}</p>
                          </div>
                        </div>

                        {/* Help Toggle */}
                        <button
                          onClick={() => setShowReconnectHelp(!showReconnectHelp)}
                          className="w-full px-3 py-2 text-xs bg-muted/50 text-foreground rounded-lg hover:bg-muted transition-colors font-medium mb-2 flex items-center justify-between"
                        >
                          <span>How to Fix This</span>
                          <svg className={`w-4 h-4 transition-transform ${showReconnectHelp ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Expandable Help */}
                        {showReconnectHelp && (
                          <div className="bg-muted/30 rounded-lg p-3 mb-3 text-xs space-y-2">
                            <div className="flex items-start gap-2">
                              <span className="text-primary font-bold flex-shrink-0">1.</span>
                              <span className="text-muted-foreground">Go to <span className="text-foreground font-semibold">Settings</span> (gear icon, bottom left)</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-primary font-bold flex-shrink-0">2.</span>
                              <span className="text-muted-foreground">Click <span className="text-foreground font-semibold">Connected Services</span> tab</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-primary font-bold flex-shrink-0">3.</span>
                              <span className="text-muted-foreground">Click <span className="text-primary font-semibold">Reconnect GitHub</span> → confirm both alerts</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-primary font-bold flex-shrink-0">4.</span>
                              <span className="text-muted-foreground">You'll be redirected to GitHub automatically</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-primary font-bold flex-shrink-0">5.</span>
                              <span className="text-muted-foreground">Select repositories → GitHub redirects you back here</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                              <span className="text-muted-foreground">Done! Now try Explorer again</span>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            window.location.href = '/portal/settings'
                          }}
                          className="w-full px-3 py-2 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                        >
                          Go to Settings
                        </button>
                      </div>
                    </div>
                  ) : fileTree.length > 0 ? (
                    renderFileTree(fileTree)
                  ) : (
                    <div className="p-4">
                      <p className="text-muted-foreground text-xs mb-3">
                        GitHub is connected, but your project needs to be linked to a repository.
                      </p>
                      <button
                        onClick={() => {
                          window.location.href = '/portal/projects/new'
                        }}
                        className="w-full px-3 py-2 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                      >
                        Complete Project Setup
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Search Content */}
              {activeTool === 'search' && (
                <div className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search in files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full px-3 py-2 text-sm border-2 border-white/30 rounded-lg bg-[#080c25] text-white focus:outline-none focus:border-[#b1c6f9]/50 transition-all shadow-md"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={searching}
                      className="w-full mt-2 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {searching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto panel-scroll">
                    {searchResults.length > 0 ? (
                      <div className="space-y-2">
                        {searchResults.map((result, index) => (
                          <div key={index} className="p-2 hover:bg-muted/50 rounded cursor-pointer">
                            <div className="text-xs font-mono text-foreground">{result.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{result.path}</div>
                          </div>
                        ))}
                      </div>
                    ) : searchQuery && !searching ? (
                      <p className="text-xs text-muted-foreground">No results found</p>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Source Control Content */}
              {activeTool === 'source-control' && (
                <div className="text-sm flex-1 overflow-y-auto panel-scroll">
                  {modifiedFiles.length > 0 ? (
                    <>
                      <p className="mb-2 font-semibold text-foreground">
                        Modified Files ({modifiedFiles.length})
                      </p>
                      <div className="space-y-1">
                        {modifiedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/50 font-mono text-xs cursor-pointer"
                            onClick={async () => {
                              // Load file content just like Explorer does
                              try {
                                const installationParam = selectedInstallationId
                                  ? `&installation_id=${selectedInstallationId}`
                                  : ''
                                const response = await fetch(`/api/portal/file-content?path=${encodeURIComponent(file.path)}${installationParam}`)
                                if (response.ok) {
                                  const data = await response.json()
                                  onFileOpen?.({
                                    path: file.path,
                                    name: file.path.split('/').pop() || file.path,
                                    content: data.content
                                  })
                                }
                              } catch (error) {
                                console.error('Failed to load file content:', error)
                              }
                            }}
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
                        Click a file to view changes
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">No pending changes</p>
                  )}
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
                      window.location.href = '/portal/settings?tab=billing'
                    }}
                    className="w-full px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Manage Billing
                  </button>
                </div>
              )}

              {/* Help Content */}
              {activeTool === 'help' && <HelpAssistant />}
            </div>
          </div>
        </>
      )}
    </>
  )
}
