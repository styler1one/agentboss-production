'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/auth/signin') // Not signed in
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AgentBoss Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {session.user?.name || session.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* User Info Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  User Information
                </h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{session.user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {(session.user as any)?.role || 'CLIENT'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Profile Complete</dt>
                    <dd className="text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (session.user as any)?.profileComplete 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {(session.user as any)?.profileComplete ? 'Complete' : 'Incomplete'}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Complete Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Browse Projects
                  </button>
                  <button className="w-full text-left px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    View Marketplace
                  </button>
                </div>
              </div>
            </div>

            {/* Platform Stats */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Platform Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Active Projects</span>
                    <span className="text-sm font-medium text-gray-900">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Expert Network</span>
                    <span className="text-sm font-medium text-gray-900">450+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Success Rate</span>
                    <span className="text-sm font-medium text-green-600">98%</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Database Connection Test */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                System Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-900">Authentication System</span>
                  <span className="ml-auto text-sm text-green-600">Online</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-900">Database Connection</span>
                  <span className="ml-auto text-sm text-green-600">Connected</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-900">Database Schema</span>
                  <span className="ml-auto text-sm text-yellow-600">Pending</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
