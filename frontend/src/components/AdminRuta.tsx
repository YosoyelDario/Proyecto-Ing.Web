import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

const ADMIN_EMAIL = 'tuadmin@gmail.com'

export default function AdminRuta({ children }: { children: ReactNode }) {
  const email = localStorage.getItem('userEmail')

  if (email !== ADMIN_EMAIL) {
    return <Navigate to="/" replace />
  }

  return children
}