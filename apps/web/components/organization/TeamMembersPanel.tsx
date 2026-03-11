'use client'

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserPlus, Shield, MoreHorizontal, UserX } from 'lucide-react'

interface Member {
  id: number
  user_id: number
  name: string
  email: string
  role: string
  joined_at: string
}

interface TeamMembersPanelProps {
  members: Member[]
  currentUserRole: string
  onInvite: (email: string, role: string) => void
  onRemove: (userId: number) => void
  onUpdateRole: (userId: number, role: string) => void
  isLoading?: boolean
}

export function TeamMembersPanel({
  members,
  currentUserRole,
  onInvite,
  onRemove,
  onUpdateRole,
  isLoading = false,
}: TeamMembersPanelProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('developer')

  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin'

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (inviteEmail) {
      onInvite(inviteEmail, inviteRole)
      setInviteEmail('')
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <Badge variant="default" className="bg-red-500">
            Owner
          </Badge>
        )
      case 'admin':
        return <Badge variant="secondary">Admin</Badge>
      case 'developer':
        return <Badge variant="outline">Developer</Badge>
      default:
        return <Badge variant="ghost">Viewer</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <UserPlus className="w-5 h-5 mr-2 text-blue-400" />
              Invite Team Member
            </CardTitle>
            <CardDescription>
              Add new developers to your organization workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleInvite}
              className="flex flex-col md:flex-row gap-4"
            >
              <Input
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setInviteEmail(e.target.value)
                }
                className="bg-gray-800 border-gray-700"
                type="email"
                required
              />
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Inviting...' : 'Send Invite'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage access and roles for all users in this organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {canManage && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => (
                <TableRow key={member.id} className="border-gray-800">
                  <TableCell>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-gray-500">
                        {member.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {canManage && member.role !== 'owner' ? (
                      <Select
                        value={member.role}
                        onValueChange={(val: string) =>
                          onUpdateRole(member.user_id, val)
                        }
                      >
                        <SelectTrigger className="w-[120px] h-8 bg-gray-800 border-gray-700 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      getRoleBadge(member.role)
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {new Date(member.joined_at).toLocaleDateString()}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      {member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => onRemove(member.user_id)}
                        >
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
