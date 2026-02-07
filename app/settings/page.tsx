import { Building2, Globe, Bell } from 'lucide-react';

export default function SettingsPage() {
  return (
    <main className="p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your application preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Company Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Company Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                defaultValue="LAWZ Technologies Sdn Bhd"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#135bec]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Registration No.</label>
              <input
                type="text"
                defaultValue="202301012345"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#135bec]"
              />
            </div>
            <button className="px-4 py-2 bg-[#135bec] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Save Changes
            </button>
          </div>
        </div>

        {/* Quick Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-slate-900">Language</p>
            </div>
            <p className="text-sm text-slate-500">English (US)</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-slate-900">Notifications</p>
            </div>
            <p className="text-sm text-slate-500">Enabled</p>
          </div>
        </div>
      </div>
    </main>
  );
}
