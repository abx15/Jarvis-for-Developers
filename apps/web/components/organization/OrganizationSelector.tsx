'use client'

import React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Building, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Organization {
  id: number
  name: string
  role: string
}

interface OrganizationSelectorProps {
  organizations: Organization[]
  currentOrgId: number | null
  onSelect: (orgId: number) => void
  onCreateNew: () => void
}

export function OrganizationSelector({
  organizations,
  currentOrgId,
  onSelect,
  onCreateNew,
}: OrganizationSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Select
        value={currentOrgId?.toString()}
        onValueChange={(value: string) => onSelect(parseInt(value))}
      >
        <SelectTrigger className="w-[200px] bg-gray-900 border-gray-800 font-medium">
          <SelectValue placeholder="Select Organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map(org => (
            <SelectItem key={org.id} value={org.id.toString()}>
              <div className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                <span>{org.name}</span>
              </div>
            </SelectItem>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start mt-2 border-t rounded-none"
            onClick={onCreateNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
        </SelectContent>
      </Select>
    </div>
  )
}
