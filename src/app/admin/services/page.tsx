"use client"

import { useState, useEffect } from "react"
import { Service, ServicesResponse, SyncResponse } from "@/types/services"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  RefreshCw, 
  RotateCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Star,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react"

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState("")
  const [syncResults, setSyncResults] = useState<SyncResponse | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [showInactive])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (!showInactive) {
        params.append('active', 'true')
      } else {
        params.append('active', 'false')
      }

      const response = await fetch(`/api/services?${params}`)
      const data: ServicesResponse = await response.json()

      if (data.success) {
        setServices(data.data)
        setError("")
      } else {
        setError(data.error || 'Failed to load services')
      }
    } catch (error) {
      setError('Network error loading services')
    } finally {
      setLoading(false)
    }
  }

  const handleSyncAll = async () => {
    try {
      setSyncing(true)
      setSyncResults(null)
      
      const response = await fetch('/api/services/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token' // You should implement proper auth
        },
        body: JSON.stringify({ action: 'sync_all' })
      })

      const data: SyncResponse = await response.json()
      setSyncResults(data)
      
      if (data.success) {
        // Refresh services after sync
        await fetchServices()
      }
    } catch (error) {
      setError('Failed to sync services')
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncSingle = async (serviceId: string) => {
    try {
      setSyncing(true)
      
      const response = await fetch('/api/services/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer admin-token' // You should implement proper auth
        },
        body: JSON.stringify({ 
          action: 'sync_service',
          serviceId 
        })
      })

      const data: SyncResponse = await response.json()
      
      if (data.success) {
        // Refresh services after sync
        await fetchServices()
        alert('Service synced successfully!')
      } else {
        alert(`Sync failed: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert('Failed to sync service')
    } finally {
      setSyncing(false)
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <Star className="h-5 w-5 text-blue-500" />
      case 'build':
        return <Zap className="h-5 w-5 text-green-500" />
      case 'audit':
        return <CheckCircle className="h-5 w-5 text-orange-500" />
      case 'consultation':
        return <Clock className="h-5 w-5 text-purple-500" />
      default:
        return <Zap className="h-5 w-5" />
    }
  }

  const getStatusBadge = (service: Service) => {
    const hasStripeIds = service.stripe_price_id && service.stripe_product_id
    
    if (!service.is_active) {
      return <Badge variant="secondary"><EyeOff className="h-3 w-3 mr-1" />Inactive</Badge>
    } else if (hasStripeIds) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Synced</Badge>
    } else {
      return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Needs Sync</Badge>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <h1 className="text-3xl font-bold">Services Administration</h1>
          <p className="text-muted-foreground">Manage your services and Stripe integration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showInactive ? "default" : "outline"}
            onClick={() => setShowInactive(!showInactive)}
            size="sm"
          >
            {showInactive ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            {showInactive ? 'Show Active Only' : 'Show All'}
          </Button>
          <Button onClick={fetchServices} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={handleSyncAll} 
            disabled={syncing}
            size="sm"
          >
            <RotateCw className="h-4 w-4 mr-2" />
            {syncing ? 'Syncing...' : 'Sync All'}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* Sync Results */}
      {syncResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {syncResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Sync Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {syncResults.data.synced_products}
                </div>
                <div className="text-sm text-muted-foreground">Products Synced</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {syncResults.data.synced_prices}
                </div>
                <div className="text-sm text-muted-foreground">Prices Synced</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {syncResults.data.errors.length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
            
            {syncResults.data.errors.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-2">Errors:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {syncResults.data.errors.map((error, index) => (
                    <li key={index} className="text-sm text-red-600">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Services Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{services.length}</div>
            <div className="text-sm text-muted-foreground">Total Services</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {services.filter(s => s.is_active).length}
            </div>
            <div className="text-sm text-muted-foreground">Active Services</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {services.filter(s => s.stripe_price_id && s.stripe_product_id).length}
            </div>
            <div className="text-sm text-muted-foreground">Synced with Stripe</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {services.filter(s => s.is_active && (!s.stripe_price_id || !s.stripe_product_id)).length}
            </div>
            <div className="text-sm text-muted-foreground">Need Sync</div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.id} className={`${!service.is_active ? 'opacity-60' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getServiceIcon(service.service_type)}
                  <div>
                    <CardTitle className="text-lg">{service.service_name}</CardTitle>
                    <CardDescription>{service.service_type}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">${service.price}</div>
                  {getStatusBadge(service)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {service.description}
              </p>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{service.duration_estimate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{service.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order:</span>
                  <span>{service.order}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stripe Product:</span>
                  <span className={service.stripe_product_id ? 'text-green-600' : 'text-red-600'}>
                    {service.stripe_product_id ? '✓ Linked' : '✗ Missing'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stripe Price:</span>
                  <span className={service.stripe_price_id ? 'text-green-600' : 'text-red-600'}>
                    {service.stripe_price_id ? '✓ Linked' : '✗ Missing'}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handleSyncSingle(service.id)}
                disabled={syncing}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RotateCw className="h-3 w-3 mr-2" />
                {syncing ? 'Syncing...' : 'Sync to Stripe'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No services found.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Create services in your Airtable base to get started.
          </p>
        </div>
      )}
    </div>
  )
}