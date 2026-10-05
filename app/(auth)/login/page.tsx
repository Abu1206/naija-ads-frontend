/** Login + signup entry. Session is set by the backend in an httpOnly cookie. */
export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Log in to Naija Ads</h1>
      <form className="space-y-4" action="#" method="post">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Log in
        </button>
      </form>
      <p className="text-sm text-gray-600">
        New here? Sign up as a <a href="/login?role=business" className="underline">business</a> or{" "}
        <a href="/login?role=developer" className="underline">developer</a>.
      </p>
    </div>
  );
}
