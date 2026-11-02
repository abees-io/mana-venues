import { useParams } from 'react-router-dom'

export default function VendorHallManager() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-brand-accent p-8 text-center flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-brand-primary">Manage Hall: {id}</h1>
      <p className="mt-2 text-brand-dark/80">VendorHallManager — Coming Soon</p>
    </div>
  )
}
