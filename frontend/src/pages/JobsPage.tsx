import { useEffect, useState } from "react";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  analyzeJob,
  createJob,
  getJobMatch,
  getJobs,
  type Job,
  type JobAnalysis,
  type JobMatch,
} from "../services/jobs/jobService";

import JobForm from "../components/jobs/JobForm";
import SavedJobs from "../components/jobs/SavedJobs";
import JobAnalysisResult from "../components/jobs/JobAnalysisResult";

function JobsPage() {
  const navigate = useNavigate();

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
  const [error, setError] = useState("");

  // ======================================================
  // LOAD SAVED JOBS
  // ======================================================

  useEffect(() => {
    const loadInitialJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch {
        setError("Unable to load your saved jobs.");
      } finally {
        setLoadingJobs(false);
      }
    };

    loadInitialJobs();
  }, []);

  // ======================================================
  // ANALYZE NEW JOB
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
  // OPEN SAVED JOB
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
  // RESET
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
  // ERRORS
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

  return (
    <div className="min-h-screen px-8 py-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        {/* Header */}

        <section className="border-b border-white/10 pb-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-400">
            Job intelligence
          </p>

          <h1 className="mt-3 font-serif text-4xl text-white lg:text-5xl">
            Find your fit before you apply.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
            Add a job description and PrepSphere will identify the role
            requirements, compare them with your profile and show where you
            already match and where you need to prepare.
          </p>
        </section>

        {/* Error */}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Form + saved jobs */}

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

        {/* Loading analysis */}

        {selectedJob && analyzing && (
          <section className="mt-16 flex min-h-[350px] flex-col items-center justify-center text-center">
            <LoaderCircle size={32} className="animate-spin text-blue-400" />

            <h2 className="mt-6 font-serif text-3xl text-white">
              Understanding this role
            </h2>

            <p className="mt-3 text-sm text-white/35">
              Loading the role analysis and comparing it with your current
              candidate profile...
            </p>
          </section>
        )}

        {/* Results */}

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
      </div>
    </div>
  );
}

export default JobsPage;
