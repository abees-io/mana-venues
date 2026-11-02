interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  if (!isOpen) return null

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
      >
        <p className="text-sm text-gray-500">Location Modal (coming soon)</p>
      </div>
    </div>
  )
}
