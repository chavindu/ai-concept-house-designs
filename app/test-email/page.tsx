'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false)
  const [webhookLoading, setWebhookLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [webhookResult, setWebhookResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    userEmail: 'test@example.com',
    userName: 'Test User',
    orderId: 'test-order-123',
    amount: 10000
  })

  const testEmail = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to test email', details: error.message })
    } finally {
      setLoading(false)
    }
  }

  const triggerWebhook = async () => {
    setWebhookLoading(true)
    setWebhookResult(null)

    try {
      const response = await fetch('/api/trigger-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: 'order_1760973141574_uyvrk4rzl' })
      })

      const data = await response.json()
      setWebhookResult(data)
    } catch (error) {
      setWebhookResult({ error: 'Failed to trigger webhook', details: error.message })
    } finally {
      setWebhookLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Email Functionality</CardTitle>
            <CardDescription>
              Test the design package email notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userEmail">User Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">User Name</Label>
              <Input
                id="userName"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (LKR)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Button onClick={testEmail} disabled={loading} className="w-full">
                {loading ? 'Testing...' : 'Test Email'}
              </Button>

              <Button onClick={triggerWebhook} disabled={webhookLoading} variant="outline" className="w-full">
                {webhookLoading ? 'Triggering Webhook...' : 'Trigger Webhook for Your Payment'}
              </Button>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Email Test Result:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            {webhookResult && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Webhook Result:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(webhookResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
