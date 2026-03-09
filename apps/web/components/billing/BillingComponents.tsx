'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Users, 
  Zap, 
  Database,
  Calendar,
  CreditCard,
  ArrowUpRight,
  AlertCircle
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

interface PlanSelectorProps {
  plans: Plan[];
  currentPlan: string;
  onUpgrade: (planType: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PlanSelector({ plans, currentPlan, onUpgrade, onCancel, isLoading }: PlanSelectorProps) {
  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'free': return 'bg-gray-100 border-gray-300';
      case 'pro': return 'bg-blue-50 border-blue-300';
      case 'team': return 'bg-purple-50 border-purple-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getBadgeVariant = (planType: string, current: string) => {
    if (planType === current) return 'default';
    return 'secondary';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card 
          key={plan.plan_type} 
          className={`relative ${getPlanColor(plan.plan_type)} border-2 ${
            plan.plan_type === currentPlan ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          {plan.plan_type === currentPlan && (
            <Badge className="absolute -top-2 -right-2" variant="default">
              Current Plan
            </Badge>
          )}
          
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {plan.name}
              <Badge variant={getBadgeVariant(plan.plan_type, currentPlan)}>
                {plan.plan_type.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Features:</h4>
              <ul className="space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Limits:</h4>
              <div className="text-sm space-y-1">
                {Object.entries(plan.limits).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace('_', ' ')}:</span>
                    <span>
                      {value === Infinity ? 'Unlimited' : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              {plan.plan_type === currentPlan ? (
                <div className="space-y-2">
                  <Button 
                    onClick={onCancel} 
                    variant="outline" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    Cancel Subscription
                  </Button>
                  {currentPlan !== 'free' && (
                    <p className="text-xs text-gray-500 text-center">
                      Plan will remain active until period end
                    </p>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={() => onUpgrade(plan.plan_type)} 
                  className="w-full"
                  disabled={isLoading}
                >
                  {currentPlan === 'free' ? 'Upgrade' : 'Change Plan'}
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface UsageMeterProps {
  feature: string;
  current: number;
  limit: number;
  percentage: number;
}

export function UsageMeter({ feature, current, limit, percentage }: UsageMeterProps) {
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatFeatureName = (feature: string) => {
    return feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{formatFeatureName(feature)}</span>
        <span className="text-sm text-gray-600">
          {current} / {limit === Infinity ? '∞' : limit}
        </span>
      </div>
      <Progress 
        value={limit === Infinity ? 0 : percentage} 
        className="h-2"
      />
      {limit !== Infinity && (
        <div className={`h-1 rounded-full ${getProgressColor()}`} 
             style={{ width: `${percentage}%` }} />
      )}
    </div>
  );
}

interface BillingDashboardProps {
  usageData: UsageData;
  onManageBilling: () => void;
  isLoading?: boolean;
}

export function BillingDashboard({ usageData, onManageBilling, isLoading }: BillingDashboardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'past_due': return 'text-yellow-600';
      case 'canceled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Plan: {usageData.plan_name}</span>
            <Badge variant="outline" className={getStatusColor(usageData.subscription.status)}>
              {usageData.subscription.status}
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage your subscription and view usage statistics
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                Period: {formatDate(usageData.subscription.current_period_start)} - {formatDate(usageData.subscription.current_period_end)}
              </span>
            </div>
            
            {usageData.subscription.cancel_at_period_end && (
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Cancels at period end</span>
              </div>
            )}
          </div>
          
          <Button onClick={onManageBilling} disabled={isLoading} className="w-full md:w-auto">
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Billing
          </Button>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Usage Statistics
          </CardTitle>
          <CardDescription>
            Current usage for this billing period
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {Object.entries(usageData.usage).map(([feature, current]) => (
              <UsageMeter
                key={feature}
                feature={feature}
                current={current}
                limit={usageData.limits[feature]}
                percentage={usageData.percentages[feature]}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Plan Features
          </CardTitle>
          <CardDescription>
            Features included in your current plan
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <ul className="space-y-2">
            {usageData.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

interface InvoiceListProps {
  invoices: Array<{
    id: number;
    amount: number;
    currency: string;
    status: string;
    due_date: string | null;
    paid_at: string | null;
    hosted_invoice_url: string | null;
    invoice_pdf: string | null;
    created_at: string;
  }>;
  isLoading?: boolean;
}

export function InvoiceList({ invoices, isLoading }: InvoiceListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'void': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-16 bg-gray-200 rounded"></div>
      ))}
    </div>;
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No invoices yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>
          View and download your past invoices
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-medium">
                    ${invoice.amount.toFixed(2)} {invoice.currency.toUpperCase()}
                  </span>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Created: {new Date(invoice.created_at).toLocaleDateString()}
                  {invoice.due_date && ` • Due: ${new Date(invoice.due_date).toLocaleDateString()}`}
                  {invoice.paid_at && ` • Paid: ${new Date(invoice.paid_at).toLocaleDateString()}`}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {invoice.hosted_invoice_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={invoice.hosted_invoice_url} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                )}
                {invoice.invoice_pdf && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface UpgradeButtonProps {
  currentPlan: string;
  onUpgrade: () => void;
  isLoading?: boolean;
}

export function UpgradeButton({ currentPlan, onUpgrade, isLoading }: UpgradeButtonProps) {
  if (currentPlan !== 'free') {
    return null;
  }

  return (
    <Button onClick={onUpgrade} disabled={isLoading} className="w-full">
      <ArrowUpRight className="w-4 h-4 mr-2" />
      Upgrade to Pro
    </Button>
  );
}
