'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Payment } from '@/types/database'

type PaymentWithProfile = Payment & {
  user_profiles?: {
    email: string
  }
}

export default function PaymentsAdmin() {
  const [payments, setPayments] = useState<PaymentWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  
  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch('/api/admin/payments', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error(`Failed to load payments: ${res.status}`)
        }
        const json = await res.json()
        setPayments(json.payments || [])
      } catch (e) {
        console.error('Error fetching payments:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Платежи</h1>
      
      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Пользователь</th>
              <th className="border p-2">Сумма</th>
              <th className="border p-2">Статус</th>
              <th className="border p-2">Дата</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.id}>
                <td className="border p-2">{payment.id}</td>
                <td className="border p-2">{payment.user_profiles?.email}</td>
                <td className="border p-2">{payment.amount} {payment.currency}</td>
                <td className="border p-2">{payment.status}</td>
                <td className="border p-2">{new Date(payment.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}