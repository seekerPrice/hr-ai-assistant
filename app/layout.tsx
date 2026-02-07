import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Users, UserPlus, Briefcase, Banknote, Settings, MessageSquare } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vera | HR Operations",
  description: "Automated HR Compliance and Operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} flex h-screen bg-slate-50 text-slate-900`}>
        
        <aside className="w-50 bg-slate-900 text-white flex flex-col shrink-0">
          <div className="p-6">
            <h1 className="text-2xl font-bold tracking-tight text-indigo-400">Lawz.AI</h1>
            <p className="text-xs text-slate-400 mt-1">HR Operations Agent</p>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            <Link href="/overview" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
              <LayoutDashboard size={20} />
              <span className="text-sm font-medium">Overview</span>
            </Link>

            <Link href="/employees" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
              <Users size={20} />
              <span className="text-sm font-medium">Employees</span>
            </Link>

            <Link href="/employees/new" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
              <UserPlus size={20} />
              <span className="text-sm font-medium">Add Employee</span>
            </Link>

            <Link href="/recruitments" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
              <Briefcase size={20} />
              <span className="text-sm font-medium">Recruitement</span>
            </Link>

            <Link href="/payroll" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
              <Banknote size={20} />
              <span className="text-sm font-medium">Payroll</span>
            </Link>

            <Link href="/chat" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
              <MessageSquare size={20} />
              <span className="text-sm font-medium">Chatbot</span>
            </Link>

            <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-md transition-colors">
              <Settings size={20} />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </nav>

          <div className="p-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">HR</div>
              <div>
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-slate-400">View Profile</p>
              </div>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

      </body>
    </html>
  );
}