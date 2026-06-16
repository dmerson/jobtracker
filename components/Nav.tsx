import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Nav() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) return null;

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-semibold text-zinc-900">
          Job Tracker
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-zinc-600 hover:text-zinc-900">
            Dashboard
          </Link>
          <Link href="/jobs/new" className="text-zinc-600 hover:text-zinc-900">
            New Application
          </Link>
          <Link href="/profile" className="text-zinc-600 hover:text-zinc-900">
            Profile
          </Link>
          <span className="text-zinc-400">{user.email}</span>
          <form action="/auth/sign-out" method="post">
            <button
              type="submit"
              className="rounded-md border border-zinc-300 px-3 py-1 text-zinc-700 hover:bg-zinc-50"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
