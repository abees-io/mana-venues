import { useParams } from 'react-router-dom'

export default function CityPage() {
  const { slug } = useParams<{ slug: string }>()

  return (
    <div className="min-h-screen bg-brand-accent p-8 text-center flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-brand-primary">Auditoriums in {slug}</h1>
      <p className="mt-2 text-brand-dark/80">CityPage — Coming Soon</p>
    </div>
  )
}
