'use client'

import React, { useState, useEffect } from 'react'
import {
  PlanSelector,
  BillingDashboard,
  InvoiceList,
} from '@/components/billing/BillingComponents'
import { apiClient } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function BillingPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [usageData, setUsageData] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const { toast } = useToast()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [plansRes, usageRes, invoicesRes] = await Promise.all([
        apiClient.getAvailablePlans(),
        apiClient.getUsageStats(),
        apiClient.getBillingInvoices(),
      ])
      setPlans(plansRes)
      setUsageData(usageRes)
      setInvoices(invoicesRes)
    } catch (error: any) {
      toast(error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleUpgrade = async (planType: string) => {
    setIsActionLoading(true)
    try {
      const result = await apiClient.createSubscription(planType)
      if (result.checkout_url) {
        window.location.href = result.checkout_url
      } else if (result.status === 'success') {
        toast(`Successfully switched to ${planType} plan.`, 'success')
        fetchData()
      }
    } catch (error: any) {
      toast(error.message, 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return

    setIsActionLoading(true)
    try {
      await apiClient.cancelSubscription(true)
      toast(
        'Your subscription will remain active until the end of the current period.',
        'info'
      )
      fetchData()
    } catch (error: any) {
      toast(error.message, 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setIsActionLoading(true)
    try {
      const { portal_url } = await apiClient.createBillingPortalSession()
      window.location.href = portal_url
    } catch (error: any) {
      toast(error.message, 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Billing & Subscriptions
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your plan, view usage, and download invoices.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {usageData && (
            <BillingDashboard
              usageData={usageData}
              onManageBilling={handleManageBilling}
              isLoading={isActionLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="plans">
          <PlanSelector
            plans={plans}
            currentPlan={usageData?.plan || 'free'}
            onUpgrade={handleUpgrade}
            onCancel={handleCancel}
            isLoading={isActionLoading}
          />
        </TabsContent>

        <TabsContent value="history">
          <InvoiceList invoices={invoices} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
