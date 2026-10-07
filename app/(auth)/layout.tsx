/** Auth shell: centered card for login/signup. Session is set by the backend. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-md py-8">{children}</div>;
}
