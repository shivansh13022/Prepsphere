import { useEffect, useState } from "react";
import axios from "axios";

import {
  BriefcaseBusiness,
  ExternalLink,
  LoaderCircle,
  MapPin,
  Search,
  Check,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  analyzeJob,
  createJob,
  discoverJobs,
  getJobMatch,
  getJobs,
  type DiscoveredJob,
  type Job,
  type JobAnalysis,
  type JobMatch,
} from "../services/jobs/jobService";

import {
  createApplication,
  getApplications,
} from "../services/applications/applicationService";

import JobForm from "../components/jobs/JobForm";
import SavedJobs from "../components/jobs/SavedJobs";
import JobAnalysisResult from "../components/jobs/JobAnalysisResult";

type JobsMode = "discover" | "analyze";

const rolePresets = [
  {
    label: "SDE",
    query: "software engineer",
  },
  {
    label: "AI / ML",
    query: "machine learning engineer",
  },
  {
    label: "Data Science",
    query: "data scientist",
  },
];

// =========================================================
// LOCATION AUTOCOMPLETE DATA
// =========================================================

const jobLocations = [
  "Ahmedabad, Gujarat",
  "Bangalore, Karnataka",
  "Bhubaneswar, Odisha",
  "Chandigarh",
  "Chennai, Tamil Nadu",
  "Coimbatore, Tamil Nadu",
  "Delhi",
  "Gandhinagar, Gujarat",
  "Gurugram, Haryana",
  "Hyderabad, Telangana",
  "Indore, Madhya Pradesh",
  "Jaipur, Rajasthan",
  "Jodhpur, Rajasthan",
  "Kochi, Kerala",
  "Kolkata, West Bengal",
  "Lucknow, Uttar Pradesh",
  "Mumbai, Maharashtra",
  "Nagpur, Maharashtra",
  "Noida, Uttar Pradesh",
  "Pune, Maharashtra",
  "Thiruvananthapuram, Kerala",
];

function JobsPage() {
  const navigate = useNavigate();

  // ======================================================
  // PAGE MODE
  // ======================================================

  const [mode, setMode] = useState<JobsMode>("discover");

  // ======================================================
  // EXISTING JD ANALYSIS STATE
  // ======================================================

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);

  const [match, setMatch] = useState<JobMatch | null>(null);

  const [loadingJobs, setLoadingJobs] = useState(true);

  const [analyzing, setAnalyzing] = useState(false);

  // ======================================================
  // JOB DISCOVERY STATE
  // ======================================================

  const [searchQuery, setSearchQuery] = useState("software engineer");

  const [searchLocation, setSearchLocation] = useState("");

  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const [discoveredJobs, setDiscoveredJobs] = useState<DiscoveredJob[]>([]);

  const [totalResults, setTotalResults] = useState(0);

  const [searching, setSearching] = useState(false);

  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  const [markingAppliedId, setMarkingAppliedId] = useState<string | null>(null);

  // ======================================================
  // SHARED ERROR
  // ======================================================

  const [error, setError] = useState("");

  // ======================================================
  // LOCATION AUTOCOMPLETE
  // ======================================================

  const filteredLocations =
    searchLocation.trim().length >= 2
      ? jobLocations
          .filter((location) =>
            location.toLowerCase().includes(searchLocation.toLowerCase()),
          )
          .slice(0, 5)
      : [];

  // ======================================================
  // LOAD SAVED JD JOBS
  // ======================================================

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [savedJobs, applications] = await Promise.all([
          getJobs(),
          getApplications(),
        ]);

        // Existing JD jobs
        setJobs(savedJobs);

        // Find Adzuna jobs that have already
        // been added to Application Tracker
        const existingAppliedJobIds = applications
          .filter(
            (application) =>
              application.source === "adzuna" && application.external_job_id,
          )
          .map((application) => application.external_job_id as string);

        setAppliedJobIds(new Set(existingAppliedJobIds));
      } catch {
        setError("Unable to load your job data.");
      } finally {
        setLoadingJobs(false);
      }
    };

    loadInitialData();
  }, []);

  // ======================================================
  // API ERROR HANDLING
  // ======================================================

  const handleApiError = (err: unknown, fallbackMessage: string) => {
    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
        return;
      }
    }

    setError(fallbackMessage);
  };

  // ======================================================
  // DISCOVER JOBS
  // ======================================================

  const handleDiscoverJobs = async (
    event?: React.FormEvent<HTMLFormElement>,
  ) => {
    event?.preventDefault();

    if (!searchQuery.trim()) {
      setError("Enter a role or keyword.");
      return;
    }

    try {
      setSearching(true);
      setError("");
      setShowLocationSuggestions(false);

      const result = await discoverJobs(
        searchQuery.trim(),
        searchLocation.trim() || undefined,
      );

      setDiscoveredJobs(result.jobs);
      setTotalResults(result.total_results);
    } catch (err: unknown) {
      handleApiError(err, "Unable to discover jobs.");
    } finally {
      setSearching(false);
    }
  };

  // ======================================================
  // ROLE PRESET
  // ======================================================

  const handleRolePreset = async (query: string) => {
    setSearchQuery(query);

    try {
      setSearching(true);
      setError("");

      const result = await discoverJobs(
        query,
        searchLocation.trim() || undefined,
      );

      setDiscoveredJobs(result.jobs);
      setTotalResults(result.total_results);
    } catch (err: unknown) {
      handleApiError(err, "Unable to discover jobs.");
    } finally {
      setSearching(false);
    }
  };

  // ======================================================
  // MARK ADZUNA JOB AS APPLIED
  // ======================================================

  const handleMarkApplied = async (job: DiscoveredJob) => {
    try {
      setMarkingAppliedId(job.external_job_id);

      setError("");

      await createApplication({
        external_job_id: job.external_job_id,

        job_title: job.title,

        company: job.company,

        location: job.location || undefined,

        job_url: job.redirect_url,

        source: "adzuna",

        status: "applied",
      });

      setAppliedJobIds((current) => new Set([...current, job.external_job_id]));
    } catch (err: unknown) {
      handleApiError(err, "Unable to mark this job as applied.");
    } finally {
      setMarkingAppliedId(null);
    }
  };

  // ======================================================
  // ANALYZE NEW JD
  // ======================================================

  const handleAnalyze = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Job title and job description are required.");

      return;
    }

    try {
      setAnalyzing(true);
      setError("");

      setAnalysis(null);
      setMatch(null);

      const job = await createJob({
        title: title.trim(),

        company: company.trim() || null,

        location: location.trim() || null,

        description: description.trim(),

        source_url: null,
      });

      setSelectedJob(job);

      setJobs((currentJobs) => [
        job,

        ...currentJobs.filter((existingJob) => existingJob.id !== job.id),
      ]);

      const jobAnalysis = await analyzeJob(job.id);

      setAnalysis(jobAnalysis);

      const jobMatch = await getJobMatch(job.id);

      setMatch(jobMatch);
    } catch (err: unknown) {
      handleApiError(err, "Unable to analyze this job.");
    } finally {
      setAnalyzing(false);
    }
  };

  // ======================================================
  // OPEN SAVED JD
  // ======================================================

  const handleOpenSavedJob = async (job: Job) => {
    try {
      setAnalyzing(true);
      setError("");

      setAnalysis(null);
      setMatch(null);

      setSelectedJob(job);

      const jobAnalysis = await analyzeJob(job.id);

      setAnalysis(jobAnalysis);

      const jobMatch = await getJobMatch(job.id);

      setMatch(jobMatch);
    } catch (err: unknown) {
      handleApiError(err, "Unable to open this saved job.");

      setSelectedJob(null);
      setAnalysis(null);
      setMatch(null);
    } finally {
      setAnalyzing(false);
    }
  };

  // ======================================================
  // RESET JD ANALYSIS
  // ======================================================

  const handleNewAnalysis = () => {
    setSelectedJob(null);
    setAnalysis(null);
    setMatch(null);

    setTitle("");
    setCompany("");
    setLocation("");
    setDescription("");

    setError("");
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen px-8 py-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <section className="border-b border-white/10 pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-400">
            Job intelligence
          </p>

          <h1 className="mt-3 font-serif text-4xl text-white lg:text-5xl">
            Find the role. Understand the fit.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
            Discover current opportunities or analyze a specific job description
            against your candidate profile.
          </p>

          {/* MODE SWITCH */}

          <div className="mt-7 flex gap-2">
            <button
              onClick={() => {
                setMode("discover");
                setError("");
              }}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                mode === "discover"
                  ? "bg-blue-500 text-white"
                  : "border border-white/10 text-white/50 hover:text-white"
              }`}
            >
              Discover Jobs
            </button>

            <button
              onClick={() => {
                setMode("analyze");
                setError("");
              }}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                mode === "analyze"
                  ? "bg-blue-500 text-white"
                  : "border border-white/10 text-white/50 hover:text-white"
              }`}
            >
              Analyze a JD
            </button>
          </div>
        </section>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* DISCOVER JOBS */}
        {/* ================================================= */}

        {mode === "discover" && (
          <section className="mt-10">
            {/* ROLE PRESETS */}

            <div className="flex flex-wrap gap-2">
              {rolePresets.map((role) => (
                <button
                  key={role.label}
                  onClick={() => handleRolePreset(role.query)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-blue-400"
                >
                  {role.label}
                </button>
              ))}
            </div>

            {/* ================================================= */}
            {/* SEARCH BAR */}
            {/* ================================================= */}

            <form
              onSubmit={handleDiscoverJobs}
              className="mt-5 grid gap-3 lg:grid-cols-[1fr_280px_auto]"
            >
              {/* ROLE / KEYWORDS */}

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />

                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Role or keywords"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.025] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-blue-500/40"
                />
              </div>

              {/* ================================================= */}
              {/* LOCATION WITH AUTOCOMPLETE */}
              {/* ================================================= */}

              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-white/30"
                />

                <input
                  value={searchLocation}
                  onChange={(event) => {
                    setSearchLocation(event.target.value);

                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => {
                    if (searchLocation.trim().length >= 2) {
                      setShowLocationSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setShowLocationSuggestions(false);
                    }, 150);
                  }}
                  placeholder="Location"
                  autoComplete="off"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.025] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-blue-500/40"
                />

                {/* AUTOCOMPLETE DROPDOWN */}

                {showLocationSuggestions && filteredLocations.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-white/10 bg-[#0d1119] shadow-2xl">
                    {filteredLocations.map((jobLocation) => (
                      <button
                        key={jobLocation}
                        type="button"
                        onMouseDown={() => {
                          setSearchLocation(jobLocation);

                          setShowLocationSuggestions(false);
                        }}
                        className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left text-sm text-white/70 transition last:border-b-0 hover:bg-white/5 hover:text-white"
                      >
                        <MapPin size={14} className="shrink-0 text-blue-400" />

                        <span>{jobLocation}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SEARCH BUTTON */}

              <button
                type="submit"
                disabled={searching}
                className="rounded-lg bg-blue-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-400 disabled:opacity-50"
              >
                {searching ? "Searching..." : "Search Jobs"}
              </button>
            </form>

            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {searching && (
              <div className="flex min-h-[300px] flex-col items-center justify-center">
                <LoaderCircle
                  size={28}
                  className="animate-spin text-blue-400"
                />

                <p className="mt-4 text-sm text-white/35">
                  Finding current opportunities...
                </p>
              </div>
            )}

            {/* ================================================= */}
            {/* INITIAL EMPTY STATE */}
            {/* ================================================= */}

            {!searching && discoveredJobs.length === 0 && (
              <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
                <BriefcaseBusiness
                  size={32}
                  className="mx-auto text-white/20"
                />

                <h2 className="mt-5 font-serif text-2xl text-white">
                  Search current opportunities
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
                  Search by role and location, or choose one of the role presets
                  above.
                </p>
              </div>
            )}

            {/* ================================================= */}
            {/* RESULTS */}
            {/* ================================================= */}

            {!searching && discoveredJobs.length > 0 && (
              <div className="mt-9">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-white/45">
                    Showing{" "}
                    <span className="text-white">{discoveredJobs.length}</span>{" "}
                    of {totalResults.toLocaleString()} matching jobs
                  </p>
                </div>

                <div className="space-y-3">
                  {discoveredJobs.map((job) => (
                    <DiscoveryJobCard
                      key={job.external_job_id}
                      job={job}
                      applied={appliedJobIds.has(job.external_job_id)}
                      markingApplied={markingAppliedId === job.external_job_id}
                      onMarkApplied={handleMarkApplied}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================================================= */}
        {/* JD ANALYZER */}
        {/* ================================================= */}

        {mode === "analyze" && (
          <>
            {!selectedJob && (
              <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
                <JobForm
                  title={title}
                  company={company}
                  location={location}
                  description={description}
                  analyzing={analyzing}
                  setTitle={setTitle}
                  setCompany={setCompany}
                  setLocation={setLocation}
                  setDescription={setDescription}
                  onSubmit={handleAnalyze}
                />

                <SavedJobs
                  jobs={jobs}
                  loading={loadingJobs}
                  onOpenJob={handleOpenSavedJob}
                />
              </section>
            )}

            {/* ANALYSIS LOADING */}

            {selectedJob && analyzing && (
              <section className="mt-16 flex min-h-[350px] flex-col items-center justify-center text-center">
                <LoaderCircle
                  size={32}
                  className="animate-spin text-blue-400"
                />

                <h2 className="mt-6 font-serif text-3xl text-white">
                  Understanding this role
                </h2>

                <p className="mt-3 text-sm text-white/35">
                  Loading the role analysis and comparing it with your current
                  candidate profile...
                </p>
              </section>
            )}

            {/* ANALYSIS RESULTS */}

            {selectedJob && analysis && match && !analyzing && (
              <JobAnalysisResult
                job={selectedJob}
                analysis={analysis}
                match={match}
                onBack={handleNewAnalysis}
                onStartInterview={() =>
                  navigate(`/interviews?jobId=${selectedJob.id}`)
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// =========================================================
// DISCOVERY JOB CARD
// =========================================================

interface DiscoveryJobCardProps {
  job: DiscoveredJob;

  applied: boolean;

  markingApplied: boolean;

  onMarkApplied: (job: DiscoveredJob) => Promise<void>;
}

function DiscoveryJobCard({
  job,
  applied,
  markingApplied,
  onMarkApplied,
}: DiscoveryJobCardProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-white/20">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {/* TITLE */}

          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-medium text-white">{job.title}</h2>

            {job.contract_time && (
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/35">
                {job.contract_time.replace("_", " ")}
              </span>
            )}
          </div>

          {/* COMPANY */}

          <p className="mt-1 text-sm text-white/55">{job.company}</p>

          {/* METADATA */}

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/35">
            {job.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} />

                {job.location}
              </span>
            )}

            {job.created && (
              <span>Posted {new Date(job.created).toLocaleDateString()}</span>
            )}

            {job.category && <span>{job.category}</span>}
          </div>

          {/* DESCRIPTION */}

          {job.description && (
            <p className="mt-4 line-clamp-3 max-w-3xl text-sm leading-6 text-white/40">
              {job.description}
            </p>
          )}
        </div>

        {/* ACTIONS */}

        <div className="flex shrink-0 flex-wrap gap-2">
          <a
            href={job.redirect_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            View Job
            <ExternalLink size={13} />
          </a>

          <button
            onClick={() => onMarkApplied(job)}
            disabled={applied || markingApplied}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
              applied
                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "bg-blue-500 text-white hover:bg-blue-400"
            } disabled:cursor-not-allowed`}
          >
            {applied ? (
              <>
                <Check size={13} />
                Applied
              </>
            ) : markingApplied ? (
              "Saving..."
            ) : (
              "Mark Applied"
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

export default JobsPage;
