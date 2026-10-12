import { Suspense } from "react";
import type { Metadata } from "next";
import { getCurrentUser, getProfile } from "@/lib/auth/session";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profile | ResQfood" };

async function ProfileFormLoader() {
  const [user, profile] = await Promise.all([getCurrentUser(), getProfile()]);
  if (!user || !profile) return null;
  return <ProfileForm initial={profile} showHouseholdSize={user.role !== "restaurant"} />;
}

function ProfileSkeleton() {
  return (
    <div className="flex max-w-xl flex-col gap-6" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <main>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Profile</h1>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileFormLoader />
      </Suspense>
    </main>
  );
}
