export const toast = {
  success: (message: string) => {
    console.log('Success:', message)
    // In a real implementation, this would show a toast notification
  },
  error: (message: string) => {
    console.error('Error:', message)
    // In a real implementation, this would show a toast notification
  },
  info: (message: string) => {
    console.info('Info:', message)
    // In a real implementation, this would show a toast notification
  }
}

export type ToastProps = {
  message: string
  type: 'success' | 'error' | 'info'
}
