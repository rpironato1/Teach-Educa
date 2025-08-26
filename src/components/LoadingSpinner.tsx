import { motion } from 'framer-motion'
import { Brain } from '@phosphor-icons/react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  message?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  fullScreen = false, 
  message = 'Carregando...' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const containerClasses = fullScreen 
    ? 'min-h-screen flex items-center justify-center bg-background'
    : 'flex items-center justify-center p-8'

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="relative">
          {/* Outer spinning ring */}
          <div className={`${sizeClasses[size]} border-4 border-primary/20 rounded-full border-t-primary animate-spin mx-auto`} />
          
          {/* Inner brain icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Brain 
              className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'} text-primary/60`} 
              weight="duotone" 
            />
          </motion.div>
        </div>
        
        {/* Loading message */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`text-muted-foreground ${
            size === 'sm' ? 'text-xs' : 
            size === 'md' ? 'text-sm' : 
            'text-base'
          }`}
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  )
}