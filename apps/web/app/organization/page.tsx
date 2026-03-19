'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Users, Mail, Shield, Settings, Plus, Search, Filter, MoreHorizontal, UserPlus, UserMinus } from 'lucide-react'

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState('members')
  const [searchTerm, setSearchTerm] = useState('')
  
  const members = [
    {
      id: 1,
      name: 'John Developer',
      email: 'john@aidev.os',
      role: 'admin',
      status: 'active',
      joinedAt: '2024-01-01',
      lastActive: '2 hours ago',
      avatar: 'https://ui-avatars.com/api/?name=John+Developer&background=0d47a1&color=fff'
    },
    {
      id: 2,
      name: 'Alice Designer',
      email: 'alice@aidev.os',
      role: 'developer',
      status: 'active',
      joinedAt: '2024-01-05',
      lastActive: '1 day ago',
      avatar: 'https://ui-avatars.com/api/?name=Alice+Designer&background=e91e63&color=fff'
    },
    {
      id: 3,
      name: 'Bob Tester',
      email: 'bob@aidev.os',
      role: 'developer',
      status: 'active',
      joinedAt: '2024-01-10',
      lastActive: '3 hours ago',
      avatar: 'https://ui-avatars.com/api/?name=Bob+Tester&background=4caf50&color=fff'
    },
    {
      id: 4,
      name: 'Sarah Manager',
      email: 'sarah@aidev.os',
      role: 'manager',
      status: 'active',
      joinedAt: '2024-01-12',
      lastActive: '5 minutes ago',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Manager&background=ff9800&color=fff'
    },
    {
      id: 5,
      name: 'Mike Analyst',
      email: 'mike@aidev.os',
      role: 'viewer',
      status: 'inactive',
      joinedAt: '2024-01-15',
      lastActive: '2 weeks ago',
      avatar: 'https://ui-avatars.com/api/?name=Mike+Analyst&background=9c27b0&color=fff'
    }
  ]

  const organization = {
    name: 'AI Developer OS Team',
    domain: 'aidev.os',
    plan: 'Pro',
    members: 12,
    maxMembers: 20,
    createdAt: '2024-01-01'
  }

  const teams = [
    {
      id: 1,
      name: 'Frontend Team',
      description: 'UI/UX development and design',
      members: 4,
      projects: 3
    },
    {
      id: 2,
      name: 'Backend Team',
      description: 'API development and infrastructure',
      members: 5,
      projects: 4
    },
    {
      id: 3,
      name: 'AI/ML Team',
      description: 'Machine learning and AI development',
      members: 3,
      projects: 2
    }
  ]

  const permissions = [
    {
      role: 'Admin',
      permissions: ['Full access to all features', 'Manage billing and plans', 'Add/remove members', 'Manage teams and projects']
    },
    {
      role: 'Manager',
      permissions: ['Manage team members', 'Create and manage projects', 'View analytics and reports', 'Access billing information']
    },
    {
      role: 'Developer',
      permissions: ['Create and edit code', 'Run AI tasks', 'Access project resources', 'View limited analytics']
    },
    {
      role: 'Viewer',
      permissions: ['View projects and code', 'Read-only access', 'View basic analytics', 'Cannot make changes']
    }
  ]

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'text-purple-600 bg-purple-100',
      manager: 'text-blue-600 bg-blue-100',
      developer: 'text-green-600 bg-green-100',
      viewer: 'text-gray-600 bg-gray-100'
    }
    return colors[role as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      inactive: 'text-red-600 bg-red-100',
      pending: 'text-yellow-600 bg-yellow-100'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tabs = [
    { id: 'members', name: 'Members', icon: Users },
    { id: 'teams', name: 'Teams', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'permissions', name: 'Permissions', icon: Shield }
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Organization</h1>
              <p className="text-gray-600">Manage your team and organization settings</p>
            </div>
          </div>
        </div>

        {/* Organization Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{organization.name}</h2>
              <p className="text-gray-600">{organization.domain} • {organization.plan} Plan</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Members</p>
              <p className="text-2xl font-bold text-gray-900">{organization.members}/{organization.maxMembers}</p>
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
                  flex items-center py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </button>
            </div>

            <div className="bg-white shadow rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={member.avatar}
                              alt={member.name}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(member.role)}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.status)}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.lastActive}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Teams</h2>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div key={team.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{team.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Members:</span>
                      <span className="font-medium">{team.members}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Projects:</span>
                      <span className="font-medium">{team.projects}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                      View Team
                    </button>
                    <button className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Organization Settings</h2>
            
            <div className="bg-white shadow rounded-lg">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">General Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization Name
                      </label>
                      <input
                        type="text"
                        defaultValue={organization.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Domain
                      </label>
                      <input
                        type="text"
                        defaultValue={organization.domain}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Require two-factor authentication</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Enforce strong passwords</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Allow single sign-on (SSO)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Email notifications for new members</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-sm text-gray-700">Weekly activity reports</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-700">Security alerts</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Role Permissions</h2>
            
            <div className="space-y-4">
              {permissions.map((role) => (
                <div key={role.role} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{role.role}</h3>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Edit Permissions
                    </button>
                  </div>
                  
                  <ul className="space-y-2">
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="flex items-center">
                        <Shield className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-600">{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
