import { useParams } from 'react-router-dom'
import Layout from '../components/layout/Layout'

export default function AuditoriumDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  return (
    <Layout>
      <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold text-brand-primary">Auditorium: {slug}</h1>
        <p className="mt-2 text-brand-dark/80">AuditoriumDetailPage — Coming Soon</p>
      </div>
    </Layout>
  )
}
