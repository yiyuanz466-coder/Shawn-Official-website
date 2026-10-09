import { Navigate, useLocation } from 'react-router'
import { detectLang } from '../i18n/langs'

export function RootRedirect() {
  const { search } = useLocation()
  return <Navigate to={`/${detectLang()}${search}`} replace />
}
