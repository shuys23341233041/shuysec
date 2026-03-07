import { NextResponse } from 'next/server'
import { isDatabaseConfigured, query } from '@/lib/db'

/**
 * GET /api/db-status — Kiểm tra kết nối MySQL.
 * Mở URL này trên trình duyệt sau khi redeploy để biết đã kết nối DB chưa.
 */
export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ok: false,
      database: 'not_configured',
      message: 'DATABASE_URL chưa được cấu hình. Thêm biến môi trường trên Vercel.',
    }, { status: 200 })
  }
  try {
    await query('SELECT 1')
    return NextResponse.json({
      ok: true,
      database: 'connected',
      message: 'Đã kết nối MySQL thành công.',
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json({
      ok: false,
      database: 'error',
      message: 'Không kết nối được MySQL.',
      error: message,
    }, { status: 200 })
  }
}
