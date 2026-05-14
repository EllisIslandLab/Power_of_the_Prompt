"use client"

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OnlineIndicator } from '@/components/ui/online-indicator'
import { SessionCounter } from '@/components/ui/session-counter'
import { Users, Search, UserCog, Mail, Calendar, Shield, Settings, Github, Globe } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

// Use browser client for proper cookie handling in client components
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  tier: string
  payment_status: string
  created_at: string
}

interface ProjectConfig {
  github_repo_url: string
  github_branch: string
  vercel_project_name: string
  vercel_team_slug: string
  website_url: string
  public_folder_path: string
  images_folder_path: string
  is_configured: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [projectConfig, setProjectConfig] = useState<ProjectConfig>({
    github_repo_url: '',
    github_branch: 'main',
    vercel_project_name: '',
    vercel_team_slug: '',
    website_url: '',
    public_folder_path: '/public',
    images_folder_path: '/public/images',
    is_configured: false,
  })
  const [savingProject, setSavingProject] = useState(false)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, roleFilter, tierFilter, users])

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterUsers() {
    let filtered = [...users]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Tier filter
    if (tierFilter !== 'all') {
      filtered = filtered.filter(user => user.tier === tierFilter)
    }

    setFilteredUsers(filtered)
  }

  async function updateUserRole(userId: string, newRole: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
      alert('User role updated successfully')
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Failed to update user role')
    }
  }

  async function loadProjectConfig(user: User) {
    try {
      setSelectedUser(user)

      // Get client account ID
      const { data: clientAccount } = await supabase
        .from('client_accounts')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!clientAccount) {
        // No client account yet, use default config
        setProjectConfig({
          github_repo_url: '',
          github_branch: 'main',
          vercel_project_name: '',
          vercel_team_slug: '',
          website_url: '',
          public_folder_path: '/public',
          images_folder_path: '/public/images',
          is_configured: false,
        })
        setProjectDialogOpen(true)
        return
      }

      // Load existing config
      const { data: config } = await supabase
        .from('client_website_config')
        .select('*')
        .eq('client_account_id', clientAccount.id)
        .single()

      if (config) {
        setProjectConfig(config)
      } else {
        // No config yet, use defaults
        setProjectConfig({
          github_repo_url: '',
          github_branch: 'main',
          vercel_project_name: '',
          vercel_team_slug: '',
          website_url: '',
          public_folder_path: '/public',
          images_folder_path: '/public/images',
          is_configured: false,
        })
      }

      setProjectDialogOpen(true)
    } catch (error) {
      console.error('Error loading project config:', error)
      alert('Failed to load project configuration')
    }
  }

  async function saveProjectConfig() {
    if (!selectedUser) return

    setSavingProject(true)
    try {
      // Get or create client account
      let { data: clientAccount } = await supabase
        .from('client_accounts')
        .select('id')
        .eq('user_id', selectedUser.id)
        .single()

      if (!clientAccount) {
        const { data: newAccount, error: accountError } = await supabase
          .from('client_accounts')
          .insert({ user_id: selectedUser.id })
          .select('id')
          .single()

        if (accountError) throw accountError
        clientAccount = newAccount
      }

      // Upsert project config
      const { error } = await supabase
        .from('client_website_config')
        .upsert({
          client_account_id: clientAccount.id,
          ...projectConfig,
          is_configured: true,
        })

      if (error) throw error

      alert('Project configuration saved successfully!')
      setProjectDialogOpen(false)
    } catch (error) {
      console.error('Error saving project config:', error)
      alert('Failed to save project configuration')
    } finally {
      setSavingProject(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary'
  }

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'premium': return 'default'
      case 'standard': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-8 w-8" />
          User Management
        </h1>
        <p className="text-muted-foreground">
          Manage student and admin accounts, view session counts, and monitor online status
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'student').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* This would require checking presence data */}
              -
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tier</label>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and view session information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>LVL UP Sessions</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name || 'No name'}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <OnlineIndicator userId={user.id} showLabel />
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTierBadgeVariant(user.tier)}>
                          {user.tier}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.role === 'student' && (
                          <SessionCounter userId={user.id} variant="compact" />
                        )}
                        {user.role === 'admin' && (
                          <span className="text-sm text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateUserRole(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadProjectConfig(user)}
                            title="Configure project"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Project Configuration Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configure Project for {selectedUser?.full_name || selectedUser?.email}
            </DialogTitle>
            <DialogDescription>
              Set up the client's website project configuration. All fields are managed by you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* GitHub Configuration */}
            <div className="space-y-3 p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Github className="h-4 w-4" />
                <h3 className="font-semibold">GitHub Repository</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_repo">Repository URL</Label>
                <Input
                  id="github_repo"
                  placeholder="https://github.com/your-org/client-project"
                  value={projectConfig.github_repo_url}
                  onChange={(e) => setProjectConfig({ ...projectConfig, github_repo_url: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  The GitHub repository where the client's code is stored
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github_branch">Branch</Label>
                <Input
                  id="github_branch"
                  placeholder="main"
                  value={projectConfig.github_branch}
                  onChange={(e) => setProjectConfig({ ...projectConfig, github_branch: e.target.value })}
                />
              </div>
            </div>

            {/* Vercel Configuration */}
            <div className="space-y-3 p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4" />
                <h3 className="font-semibold">Vercel Deployment</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vercel_project">Project Name</Label>
                <Input
                  id="vercel_project"
                  placeholder="client-website-prod"
                  value={projectConfig.vercel_project_name}
                  onChange={(e) => setProjectConfig({ ...projectConfig, vercel_project_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vercel_team">Team Slug (optional)</Label>
                <Input
                  id="vercel_team"
                  placeholder="your-team-slug"
                  value={projectConfig.vercel_team_slug}
                  onChange={(e) => setProjectConfig({ ...projectConfig, vercel_team_slug: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">Live Website URL</Label>
                <Input
                  id="website_url"
                  placeholder="https://client-website.vercel.app"
                  value={projectConfig.website_url}
                  onChange={(e) => setProjectConfig({ ...projectConfig, website_url: e.target.value })}
                />
              </div>
            </div>

            {/* File Paths */}
            <div className="space-y-3 p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">File Paths</h3>

              <div className="space-y-2">
                <Label htmlFor="public_folder">Public Folder Path</Label>
                <Input
                  id="public_folder"
                  placeholder="/public"
                  value={projectConfig.public_folder_path}
                  onChange={(e) => setProjectConfig({ ...projectConfig, public_folder_path: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images_folder">Images Folder Path</Label>
                <Input
                  id="images_folder"
                  placeholder="/public/images"
                  value={projectConfig.images_folder_path}
                  onChange={(e) => setProjectConfig({ ...projectConfig, images_folder_path: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setProjectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={saveProjectConfig}
              disabled={savingProject}
            >
              {savingProject ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
