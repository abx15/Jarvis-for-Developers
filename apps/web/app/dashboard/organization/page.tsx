'use client'

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import {
  Users,
  Shield,
  Settings,
  Plus,
  Loader2,
  Building2,
  FolderKanban,
  Mail,
  Crown,
  User,
  Edit,
  Trash2
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { OrganizationSelector } from '@/components/organization/OrganizationSelector'
import { TeamMembersPanel } from '@/components/organization/TeamMembersPanel'
import { apiClient } from '@/lib/api'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function OrganizationPage() {
  const [organizations, setOrganizations] = useState<any[]>([])
  const [currentOrg, setCurrentOrg] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const { toast } = useToast()

  const fetchOrganizations = async () => {
    try {
      const orgs = await apiClient.listOrganizations()
      setOrganizations(orgs)
      if (orgs.length > 0 && !currentOrg) {
        setCurrentOrg(orgs[0])
      }
    } catch (error: any) {
      toast(error.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrgData = async (orgId: number) => {
    setIsActionLoading(true)
    try {
      const [membersRes, projectsRes] = await Promise.all([
        apiClient.getOrgMembers(orgId),
        apiClient.listProjects(orgId),
      ])
      setMembers(membersRes)
      setProjects(projectsRes)
    } catch (error: any) {
      toast(error.message, 'error')
    } finally {
      setIsActionLoading(false)
    }
  }

  useEffect(() => {
    fetchOrganizations()
  }, [])

  useEffect(() => {
    if (currentOrg) {
      fetchOrgData(currentOrg.id)
    }
  }, [currentOrg])

  const handleOrgChange = (orgId: number) => {
    const org = organizations.find(o => o.id === orgId)
    if (org) setCurrentOrg(org)
  }

  const handleCreateOrg = async () => {
    const name = prompt('Organization Name:')
    if (!name) return

    try {
      const newOrg = await apiClient.createOrganization(name)
      toast('Organization created successfully', 'success')
      setOrganizations([...organizations, newOrg])
      setCurrentOrg(newOrg)
    } catch (error: any) {
      toast(error.message, 'error')
    }
  }

  const handleInvite = async (email: string, role: string) => {
    if (!currentOrg) return
    try {
      await apiClient.inviteMember(currentOrg.id, email, role)
      toast(`Invite sent to ${email}`, 'success')
      fetchOrgData(currentOrg.id) // Refresh member list (in real app, would show pending)
    } catch (error: any) {
      toast(error.message, 'error')
    }
  }

  const handleRemoveMember = async (userId: number) => {
    if (!currentOrg || !confirm('Are you sure?')) return
    try {
      await apiClient.removeMember(currentOrg.id, userId)
      toast('Member removed', 'success')
      fetchOrgData(currentOrg.id)
    } catch (error: any) {
      toast(error.message, 'error')
    }
  }

  const handleUpdateRole = async (userId: number, role: string) => {
    if (!currentOrg) return
    try {
      await apiClient.updateMemberRole(currentOrg.id, userId, role)
      toast('Role updated', 'success')
      fetchOrgData(currentOrg.id)
    } catch (error: any) {
      toast(error.message, 'error')
    }
  }

  const handleCreateProject = async () => {
    if (!currentOrg) return
    const name = prompt('Project Name:')
    if (!name) return

    try {
      await apiClient.createProject(currentOrg.id, name)
      toast('Project created', 'success')
      fetchOrgData(currentOrg.id)
    } catch (error: any) {
      toast(error.message, 'error')
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization Workspace</h1>
            <p className="text-gray-600 mt-2">Manage your team, roles, and project permissions</p>
          </div>
          <OrganizationSelector
            organizations={organizations}
            currentOrgId={currentOrg?.id}
            onSelect={handleOrgChange}
            onCreateNew={handleCreateOrg}
          />
        </div>

        {!currentOrg ? (
          <Card className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900">No Organizations Found</h2>
            <p className="text-gray-500 mb-6">
              Create an organization to start collaborating with your team.
            </p>
            <Button onClick={handleCreateOrg} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Organization
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="team" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="team">
                <Users className="w-4 h-4 mr-2" />
                Team Management
              </TabsTrigger>
              <TabsTrigger value="projects">
                <FolderKanban className="w-4 h-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="team">
              <TeamMembersPanel
                members={members}
                currentUserRole={currentOrg.role}
                onInvite={handleInvite}
                onRemove={handleRemoveMember}
                onUpdateRole={handleUpdateRole}
                isLoading={isActionLoading}
              />
            </TabsContent>

            <TabsContent value="projects">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card
                  className="border-dashed border-2 hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={handleCreateProject}
                >
                  <div className="flex flex-col items-center justify-center p-12 h-full">
                    <Plus className="w-8 h-8 mb-2 text-gray-400" />
                    <span className="text-gray-600 font-medium">New Project</span>
                  </div>
                </Card>

                {projects.map(project => (
                  <Card
                    key={project.id}
                    className="hover:shadow-md transition-all cursor-pointer"
                  >
                    <CardHeader>
                      <CardTitle className="text-gray-900">{project.name}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {project.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-xs text-gray-500 space-x-4">
                        <span className="flex items-center">
                          <Shield className="w-3 h-3 mr-1" />
                          Private
                        </span>
                        <span>
                          Created{' '}
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900">Organization Settings</CardTitle>
                  <CardDescription className="text-gray-600">
                    Update your workspace details and preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid w-full items-center gap-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Organization Name
                    </label>
                    <Input
                      defaultValue={currentOrg.name}
                      className="border-gray-300"
                    />
                  </div>
                  <div className="grid w-full items-center gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <Input
                      defaultValue={currentOrg.description}
                      className="border-gray-300"
                    />
                  </div>
                  <Button disabled={currentOrg.role !== 'owner'} className="bg-blue-600 hover:bg-blue-700">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  )
}
