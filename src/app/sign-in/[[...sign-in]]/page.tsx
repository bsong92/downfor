import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { hasClerkCredentials } from "@/lib/current-user";

export default function SignInPage() {
  if (!hasClerkCredentials()) {
    redirect("/feed");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-in"
        forceRedirectUrl="/feed"
      />
    </main>
  );
}
