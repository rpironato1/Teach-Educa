import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'

interface AdminDashboardProps {
  onBackToHome: () => void
}

export default function AdminDashboard({ onBackToHome }: AdminDashboardProps) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo, {user?.fullName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBackToHome}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <Button variant="outline" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,234</div>
              <p className="text-sm text-muted-foreground">+12% este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">R$ 45,890</div>
              <p className="text-sm text-muted-foreground">+8% este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Taxa de Retenção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">78.5%</div>
              <p className="text-sm text-muted-foreground">+2% este mês</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Sistema IA</span>
                  <span className="text-green-500">✓ Operacional</span>
                </div>
                <div className="flex justify-between">
                  <span>Sistema de Pagamentos</span>
                  <span className="text-green-500">✓ Operacional</span>
                </div>
                <div className="flex justify-between">
                  <span>Analytics</span>
                  <span className="text-green-500">✓ Operacional</span>
                </div>
                <div className="flex justify-between">
                  <span>Base de Dados</span>
                  <span className="text-green-500">✓ Operacional</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}