'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { CreditCard, TrendingUp, Users, Package, CheckCircle, AlertCircle, Clock, DollarSign } from 'lucide-react'

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('overview')
  
  const currentPlan = {
    name: 'Pro Plan',
    price: 29,
    status: 'active',
    features: ['Unlimited AI tasks', 'Priority support', 'Advanced analytics', 'Team collaboration'],
    nextBilling: '2024-02-15'
  }

  const usageStats = [
    {
      label: 'AI Tasks',
      used: 247,
      limit: 'Unlimited',
      percentage: 25,
      icon: Package
    },
    {
      label: 'Team Members',
      used: 12,
      limit: 20,
      percentage: 60,
      icon: Users
    },
    {
      label: 'API Calls',
      used: 89234,
      limit: 100000,
      percentage: 89,
      icon: TrendingUp
    },
    {
      label: 'Storage',
      used: 2.3,
      limit: 10,
      percentage: 23,
      icon: Package
    }
  ]

  const recentTransactions = [
    {
      id: 1,
      date: '2024-01-15',
      description: 'Pro Plan Subscription',
      amount: 29.00,
      status: 'completed',
      type: 'subscription'
    },
    {
      id: 2,
      date: '2024-01-10',
      description: 'AI Task Credits',
      amount: 10.00,
      status: 'completed',
      type: 'credit'
    },
    {
      id: 3,
      date: '2024-01-05',
      description: 'Pro Plan Subscription',
      amount: 29.00,
      status: 'completed',
      type: 'subscription'
    },
    {
      id: 4,
      date: '2023-12-15',
      description: 'Pro Plan Subscription',
      amount: 29.00,
      status: 'completed',
      type: 'subscription'
    }
  ]

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: [
        '100 AI tasks per month',
        'Basic support',
        'Standard analytics',
        'Up to 3 team members'
      ],
      popular: false,
      current: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      features: [
        'Unlimited AI tasks',
        'Priority support',
        'Advanced analytics',
        'Up to 20 team members',
        'Custom integrations'
      ],
      popular: true,
      current: true
    },
    {
      id: 'team',
      name: 'Team',
      price: 99,
      features: [
        'Everything in Pro',
        'Dedicated support',
        'Custom training',
        'Unlimited team members',
        'SLA guarantee'
      ],
      popular: false,
      current: false
    }
  ]

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-green-600 bg-green-100',
      pending: 'text-yellow-600 bg-yellow-100',
      failed: 'text-red-600 bg-red-100'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'usage', name: 'Usage' },
    { id: 'billing', name: 'Billing' },
    { id: 'plans', name: 'Plans' }
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
              <p className="text-gray-600">Manage your subscription and billing</p>
            </div>
          </div>
        </div>

        {/* Current Plan Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <h3 className="font-medium text-blue-900">Current Plan: {currentPlan.name}</h3>
                <p className="text-blue-700 text-sm">Next billing date: {currentPlan.nextBilling}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-900">${currentPlan.price}/mo</p>
              <p className="text-blue-700 text-sm">Auto-renewal enabled</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Spend</p>
                    <p className="text-2xl font-bold text-gray-900">$29</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">AI Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">247</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">API Calls</p>
                    <p className="text-2xl font-bold text-gray-900">89.2K</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {transaction.type === 'subscription' ? (
                            <CreditCard className="w-5 h-5 text-gray-400" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">${transaction.amount.toFixed(2)}</p>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Current Usage</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {usageStats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <stat.icon className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="font-medium text-gray-900">{stat.label}</h3>
                    </div>
                    <span className="text-sm text-gray-500">
                      {stat.used} / {stat.limit}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          stat.percentage > 80 ? 'bg-red-600' :
                          stat.percentage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{stat.percentage}% used</span>
                    {stat.percentage > 80 && (
                      <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        Near limit
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Visa ending in 4242</p>
                    <p className="text-sm text-gray-500">Expires 12/25</p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Update
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${transaction.amount.toFixed(2)}</p>
                      <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
                        Download Invoice
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Available Plans</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className={`bg-white rounded-lg shadow ${plan.popular ? 'border-2 border-blue-500' : ''}`}>
                  {plan.popular && (
                    <div className="bg-blue-500 text-white text-center py-2 text-sm font-medium rounded-t-lg">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                        <span className="text-gray-500">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                        plan.current
                          ? 'bg-gray-200 text-gray-700 cursor-not-allowed'
                          : plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      disabled={plan.current}
                    >
                      {plan.current ? 'Current Plan' : 'Upgrade Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
