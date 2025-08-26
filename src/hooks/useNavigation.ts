import { useRouter } from '@/hooks/useRouter'

export function useNavigation() {
  const { navigate } = useRouter()

  const navigateToRegistration = () => navigate('registration')
  const navigateToAuth = () => navigate('auth')
  const navigateToHome = () => navigate('home')
  const navigateToDashboard = () => navigate('dashboard')
  const navigateToAdminDashboard = () => navigate('admin-dashboard')

  return {
    navigateToRegistration,
    navigateToAuth,
    navigateToHome,
    navigateToDashboard,
    navigateToAdminDashboard
  }
}