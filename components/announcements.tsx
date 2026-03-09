'use client'

import { AlertCircle, Clock, Bell } from 'lucide-react'

export function Announcements() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Announcements */}
      <div className="rounded-xl border border-[#333333] bg-[#28323D] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#FF5630] flex items-center justify-center text-white">
            <AlertCircle size={18} />
          </div>
          <h3 className="text-[#FFFFFF] font-semibold">Announcements</h3>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-[#FFFFFF] font-medium text-sm">Welcome to the Open Beta</h4>
              <span className="text-xs text-[#637381]">@rocklandone • 3 months</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-semibold text-white bg-[#FF5630] px-2 py-0.5 rounded">English</span>
            </div>
            <p className="text-xs text-[#919EAB] leading-relaxed">
              Welcome to the Open Beta! We're excited to have you join us as we enter this new stage of development. Your feedback will help us improve and shape the future of our platform. Thank you for being part of this journey!
            </p>
          </div>

          <div className="border-t border-[#333333] pt-4">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-[#FFFFFF] font-medium text-sm">Tiếng Việt</h4>
              <span className="text-xs text-[#637381]">3 months</span>
            </div>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs font-semibold text-white bg-[#FF5630] px-2 py-0.5 rounded">Vietnamese</span>
            </div>
            <p className="text-xs text-[#919EAB] leading-relaxed">
              Chào mừng bạn đến với phiên bản mở! Chúng tôi rất vui mừng được chào đón bạn khi chúng ta nhập vào giai đoạn mới của phát triển. Ý kiến của bạn sẽ giúp chúng tôi cải thiện và định hình tương lai của nền tảng của chúng tôi. Cảm ơn bạn đã là một phần của hành trình này!
            </p>
          </div>
        </div>
      </div>

      {/* Recent Updates */}
      <div className="rounded-xl border border-[#333333] bg-[#28323D] p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#078DEE] flex items-center justify-center text-white">
            <Bell size={18} />
          </div>
          <h3 className="text-[#FFFFFF] font-semibold">Recent Updates</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-14 text-center rounded-lg bg-[#1C252E] border border-[#333333]">
          <Clock size={36} className="text-[#637381] mb-2" />
          <p className="text-sm text-[#919EAB]">No recent updates</p>
        </div>
      </div>
    </div>
  )
}
