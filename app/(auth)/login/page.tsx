import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { DevSession } from "@/components/DevSession";

/** Login. The backend issues the httpOnly session cookie; this only posts credentials. */
export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Log in to Naija Ads</h1>
        <p className="mt-1 text-sm text-gray-600">
          Businesses, developers and admins all sign in here — you land in your own dashboard.
        </p>
      </div>
      <DevSession />
      <LoginForm />
      <p className="text-sm text-gray-600">
        New here? Sign up as a{" "}
        <Link href="/signup?role=business" className="underline">
          business
        </Link>{" "}
        or{" "}
        <Link href="/signup?role=developer" className="underline">
          developer
        </Link>
        .
      </p>
    </div>
  );
}
