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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Members</h1>
          <p className="text-gray-600">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicMembers.map((member) => (
              <Link
                key={member.id}
                href={`/`}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 overflow-hidden mb-3">
                  {member.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    member.name.charAt(0)
                  )}
                </div>

                {/* Name & Bio */}
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {member.name}
                </h3>
                {member.bio && <p className="text-sm text-gray-600 mt-1">{member.bio}</p>}

                {/* Interests */}
                {member.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {member.interests.slice(0, 3).map((interest) => (
                      <span
                        key={interest}
                        className="inline-block px-2 py-1 rounded-full bg-indigo-50 text-xs text-indigo-700"
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
