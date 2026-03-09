'use client'

import { AlertCircle, Clock, Bell } from 'lucide-react'

export function Announcements() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Announcements */}
      <div className="rounded-xl border border-white/5 bg-[#161b22] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
            <AlertCircle size={18} />
          </div>
          <h3 className="text-white font-semibold">Announcements</h3>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-white font-medium text-sm">Welcome to the Open Beta</h4>
              <span className="text-xs text-gray-500">@rocklandone • 3 months</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-semibold text-white bg-red-600 px-2 py-0.5 rounded">English</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Welcome to the Open Beta! We're excited to have you join us as we enter this new stage of development. Your feedback will help us improve and shape the future of our platform. Thank you for being part of this journey!
            </p>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-white font-medium text-sm">Tiếng Việt</h4>
              <span className="text-xs text-gray-500">3 months</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-semibold text-white bg-red-600 px-2 py-0.5 rounded">Vietnamese</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Chào mừng bạn đến với phiên bản mở! Chúng tôi rất vui mừng được chào đón bạn khi chúng ta nhập vào giai đoạn mới của phát triển. Ý kiến của bạn sẽ giúp chúng tôi cải thiện và định hình tương lai của nền tảng của chúng tôi. Cảm ơn bạn đã là một phần của hành trình này!
            </p>
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="rounded-xl border border-white/5 bg-[#161b22] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Bell size={18} />
          </div>
          <h3 className="text-white font-semibold">Recent Updates</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-14 text-center rounded-lg bg-white/[0.02] border border-white/5">
          <Clock size={36} className="text-gray-500 mb-2" />
          <p className="text-sm text-gray-400">No recent updates</p>
        </div>
      </div>
    </div>
  )
}
