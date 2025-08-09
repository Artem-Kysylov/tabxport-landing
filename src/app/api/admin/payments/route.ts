import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminEmails = ['tabxport@gmail.com']
    if (!adminEmails.includes(user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        user_profiles!inner(email)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (paymentsError) {
      throw paymentsError
    }

    return NextResponse.json({ payments: data || [] })
  } catch (err) {
    console.error('Error fetching admin payments:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}