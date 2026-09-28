import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  FileSearch,
  Mic,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="min-h-screen bg-[#080b11] text-white">
      {/* ================================================= */}
      {/* NAVBAR */}
      {/* ================================================= */}

      <header className="border-b border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            to="/"
            className="font-serif text-2xl tracking-tight text-white"
          >
            PrepSphere
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm text-white/55 transition hover:text-white"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-24 lg:px-10 lg:pb-32 lg:pt-32">
            <div className="max-w-5xl">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-blue-400">
                AI Career & Interview Platform
              </p>

              <h1 className="mt-7 max-w-5xl font-serif text-6xl leading-[0.98] tracking-tight text-white md:text-7xl lg:text-[92px]">
                Prepare for the job,
                <br />
                <span className="italic text-blue-400">
                  not just the interview.
                </span>
              </h1>

              <p className="mt-8 max-w-2xl text-base leading-7 text-white/45 md:text-lg md:leading-8">
                PrepSphere connects your resume, target roles and interview
                performance into one intelligent career preparation workflow.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium transition hover:bg-blue-500"
                >
                  Start preparing
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-2 py-3 text-sm text-white/50 transition hover:text-white"
                >
                  I already have an account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* PRODUCT FLOW */}
        {/* ================================================= */}

        <section className="border-y border-white/[0.07]">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
            <p className="text-xs uppercase tracking-[0.2em] text-white/30">
              One connected workflow
            </p>

            <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
              From finding the opportunity
              <br />
              to preparing for it.
            </h2>

            <div className="mt-14 grid md:grid-cols-4">
              <WorkflowStep
                number="01"
                title="Discover"
                description="Find relevant opportunities based on the roles you're targeting."
              />

              <WorkflowStep
                number="02"
                title="Understand"
                description="Analyze job descriptions and identify the skills that matter."
              />

              <WorkflowStep
                number="03"
                title="Prepare"
                description="Practice with adaptive AI interviews that respond to your answers."
              />

              <WorkflowStep
                number="04"
                title="Improve"
                description="Use interview analytics to understand strengths and skill gaps."
              />
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FEATURE INTRO */}
        {/* ================================================= */}

        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
                Career intelligence
              </p>

              <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
                Your preparation shouldn't happen in separate tools.
              </h2>
            </div>

            <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
              <Feature
                icon={BriefcaseBusiness}
                title="Job Discovery"
                description="Search current opportunities and move relevant roles directly into your application pipeline."
              />

              <Feature
                icon={FileSearch}
                title="Resume & JD Intelligence"
                description="Turn resumes and job descriptions into structured skill information for better preparation."
              />

              <Feature
                icon={Target}
                title="Job Matching"
                description="Compare your candidate profile with role requirements and understand where you match or fall short."
              />

              <Feature
                icon={Mic}
                title="Adaptive Voice Interviews"
                description="Practice realistic interviews where questions and follow-ups adapt to your responses."
              />

              <Feature
                icon={BarChart3}
                title="Interview Evaluation"
                description="Receive structured feedback across technical knowledge, completeness, depth and communication."
              />

              <Feature
                icon={TrendingUp}
                title="Skill Trends"
                description="Track topic-level interview performance over time and see where your preparation is improving."
              />
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* INTERVIEW SECTION */}
        {/* ================================================= */}

        <section className="border-y border-white/[0.07] bg-white/[0.015]">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:px-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
                Adaptive interviews
              </p>

              <h2 className="mt-5 max-w-xl font-serif text-4xl leading-tight md:text-5xl">
                An interviewer that reacts to how you answer.
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/40">
                PrepSphere doesn't just move through a static question list.
                Your responses are evaluated during the interview so the system
                can follow up, explore concepts further or move to another area.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0b0f16] p-7">
              <p className="text-xs uppercase tracking-[0.16em] text-white/25">
                Interview flow
              </p>

              <div className="mt-7 space-y-5">
                <InterviewFlowItem>
                  Candidate answers question
                </InterviewFlowItem>

                <FlowLine />

                <InterviewFlowItem>AI evaluates the response</InterviewFlowItem>

                <FlowLine />

                <div className="grid grid-cols-2 gap-3">
                  <Decision>Follow up</Decision>
                  <Decision>Go deeper</Decision>
                  <Decision>Next concept</Decision>
                  <Decision>Next topic</Decision>
                </div>

                <FlowLine />

                <InterviewFlowItem>Next question adapts</InterviewFlowItem>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* ANALYTICS */}
        {/* ================================================= */}

        <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-16 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/30">Interview performance</p>

                  <p className="mt-2 font-serif text-4xl">
                    7.8
                    <span className="text-lg text-white/25">/10</span>
                  </p>
                </div>

                <TrendingUp size={22} className="text-blue-400" />
              </div>

              <div className="mt-8 space-y-5">
                <PerformanceRow name="Agentic AI" score={8.4} trend="↑" />

                <PerformanceRow name="React" score={7.6} trend="↑" />

                <PerformanceRow name="System Design" score={6.3} trend="→" />

                <PerformanceRow name="DSA" score={5.8} trend="↓" />
              </div>

              <p className="mt-6 text-[11px] text-white/20">
                Example performance view
              </p>
            </div>

            <div className="flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
                Performance intelligence
              </p>

              <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
                Know what to work on next.
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-white/40">
                Each interview contributes to a longer-term view of your
                performance. Compare topic scores, identify weaker areas and see
                how your preparation changes over time.
              </p>

              <div className="mt-7 space-y-3">
                <CheckItem>Topic-level interview scoring</CheckItem>

                <CheckItem>Strength and weakness analysis</CheckItem>

                <CheckItem>Performance trends across interviews</CheckItem>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* CTA */}
        {/* ================================================= */}

        <section className="border-t border-white/[0.07]">
          <div className="mx-auto max-w-7xl px-6 py-24 text-center lg:px-10">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-400">
              PrepSphere
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">
              Turn every opportunity into better preparation.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/40">
              Build your candidate profile, discover roles, practice adaptive
              interviews and track your progress in one place.
            </p>

            <Link
              to="/register"
              className="mt-9 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium transition hover:bg-blue-500"
            >
              Create your account
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p className="font-serif text-base text-white/60">PrepSphere</p>

          <p>AI-powered career preparation.</p>
        </div>
      </footer>
    </div>
  );
}

// =========================================================
// WORKFLOW STEP
// =========================================================

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-l border-white/10 px-6 py-3 first:border-blue-500">
      <p className="text-xs text-blue-400">{number}</p>

      <h3 className="mt-5 font-serif text-2xl">{title}</h3>

      <p className="mt-3 max-w-xs text-sm leading-6 text-white/35">
        {description}
      </p>
    </div>
  );
}

// =========================================================
// FEATURE
// =========================================================

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#080b11] p-7">
      <Icon size={20} className="text-blue-400" />

      <h3 className="mt-6 text-sm font-medium">{title}</h3>

      <p className="mt-3 text-xs leading-6 text-white/35">{description}</p>
    </div>
  );
}

// =========================================================
// INTERVIEW FLOW
// =========================================================

function InterviewFlowItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-white/60">
      {children}
    </div>
  );
}

function FlowLine() {
  return <div className="ml-5 h-5 w-px bg-blue-500/30" />;
}

function Decision({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-blue-500/15 bg-blue-500/[0.04] px-3 py-2 text-center text-xs text-blue-300/70">
      {children}
    </div>
  );
}

// =========================================================
// PERFORMANCE PREVIEW
// =========================================================

function PerformanceRow({
  name,
  score,
  trend,
}: {
  name: string;
  score: number;
  trend: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/55">{name}</span>

        <div className="flex items-center gap-3">
          <span className="text-white/35">{score.toFixed(1)}</span>

          <span className="text-blue-400">{trend}</span>
        </div>
      </div>

      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="h-full rounded-full bg-blue-500"
          style={{
            width: `${score * 10}%`,
          }}
        />
      </div>
    </div>
  );
}

// =========================================================
// CHECK ITEM
// =========================================================

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/50">
      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-blue-500/30">
        <Check size={11} className="text-blue-400" />
      </div>

      {children}
    </div>
  );
}

export default HomePage;
