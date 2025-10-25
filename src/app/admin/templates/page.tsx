"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  FileText,
  Eye,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
  RefreshCw,
  Search,
  Sparkles
} from "lucide-react"

interface EmailTemplate {
  id: string
  name: string
  description: string
  category: string
  subject_template: string
  content_template: string
  variables: string[]
  is_active: boolean
  created_at: string
  created_by: string
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showOpenModal, setShowOpenModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "general",
    subjectTemplate: "",
    contentTemplate: "",
    variables: [] as string[]
  })

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    category: "general",
    subjectTemplate: "",
    contentTemplate: "",
    variables: [] as string[]
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/templates')
      const data = await response.json()

      if (data.success) {
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          subjectTemplate: formData.subjectTemplate,
          contentTemplate: formData.contentTemplate,
          variables: formData.variables,
          createdBy: 'admin'
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowCreateModal(false)
        resetForm()
        fetchTemplates()
      } else {
        alert('Failed to create template: ' + data.error)
      }
    } catch (error) {
      alert('Failed to create template')
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/templates?id=${templateId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        fetchTemplates()
      } else {
        alert('Failed to delete template: ' + data.error)
      }
    } catch (error) {
      alert('Failed to delete template')
    }
  }

  const handleDuplicateTemplate = async (template: EmailTemplate) => {
    setFormData({
      name: `Copy of ${template.name}`,
      description: template.description,
      category: template.category,
      subjectTemplate: template.subject_template,
      contentTemplate: template.content_template,
      variables: template.variables
    })
    setShowCreateModal(true)
  }

  const handleOpenTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template)
    setEditFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      subjectTemplate: template.subject_template,
      contentTemplate: template.content_template,
      variables: template.variables
    })
    setIsEditMode(false)
    setShowOpenModal(true)
  }

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return

    try {
      const response = await fetch('/api/admin/templates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: selectedTemplate.id,
          name: editFormData.name,
          description: editFormData.description,
          category: editFormData.category,
          subjectTemplate: editFormData.subjectTemplate,
          contentTemplate: editFormData.contentTemplate,
          variables: editFormData.variables
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowOpenModal(false)
        setIsEditMode(false)
        fetchTemplates()
      } else {
        alert('Failed to update template: ' + data.error)
      }
    } catch (error) {
      alert('Failed to update template')
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "general",
      subjectTemplate: "",
      contentTemplate: "",
      variables: []
    })
  }

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/{{\s*(\w+)\s*}}/g)
    if (!matches) return []

    return [...new Set(matches.map(match =>
      match.replace(/[{}]/g, '').trim()
    ))]
  }

  const handleContentChange = (field: 'subjectTemplate' | 'contentTemplate', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      variables: [
        ...new Set([
          ...extractVariables(field === 'subjectTemplate' ? value : prev.subjectTemplate),
          ...extractVariables(field === 'contentTemplate' ? value : prev.contentTemplate)
        ])
      ]
    }))
  }

  const handleEditContentChange = (field: 'subjectTemplate' | 'contentTemplate', value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
      variables: [
        ...new Set([
          ...extractVariables(field === 'subjectTemplate' ? value : prev.subjectTemplate),
          ...extractVariables(field === 'contentTemplate' ? value : prev.contentTemplate)
        ])
      ]
    }))
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(templates.map(t => t.category))]

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Manage reusable email templates for campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchTemplates} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || categoryFilter !== 'all'
                ? "Try adjusting your search or filters"
                : "Create your first email template to get started"
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className={!template.is_active ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenTemplate(template)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Open
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium mb-1">Subject:</div>
                  <div className="text-muted-foreground bg-muted p-2 rounded text-xs">
                    {template.subject_template}
                  </div>
                </div>

                {template.variables.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Variables:</div>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Created {new Date(template.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Template Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Create Email Template
            </DialogTitle>
            <DialogDescription>
              Create a reusable email template for your campaigns
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Welcome Email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="announcements">Announcements</SelectItem>
                    <SelectItem value="testimonials">Testimonials</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of this template"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject Template</Label>
              <Input
                id="subject"
                value={formData.subjectTemplate}
                onChange={(e) => handleContentChange('subjectTemplate', e.target.value)}
                placeholder="Welcome to {{company_name}}, {{name}}!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content Template</Label>
              <Textarea
                id="content"
                value={formData.contentTemplate}
                onChange={(e) => handleContentChange('contentTemplate', e.target.value)}
                placeholder="Hi {{name}}, welcome to our platform..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            {formData.variables.length > 0 && (
              <div>
                <Label>Variables Found:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.variables.map((variable) => (
                    <Badge key={variable} variant="outline">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate} disabled={!formData.name || !formData.subjectTemplate}>
                Create Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Open/Edit Modal */}
      <Dialog open={showOpenModal} onOpenChange={(open) => {
        setShowOpenModal(open)
        if (!open) setIsEditMode(false)
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  {isEditMode ? <Edit className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  {isEditMode ? 'Edit Template' : 'View Template'}
                </DialogTitle>
                <DialogDescription>
                  {selectedTemplate?.name} - {selectedTemplate?.category}
                </DialogDescription>
              </div>
              {!isEditMode && (
                <Button variant="outline" onClick={() => setIsEditMode(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6">
              {isEditMode ? (
                // Edit Mode
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Template Name</Label>
                      <Input
                        id="edit-name"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Category</Label>
                      <Select
                        value={editFormData.category}
                        onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="welcome">Welcome</SelectItem>
                          <SelectItem value="announcements">Announcements</SelectItem>
                          <SelectItem value="testimonials">Testimonials</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-subject">Subject Template</Label>
                    <Input
                      id="edit-subject"
                      value={editFormData.subjectTemplate}
                      onChange={(e) => handleEditContentChange('subjectTemplate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-content">Content Template</Label>
                    <Textarea
                      id="edit-content"
                      value={editFormData.contentTemplate}
                      onChange={(e) => handleEditContentChange('contentTemplate', e.target.value)}
                      rows={15}
                      className="font-mono text-sm"
                    />
                  </div>

                  {editFormData.variables.length > 0 && (
                    <div>
                      <Label>Variables Found:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editFormData.variables.map((variable) => (
                          <Badge key={variable} variant="outline">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => {
                      setIsEditMode(false)
                      setEditFormData({
                        name: selectedTemplate.name,
                        description: selectedTemplate.description,
                        category: selectedTemplate.category,
                        subjectTemplate: selectedTemplate.subject_template,
                        contentTemplate: selectedTemplate.content_template,
                        variables: selectedTemplate.variables
                      })
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateTemplate} disabled={!editFormData.name || !editFormData.subjectTemplate}>
                      Save Changes
                    </Button>
                  </div>
                </>
              ) : (
                // View Mode
                <>
                  <div>
                    <Label className="font-semibold">Subject:</Label>
                    <div className="text-sm border rounded p-2 bg-muted mt-1">
                      {selectedTemplate.subject_template}
                    </div>
                  </div>
                  <div>
                    <Label className="font-semibold">Content:</Label>
                    <div
                      className="text-sm border rounded p-4 bg-white max-h-96 overflow-y-auto mt-1"
                      dangerouslySetInnerHTML={{
                        __html: selectedTemplate.content_template.replace(/\n/g, '<br>')
                      }}
                    />
                  </div>
                  {selectedTemplate.variables.length > 0 && (
                    <div>
                      <Label className="font-semibold">Variables:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTemplate.variables.map((variable) => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}