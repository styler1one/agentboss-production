'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  email: string
  role: string
  profileComplete: boolean
  createdAt: string
  clientProfile?: {
    companyName: string
    industry: string
  }
  expertProfile?: {
    firstName: string
    lastName: string
    expertise: string
  }
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    clients: 0,
    experts: 0,
    completedProfiles: 0
  })

  // Check admin access
  useEffect(() => {
    if (session && session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, router])

  // Fetch users and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data.users)
          
          // Calculate stats
          const totalUsers = data.users.length
          const clients = data.users.filter((u: User) => u.role === 'CLIENT').length
          const experts = data.users.filter((u: User) => u.role === 'EXPERT').length
          const completedProfiles = data.users.filter((u: User) => u.profileComplete).length
          
          setStats({ totalUsers, clients, experts, completedProfiles })
        } else {
          toast({
            title: "Error",
            description: "Failed to load user data",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        toast({
          title: "Error",
          description: "An error occurred while loading data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchData()
    }
  }, [session, toast])

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role: newRole }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `User role updated to ${newRole}`,
        })
        
        // Refresh data
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ))
      } else {
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        title: "Error",
        description: "An error occurred while updating user role",
        variant: "destructive",
      })
    }
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="pt-6">
            <p>Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users and platform settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.clients}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Experts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.experts}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.completedProfiles}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user accounts, roles, and profile status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Profile</th>
                    <th className="text-left py-3 px-4">Created</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.role === 'CLIENT' && user.clientProfile?.companyName && (
                              <span>{user.clientProfile.companyName}</span>
                            )}
                            {user.role === 'EXPERT' && user.expertProfile && (
                              <span>{user.expertProfile.firstName} {user.expertProfile.lastName}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={
                          user.role === 'ADMIN' ? 'destructive' : 
                          user.role === 'EXPERT' ? 'default' : 'secondary'
                        }>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={user.profileComplete ? 'default' : 'outline'}>
                          {user.profileComplete ? 'Complete' : 'Incomplete'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {user.role !== 'ADMIN' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(user.id, 'ADMIN')}
                              >
                                Make Admin
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserRole(user.id, user.role === 'CLIENT' ? 'EXPERT' : 'CLIENT')}
                              >
                                Switch Role
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
