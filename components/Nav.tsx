import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Nav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) return null;

  const initials = user.email ? user.email.slice(0, 2).toUpperCase() : "JT";

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[#0A66C2] text-xs font-bold text-white">
            JT
          </span>
          <span className="hidden text-[#0A66C2] font-semibold sm:block">Job Tracker</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 rounded px-3 py-1.5 text-xs font-medium text-black/60 hover:text-black/90"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 9v2h-2v7a3 3 0 01-3 3H6a3 3 0 01-3-3v-7H1V9l11-7 11 7zm-5 9v-7.6l-6-3.818-6 3.818V18h3v-4h6v4h3z" />
            </svg>
            Home
          </Link>
          <Link
            href="/jobs/new"
            className="flex flex-col items-center gap-0.5 rounded px-3 py-1.5 text-xs font-medium text-black/60 hover:text-black/90"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 6V5a3 3 0 00-3-3h-4a3 3 0 00-3 3v1H2v4l1 13h18l1-13V6h-5zm-8-1a1 1 0 011-1h4a1 1 0 011 1v1H9V5zm-3 3h12v.5l-.92 11.5H6.92L6 8.5V8z" />
            </svg>
            New Job
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center gap-0.5 rounded px-3 py-1.5 text-xs font-medium text-black/60 hover:text-black/90"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            Profile
          </Link>
        </nav>

        {/* Avatar + sign out */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0A66C2] text-xs font-bold text-white">
              {initials}
            </div>
            <span className="text-xs font-medium text-black/60">Me</span>
          </div>
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="li-btn li-btn-ghost text-xs px-3 py-1"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
