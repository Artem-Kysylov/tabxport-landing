import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canUserExport } from '@/lib/subscription/subscription-utils'

// POST - Проверка возможности экспорта определенного типа
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Получаем пользователя из сессии
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { exportType = 'standard', format } = body

    // Определяем тип экспорта на основе формата
    let actualExportType = exportType
    if (format === 'google_sheets' || format === 'sheets') {
      actualExportType = 'google_sheets'
    }

    // Проверяем возможность экспорта
    const exportCheck = await canUserExport(user.id, actualExportType)
    
    return NextResponse.json({
      success: true,
      canExport: exportCheck.canExport,
      reason: exportCheck.reason,
      remainingExports: exportCheck.remainingExports,
      exportType: actualExportType,
      format
    })

  } catch (error) {
    console.error('Error checking export capability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}