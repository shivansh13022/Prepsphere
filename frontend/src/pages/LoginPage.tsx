import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveToken } from "../services/auth/authService";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      saveToken(response.access_token);

      navigate("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-white flex">
      {/* Left side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 border-r border-white/10">
        <div className="text-xl font-semibold">
          PrepSphere
        </div>

        <div className="max-w-xl">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-blue-400">
            AI Career Intelligence
          </p>

          <h1 className="text-6xl leading-[1.05] font-serif">
            Prepare for the
            <span className="text-blue-400 italic"> opportunity </span>
            you want.
          </h1>

          <p className="mt-6 max-w-md text-lg text-white/55">
            Turn your resume, target jobs, and interview performance
            into a personalized preparation system.
          </p>
        </div>

        <p className="text-sm text-white/30">
          Resume → Jobs → Interviews → Growth
        </p>
      </div>

      {/* Login */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md">
          <p className="mb-3 text-sm uppercase tracking-[0.18em] text-blue-400">
            Welcome back
          </p>

          <h2 className="text-4xl font-serif">
            Sign in to PrepSphere
          </h2>

          <p className="mt-3 mb-10 text-white/50">
            Continue your interview preparation journey.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm text-white/70">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/70">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-sm text-white/45">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-blue-400 hover:text-blue-300"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;