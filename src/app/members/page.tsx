import { Navbar } from "@/components/Navbar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { createServiceClient } from "@/lib/supabase-server";
import type { Profile } from "@/types/database";
import Link from "next/link";

export default async function MembersPage() {
  const supabase = createServiceClient();

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("public_profile", true)
    .order("created_at", { ascending: false });

  const publicMembers = (members ?? []) as Profile[];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-600 mb-3">
            Community
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-gray-950 mb-3">
            Members
          </h1>
          <p className="text-gray-600 text-base">
            {publicMembers.length} member{publicMembers.length !== 1 ? "s" : ""} sharing their interests
          </p>
        </div>

        {publicMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-2">No public members yet</p>
            <p className="text-sm text-gray-500">
              Join and enable "Show on Members page" in your profile to appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {publicMembers.map((member) => (
              <Link
                key={member.id}
                href={`/`}
                className="bg-white/85 backdrop-blur rounded-[28px] border border-gray-200/80 p-5 hover:border-indigo-300 hover:shadow-[0_20px_60px_rgba(79,70,229,0.12)] transition-all group"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 overflow-hidden mb-4">
                  {member.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>

                {/* Name & Bio */}
                <h3 className="font-display text-xl font-semibold text-gray-950 group-hover:text-indigo-600 transition-colors">
                  {member.name}
                </h3>
                {member.bio && <p className="text-sm text-gray-600 mt-2 leading-6">{member.bio}</p>}

                {/* Interests */}
                {member.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {member.interests.slice(0, 3).map((interest) => (
                      <span
                        key={interest}
                      className="inline-block px-2.5 py-1 rounded-full bg-indigo-50 text-xs text-indigo-700"
                      >
                        {interest}
                      </span>
                    ))}
                    {member.interests.length > 3 && (
                      <span className="inline-block px-2 py-1 text-xs text-gray-500">
                        +{member.interests.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
