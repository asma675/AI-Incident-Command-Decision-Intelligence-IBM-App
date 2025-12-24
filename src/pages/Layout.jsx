
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, AlertTriangle, Shield, BarChart3,
  Menu, X, LogOut, User, ChevronDown, TrendingUp, Activity, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { name: "System Health", page: "SystemHealth", icon: Activity },
  { name: "Knowledge Base", page: "KnowledgeBase", icon: BookOpen },
  { name: "Predictions", page: "Predictions", icon: TrendingUp },
  { name: "Governance", page: "Governance", icon: Shield },
  { name: "Analytics", page: "Analytics", icon: BarChart3 },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);
  
  const isActive = (page) => currentPageName === page;
  
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded bg-blue-600 flex items-center justify-center shadow-md group-hover:shadow-blue-600/50 transition-all">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-white tracking-tight">
                  Incident Command
                </h1>
                <p className="text-[10px] text-blue-400 -mt-0.5 uppercase tracking-wider font-medium">
                  AI Decision Intelligence
                </p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-smooth",
                    isActive(item.page)
                      ? "bg-slate-800 text-white shadow-md"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>
            
            {/* User Menu */}
            <div className="flex items-center gap-3">
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-slate-800 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-200">
                      {user.full_name || user.email}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                      <p className="text-xs text-slate-600">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => base44.auth.logout()}
                      className="text-rose-600 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded hover:bg-slate-800"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-slate-300" />
                ) : (
                  <Menu className="h-5 w-5 text-slate-300" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900">
            <nav className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all",
                    isActive(item.page)
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:bg-slate-800/50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main>{children}</main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Built with <span className="text-blue-400 font-medium">IBM Trustworthy AI</span> Principles</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <span className="text-slate-400">Explainability</span>
              <span>•</span>
              <span className="text-slate-400">Human Control</span>
              <span>•</span>
              <span className="text-slate-400">Accountability</span>
            </div>
          </div>
          <div className="text-center mt-4 text-xs text-slate-500">
            Built by Asma Ahmed 2025
          </div>
        </div>
      </footer>
    </div>
  );
}
