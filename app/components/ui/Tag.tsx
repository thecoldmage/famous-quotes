interface TagProps {
  label: string
  onClick?: () => void
  active?: boolean
}

export default function Tag({ label, onClick, active = false }: TagProps) {
  const baseStyles =
    'inline-block px-3 py-1 text-sm rounded-full transition-colors'
  const interactiveStyles = onClick
    ? 'cursor-pointer hover:bg-blue-100'
    : ''
  const activeStyles = active
    ? 'bg-blue-600 text-white'
    : 'bg-gray-100 text-gray-700'

  return (
    <span
      className={`${baseStyles} ${interactiveStyles} ${activeStyles}`}
      onClick={onClick}
    >
      {label}
    </span>
  )
}
