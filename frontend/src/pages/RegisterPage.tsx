import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

import { googleLogin, register, saveToken } from "../services/auth/authService";

function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
      });

      navigate("/login");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.detail || "Unable to create account.";

        setError(message);
      } else {
        setError("Unable to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential?: string) => {
    if (!credential) {
      setError("Google sign-up did not return a credential.");
      return;
    }

    setError("");
    setGoogleLoading(true);

    try {
      const response = await googleLogin(credential);

      saveToken(response.access_token);

      navigate("/dashboard");
    } catch {
      setError("Google sign-up failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070A0F] text-white">
      {/* Left editorial panel */}
      <div className="hidden w-1/2 flex-col justify-between border-r border-white/10 p-12 lg:flex">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex w-fit items-center gap-3"
        >
          <img
            src="/branding/prepsphere-mark.png"
            alt=""
            className="h-10 w-10 shrink-0 object-contain"
          />

          <span className="text-xl font-semibold tracking-tight text-white">
            Prep<span className="text-blue-400">Sphere</span>
          </span>
        </button>

        <div className="max-w-xl">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-blue-400">
            Your career preparation system
          </p>

          <h1 className="font-serif text-6xl leading-[1.05]">
            Build skills for the
            <span className="text-blue-400 italic"> role </span>
            you want.
          </h1>

          <p className="mt-6 max-w-md text-lg text-white/55">
            Connect your resume, target jobs, interview preparation, and
            learning progress in one place.
          </p>
        </div>

        <p className="text-sm text-white/30">
          Resume → Jobs → Interviews → Growth
        </p>
      </div>

      {/* Register side */}
      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-10 flex w-fit items-center gap-2.5 lg:hidden"
          >
            <img
              src="/branding/prepsphere-mark.png"
              alt=""
              className="h-9 w-9 object-contain"
            />

            <span className="text-xl font-semibold tracking-tight text-white">
              Prep<span className="text-blue-400">Sphere</span>
            </span>
          </button>

          <p className="mb-3 text-sm uppercase tracking-[0.18em] text-blue-400">
            Get started
          </p>

          <h2 className="font-serif text-4xl">Create your account</h2>

          <p className="mt-3 text-white/50">
            Start building your personalized interview preparation.
          </p>

          {/* Authentication area */}
          <div className="mt-9">
            <p className="mb-3 text-sm font-medium text-white/70">
              Quick sign up
            </p>

            {/* Google */}
            <div className="flex min-h-[52px] w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] px-3 transition hover:border-white/20 hover:bg-white/[0.05]">
              {googleLoading ? (
                <span className="text-sm text-white/50">
                  Creating your account...
                </span>
              ) : (
                <GoogleLogin
                  onSuccess={(credentialResponse) =>
                    handleGoogleSuccess(credentialResponse.credential)
                  }
                  onError={() =>
                    setError("Google sign-up failed. Please try again.")
                  }
                  theme="filled_black"
                  size="large"
                  shape="rectangular"
                  text="signup_with"
                  logo_alignment="left"
                  width="360"
                />
              )}
            </div>

            {/* Divider */}
            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />

              <span className="text-[11px] uppercase tracking-[0.18em] text-white/30">
                or create with email
              </span>

              <div className="h-px flex-1 bg-white/10" />
            </div>

            {/* Email registration */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-white/70">Name</label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition placeholder:text-white/25 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition placeholder:text-white/25 focus:border-blue-500"
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
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 outline-none transition placeholder:text-white/25 focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/15 bg-red-500/[0.06] px-3 py-2.5">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          </div>

          <div className="mt-8 border-t border-white/[0.07] pt-6">
            <p className="text-sm text-white/45">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-medium text-blue-400 transition hover:text-blue-300"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
