"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowRight,
  Database,
  Upload,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  Loader2
} from "lucide-react"

interface MigrationResult {
  success: boolean
  message: string
  stats: {
    totalProcessed: number
    migratedCount: number
    updatedCount?: number
    errorCount?: number
    skippedCount?: number
    successRate: string
  }
  errors: string[]
}

export default function AdminMigrationPage() {
  const [migratingAirtable, setMigratingAirtable] = useState(false)
  const [migratingWaitlist, setMigratingWaitlist] = useState(false)
  const [airtableResult, setAirtableResult] = useState<MigrationResult | null>(null)
  const [waitlistResult, setWaitlistResult] = useState<MigrationResult | null>(null)

  const handleMigrateAirtable = async () => {
    try {
      setMigratingAirtable(true)
      setAirtableResult(null)

      const response = await fetch('/api/admin/migrate-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'migrate_airtable_leads'
        })
      })

      const data = await response.json()
      setAirtableResult(data)

    } catch (error) {
      setAirtableResult({
        success: false,
        message: 'Failed to start migration',
        stats: {
          totalProcessed: 0,
          migratedCount: 0,
          updatedCount: 0,
          errorCount: 1,
          successRate: '0'
        },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setMigratingAirtable(false)
    }
  }

  const handleMigrateWaitlist = async () => {
    try {
      setMigratingWaitlist(true)
      setWaitlistResult(null)

      const response = await fetch('/api/admin/migrate-waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'migrate_waitlist'
        })
      })

      const data = await response.json()
      setWaitlistResult(data)

    } catch (error) {
      setWaitlistResult({
        success: false,
        message: 'Failed to start waitlist migration',
        stats: {
          totalProcessed: 0,
          migratedCount: 0,
          updatedCount: 0,
          errorCount: 1,
          successRate: '0'
        },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      })
    } finally {
      setMigratingWaitlist(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Data Migration</h1>
        <p className="text-muted-foreground">
          Migrate your existing leads from Airtable and waitlist to the new campaign management system
        </p>
      </div>

      {/* Migration Process */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Source: Airtable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-600" />
              Airtable Source
            </CardTitle>
            <CardDescription>Your existing Website Analyzer Leads table</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">Website Analyzer Leads</div>
                <div className="text-sm text-muted-foreground">
                  Airtable table with lead data
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>📧 Email addresses</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span>👤 Names</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span>🔗 URLs tested</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span>📊 Quick scores</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span>📅 Test dates</span>
                <span className="text-green-600">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Destination: Supabase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Supabase Destination
            </CardTitle>
            <CardDescription>New campaign management database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">Leads Table</div>
                <div className="text-sm text-muted-foreground">
                  Campaign-ready lead database
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>🏷️ Segmentation tags</span>
                <span className="text-blue-600">New</span>
              </div>
              <div className="flex justify-between">
                <span>📈 Campaign tracking</span>
                <span className="text-blue-600">New</span>
              </div>
              <div className="flex justify-between">
                <span>🎯 Audience targeting</span>
                <span className="text-blue-600">New</span>
              </div>
              <div className="flex justify-between">
                <span>📧 Email preferences</span>
                <span className="text-blue-600">New</span>
              </div>
              <div className="flex justify-between">
                <span>🔄 Sync capabilities</span>
                <span className="text-blue-600">New</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Migration Action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Migration Process
          </CardTitle>
          <CardDescription>
            This will copy all your Airtable leads to the new system while preserving existing data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!airtableResult && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">What this migration does:</h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Copies all lead data from your Airtable base</li>
                  <li>• Creates new leads in the campaign system</li>
                  <li>• Updates existing leads if they already exist</li>
                  <li>• Preserves all original data in custom fields</li>
                  <li>• Adds migration tags for easy identification</li>
                  <li>• Safe to run multiple times (won't create duplicates)</li>
                </ul>
              </div>

              <Button
                onClick={handleMigrateAirtable}
                disabled={migratingAirtable}
                className="w-full"
                size="lg"
              >
                {migratingAirtable ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Migrating Data...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Start Migration
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Migration Results */}
          {airtableResult && (
            <div className="space-y-4">
              {/* Status */}
              <div className={`p-4 rounded-lg border ${
                airtableResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {airtableResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <h4 className={`font-semibold ${
                    airtableResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {airtableResult.success ? 'Migration Completed' : 'Migration Failed'}
                  </h4>
                </div>
                <p className={`text-sm ${
                  airtableResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {airtableResult.message}
                </p>
              </div>

              {/* Stats */}
              {airtableResult.success && airtableResult.stats && (
                <div className="grid md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {airtableResult.stats.totalProcessed}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Processed</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {airtableResult.stats.migratedCount}
                      </div>
                      <div className="text-sm text-muted-foreground">New Leads</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {airtableResult.stats.updatedCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Updated</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {airtableResult.stats.successRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Success Rate Progress */}
              {airtableResult.success && airtableResult.stats && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Migration Success Rate</span>
                    <span>{airtableResult.stats.successRate}%</span>
                  </div>
                  <Progress value={parseFloat(airtableResult.stats.successRate)} className="w-full" />
                </div>
              )}

              {/* Errors */}
              {airtableResult.errors && airtableResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-700">Errors:</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {airtableResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        • {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setAirtableResult(null)}
                  variant="outline"
                >
                  Reset
                </Button>
                <Button
                  onClick={handleMigrateAirtable}
                  disabled={migratingAirtable}
                >
                  Run Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Waitlist Migration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Waitlist Migration
          </CardTitle>
          <CardDescription>
            Migrate your coming-soon waitlist emails to the campaign system with tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!waitlistResult && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">What this migration does:</h4>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>• Copies all emails from your waitlist table to leads</li>
                  <li>• Creates leads with "waitlist" status and "coming_soon" tags</li>
                  <li>• Sets up email open tracking in leads table</li>
                  <li>• Safely migrates data (won't create duplicates)</li>
                  <li>• Safe to run multiple times (won't create duplicates)</li>
                  <li>• Enables targeted campaigns to your early supporters</li>
                </ul>
              </div>

              <Button
                onClick={handleMigrateWaitlist}
                disabled={migratingWaitlist}
                className="w-full"
                size="lg"
                variant="outline"
              >
                {migratingWaitlist ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Migrating Waitlist...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Migrate Waitlist to Campaign System
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Waitlist Migration Results */}
          {waitlistResult && (
            <div className="space-y-4">
              {/* Status */}
              <div className={`p-4 rounded-lg border ${
                waitlistResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {waitlistResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                  <h4 className={`font-semibold ${
                    waitlistResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {waitlistResult.success ? 'Waitlist Migration Completed' : 'Migration Failed'}
                  </h4>
                </div>
                <p className={`text-sm ${
                  waitlistResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {waitlistResult.message}
                </p>
              </div>

              {/* Stats */}
              {waitlistResult.success && waitlistResult.stats && (
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {waitlistResult.stats.migratedCount}
                      </div>
                      <div className="text-sm text-muted-foreground">New Leads</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {waitlistResult.stats.updatedCount || waitlistResult.stats.skippedCount || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Already Existed</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {waitlistResult.stats.successRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setWaitlistResult(null)}
                  variant="outline"
                >
                  Reset
                </Button>
                <Button
                  onClick={handleMigrateWaitlist}
                  disabled={migratingWaitlist}
                >
                  Run Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>After Migration</CardTitle>
          <CardDescription>What you can do once your leads are migrated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-700">1</Badge>
                <span className="font-medium">Create Campaigns</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Use the campaign builder to create targeted email campaigns for your migrated leads.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700">2</Badge>
                <span className="font-medium">Segment Audiences</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Filter leads by source, signup date, or custom fields to create targeted segments.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-100 text-purple-700">3</Badge>
                <span className="font-medium">Track Performance</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Monitor email open rates, click rates, and campaign performance analytics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}