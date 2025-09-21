declare global {
  interface Window {
    payhere: {
      startPayment: (payment: any) => void
      onCompleted: (orderId: string) => void
      onDismissed: () => void
      onError: (error: string) => void
    }
  }
}

export {}
