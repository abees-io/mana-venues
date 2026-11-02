export default function App() {
  return (
    <div className="min-h-screen bg-brand-accent p-8 flex flex-col items-center justify-center space-y-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-brand-primary">WedBook</h1>
        <p className="text-brand-dark/80 mt-2 font-medium">
          Kerala Wedding Auditorium Booking Platform
        </p>
      </header>

      {/* Brand color verification cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
        <div className="bg-brand-primary text-white p-4 rounded-lg shadow-md text-center">
          <p className="font-semibold">Primary</p>
          <p className="text-xs opacity-80">#8B1A4A</p>
        </div>
        <div className="bg-brand-secondary text-brand-dark p-4 rounded-lg shadow-md text-center">
          <p className="font-semibold">Secondary</p>
          <p className="text-xs opacity-80">#D4AF37</p>
        </div>
        <div className="bg-brand-accent border-2 border-brand-primary/20 text-brand-dark p-4 rounded-lg shadow-md text-center">
          <p className="font-semibold">Accent</p>
          <p className="text-xs opacity-80">#FDF0F5</p>
        </div>
        <div className="bg-brand-dark text-white p-4 rounded-lg shadow-md text-center">
          <p className="font-semibold">Dark</p>
          <p className="text-xs opacity-80">#1A0A10</p>
        </div>
      </div>

      {/* Standard utility test */}
      <div className="bg-blue-500 text-white px-4 py-2 rounded shadow text-sm font-medium">
        Tailwind utility test: bg-blue-500
      </div>
    </div>
  )
}
