import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileSearch,
  GraduationCap,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

import {
  getCurrentUser,
  type User,
} from "../services/auth/authService";

const quickActions = [
  {
    title: "Job Match",
    description: "See how well your profile fits a role",
    icon: BriefcaseBusiness,
  },
  {
    title: "Mock Interview",
    description: "Practice with an adaptive AI interviewer",
    icon: MessageSquareText,
  },
  {
    title: "Analyze JD",
    description: "Understand skills and requirements",
    icon: FileSearch,
  },
  {
    title: "Improve Skills",
    description: "Find what you should learn next",
    icon: GraduationCap,
  },
];

function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    };

    loadUser();
  }, []);

  return (
    <div className="min-h-screen px-8 py-10 lg:px-14">
      <div className="mx-auto max-w-6xl">

        {/* Greeting */}
        <section className="pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-400">
            Good evening{user ? `, ${user.name}` : ""}
          </p>

          <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[1.05] tracking-tight text-white lg:text-7xl">
            What do you want to{" "}
            <span className="italic text-blue-400">prepare</span>
            <br />
            for today?
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/45">
            PrepSphere connects your profile, target roles and interview
            performance to help you focus on what matters next.
          </p>
        </section>

        {/* AI command box */}
        <section className="mt-12">
          <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.025] px-5 py-4 transition focus-within:border-blue-500/60">
            <Sparkles
              size={20}
              className="shrink-0 text-blue-400"
            />

            <input
              type="text"
              placeholder="Ask PrepSphere what you want to prepare for..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />

            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 transition hover:bg-blue-500"
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.title}
                type="button"
                className="group text-left rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 transition hover:border-white/15 hover:bg-white/[0.04]"
              >
                <Icon
                  size={19}
                  className="text-white/45 transition group-hover:text-blue-400"
                />

                <h3 className="mt-5 text-sm font-medium text-white">
                  {action.title}
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-white/35">
                  {action.description}
                </p>
              </button>
            );
          })}
        </section>

        {/* Preparation */}
        <section className="mt-16">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/30">
                Your progress
              </p>

              <h2 className="mt-2 font-serif text-3xl text-white">
                Your preparation
              </h2>
            </div>

            <button
              type="button"
              className="text-sm text-white/40 transition hover:text-white"
            >
              View activity
            </button>
          </div>

          <div className="grid gap-8 py-8 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/70">
                  Candidate profile
                </p>

                <span className="text-xs text-white/30">
                  Resume & skills
                </span>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full w-[70%] rounded-full bg-blue-500" />
              </div>

              <p className="mt-3 text-xs leading-5 text-white/35">
                Complete your profile to improve job matching and interview
                personalization.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/70">
                  Interview preparation
                </p>

                <span className="text-xs text-white/30">
                  Practice progress
                </span>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full w-[35%] rounded-full bg-blue-500" />
              </div>

              <p className="mt-3 text-xs leading-5 text-white/35">
                Practice targeted interviews to discover strengths and skill
                gaps.
              </p>
            </div>
          </div>
        </section>

        {/* Recommended next */}
        <section className="mt-8 pb-14">
          <p className="text-xs uppercase tracking-[0.18em] text-white/30">
            Recommended
          </p>

          <div className="mt-3 flex items-center justify-between border-y border-white/10 py-6">
            <div>
              <h3 className="font-serif text-2xl text-white">
                Continue building your candidate profile
              </h3>

              <p className="mt-2 text-sm text-white/40">
                A stronger profile gives PrepSphere better context for job
                matching and interviews.
              </p>
            </div>

            <button
              type="button"
              className="ml-8 flex shrink-0 items-center gap-2 text-sm text-blue-400 transition hover:text-blue-300"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

export default DashboardPage;