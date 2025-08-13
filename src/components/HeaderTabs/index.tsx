import { NavLink } from 'react-router-dom'

type Props = {
  align?: 'left' | 'center' | 'right'
  className?: string
}

export default function HeaderTabs({ align = 'right', className = '' }: Props) {
  const justify =
    align === 'right' ? 'justify-end'
      : align === 'center' ? 'justify-center'
        : 'justify-start'

  const itemClass = (isActive: boolean) =>
    [
      'px-3 py-1.5 rounded-xl text-sm font-medium transition-colors',
      isActive
        ? 'bg-white/10 text-white'
        : 'text-gray-300 hover:text-white hover:bg-white/5'
    ].join(' ')

  const Tab = ({ to, label }: { to: string; label: string }) => (
    <NavLink to={to} className={({ isActive }) => itemClass(isActive)}>
      {label}
    </NavLink>
  )

  return (
    <nav className={`flex ${justify} gap-2 mt-2 ${className}`}>
      <Tab to="/dashboard" label="Dashboard" />
      <Tab to="/sto" label="Test" />
    </nav>
  )
}
