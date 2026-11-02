import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/layout/Layout'

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth()

  return (
    <Layout>
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full space-y-4">
          <h1 className="text-2xl font-bold text-brand-primary">My Profile</h1>
          <p className="text-brand-dark/80">
            Email: <span className="font-semibold">{user?.email}</span>
          </p>
          <p className="text-brand-dark/80">
            Name: <span className="font-semibold">{profile?.full_name || 'Not set'}</span>
          </p>
          <p className="text-brand-dark/80">
            Role: <span className="font-semibold">{profile?.role || 'customer'}</span>
          </p>
          <button
            onClick={() => signOut()}
            className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </Layout>
  )
}
