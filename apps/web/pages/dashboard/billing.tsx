'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';

import { 
  PlanSelector, 
  BillingDashboard, 
  InvoiceList, 
  UpgradeButton 
} from '@/components/billing/BillingComponents';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  TrendingUp, 
  FileText, 
  Settings, 
  ArrowLeft,
  Loader2
} from 'lucide-react';

interface Plan {
  plan_type: string;
  name: string;
  description: string;
  features: string[];
  limits: Record<string, any>;
  price_id: string | null;
}

interface UsageData {
  plan: string;
  plan_name: string;
  features: string[];
  usage: Record<string, number>;
  limits: Record<string, any>;
  percentages: Record<string, number>;
  subscription: {
    status: string;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  };
}

interface Invoice {
  id: number;
  amount: number;
  currency: string;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  created_at: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all data in parallel
      const [plansRes, usageRes, invoicesRes] = await Promise.all([
        fetch('/api/v1/billing/plans'),
        fetch('/api/v1/billing/usage'),
        fetch('/api/v1/billing/invoices')
      ]);

      if (!plansRes.ok || !usageRes.ok || !invoicesRes.ok) {
        throw new Error('Failed to fetch billing data');
      }

      const [plansData, usageDataResponse, invoicesData] = await Promise.all([
        plansRes.json(),
        usageRes.json(),
        invoicesRes.json()
      ]);

      setPlans(plansData);
      setUsageData(usageDataResponse);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planType: string) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch('/api/v1/billing/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_type: planType }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update subscription');
      }

      const result = await response.json();
      
      // If we have a client secret, we need to complete the payment with Stripe
      if (result.client_secret) {
        // Here you would typically use Stripe Elements to collect payment
        // For now, we'll just show a success message
        toast.success('Subscription updated! Please complete payment if required.');
      } else {
        toast.success('Subscription updated successfully!');
      }
      
      // Refresh data
      await fetchBillingData();
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update subscription');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    try {
      setIsUpdating(true);
      
      const response = await fetch('/api/v1/billing/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ at_period_end: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to cancel subscription');
      }

      toast.success('Subscription will be canceled at the end of the billing period');
      await fetchBillingData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel subscription');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setIsUpdating(true);
      
      const response = await fetch('/api/v1/billing/billing-portal', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to open billing portal');
      }

      const { portal_url } = await response.json();
      window.open(portal_url, '_blank');
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading billing information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!usageData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Billing Error</h1>
          <p className="text-gray-600 mb-4">Unable to load billing information</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-gray-600 mt-2">
              Manage your subscription plan and view usage statistics
            </p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <BillingDashboard
            usageData={usageData}
            onManageBilling={handleManageBilling}
            isLoading={isUpdating}
          />
        </TabsContent>

        <TabsContent value="plans" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Subscription Plans</h2>
            <p className="text-gray-600">
              Choose the plan that best fits your needs
            </p>
          </div>
          
          <PlanSelector
            plans={plans}
            currentPlan={usageData.plan}
            onUpgrade={handleUpgrade}
            onCancel={handleCancel}
            isLoading={isUpdating}
          />
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Billing History</h2>
            <p className="text-gray-600">
              View and download your past invoices
            </p>
          </div>
          
          <InvoiceList
            invoices={invoices}
            isLoading={isUpdating}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Billing Settings</h2>
            <p className="text-gray-600">
              Manage your payment methods and billing preferences
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>
                Update your payment methods and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleManageBilling} disabled={isUpdating}>
                <CreditCard className="w-4 h-4 mr-2" />
                {isUpdating ? 'Opening...' : 'Manage Payment Methods'}
              </Button>
              
              <p className="text-sm text-gray-500">
                This will open Stripe's secure billing portal where you can update your payment methods, view invoices, and manage your subscription.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Information about your current subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{usageData.plan_name}</p>
                  <p className="text-sm text-gray-500">
                    Status: <Badge variant="outline">{usageData.subscription.status}</Badge>
                  </p>
                </div>
                <UpgradeButton
                  currentPlan={usageData.plan}
                  onUpgrade={() => setActiveTab('plans')}
                  isLoading={isUpdating}
                />
              </div>
              
              {usageData.subscription.cancel_at_period_end && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    Your subscription will cancel at the end of the current billing period on {usageData.subscription.current_period_end ? new Date(usageData.subscription.current_period_end).toLocaleDateString() : 'N/A'}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
