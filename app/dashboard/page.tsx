'use client'

import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Dashboard() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be signed in to view this page.</p>
        </div>
      </div>
    )
  }

  const userRole = session.user?.role
  const profileComplete = session.user?.profileComplete

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Welcome to AgentBoss Dashboard
            </h1>
            
            {/* Profile Completion Alert */}
            {!profileComplete && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Complete Your Profile
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Please complete your profile to access all platform features.</p>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={userRole === 'CLIENT' ? '/client/profile/setup' : '/expert/profile/setup'}
                        className="bg-yellow-600 text-white px-3 py-2 rounded-md text-sm hover:bg-yellow-700"
                      >
                        Complete Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-blue-900 mb-4">
                  User Information
                </h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Email:</span> {session.user?.email}</p>
                  <p><span className="font-medium">Role:</span> {session.user?.role}</p>
                  <p><span className="font-medium">Profile Complete:</span> {profileComplete ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-green-900 mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  {userRole === 'CLIENT' && (
                    <>
                      <Link href="/client/projects" className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center">
                        My Projects
                      </Link>
                      <Link href="/client/profile" className="block bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center">
                        Edit Profile
                      </Link>
                    </>
                  )}
                  {userRole === 'EXPERT' && (
                    <>
                      <Link href="/expert/projects" className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-center">
                        Browse Projects
                      </Link>
                      <Link href="/expert/profile" className="block bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-center">
                        Edit Profile
                      </Link>
                    </>
                  )}
                  {userRole === 'ADMIN' && (
                    <>
                      <Link href="/admin/users" className="block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-center">
                        Manage Users
                      </Link>
                      <Link href="/admin/dashboard" className="block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-center">
                        Admin Panel
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
