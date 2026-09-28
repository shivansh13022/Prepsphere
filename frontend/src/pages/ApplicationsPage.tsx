import { useEffect, useMemo, useState } from "react";

import {
  BriefcaseBusiness,
  ExternalLink,
  MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createApplication,
  deleteApplication,
  getApplications,
  updateApplication,
  type Application,
  type ApplicationStatus,
} from "../services/applications/applicationService";

const statuses: ApplicationStatus[] = [
  "saved",
  "applied",
  "oa",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

const filterOptions: {
  label: string;
  value: "all" | ApplicationStatus;
}[] = [
  { label: "All", value: "all" },
  { label: "Saved", value: "saved" },
  { label: "Applied", value: "applied" },
  { label: "OA", value: "oa" },
  { label: "Interview", value: "interview" },
  { label: "Offer", value: "offer" },
  { label: "Rejected", value: "rejected" },
];

function formatStatus(status: ApplicationStatus) {
  if (status === "oa") {
    return "OA";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [applicationToDelete, setApplicationToDelete] =
    useState<Application | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [initialStatus, setInitialStatus] =
    useState<ApplicationStatus>("applied");

  // ---------------------------------------------------------
  // Load applications
  // ---------------------------------------------------------

  useEffect(() => {
    async function loadApplications() {
      try {
        setLoading(true);
        setError("");

        const data = await getApplications();

        setApplications(data);
      } catch (err) {
        console.error(err);

        setError("Unable to load applications.");
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  // ---------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------

  const filteredApplications = useMemo(() => {
    if (filter === "all") {
      return applications;
    }

    return applications.filter((application) => application.status === filter);
  }, [applications, filter]);

  const activeCount = applications.filter(
    (application) =>
      !["offer", "rejected", "withdrawn"].includes(application.status),
  ).length;

  const interviewCount = applications.filter(
    (application) => application.status === "interview",
  ).length;

  const offerCount = applications.filter(
    (application) => application.status === "offer",
  ).length;

  // ---------------------------------------------------------
  // Create application
  // ---------------------------------------------------------

  async function handleCreateApplication(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!jobTitle.trim() || !company.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const application = await createApplication({
        job_title: jobTitle.trim(),
        company: company.trim(),

        location: location.trim() || undefined,
        job_url: jobUrl.trim() || undefined,

        source: "manual",
        status: initialStatus,

        notes: notes.trim() || undefined,
      });

      setApplications((current) => [application, ...current]);

      setJobTitle("");
      setCompany("");
      setLocation("");
      setJobUrl("");
      setNotes("");
      setInitialStatus("applied");

      setShowForm(false);
    } catch (err) {
      console.error(err);

      setError("Unable to create application.");
    } finally {
      setSubmitting(false);
    }
  }

  // ---------------------------------------------------------
  // Update status
  // ---------------------------------------------------------

  async function handleStatusChange(
    applicationId: number,
    status: ApplicationStatus,
  ) {
    try {
      setError("");

      const updated = await updateApplication(applicationId, {
        status,
      });

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId ? updated : application,
        ),
      );
    } catch (err) {
      console.error(err);

      setError("Unable to update application.");
    }
  }

  // ---------------------------------------------------------
  // Delete application
  // ---------------------------------------------------------

  async function handleDelete() {
    if (!applicationToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteApplication(applicationToDelete.id);

      setApplications((current) =>
        current.filter(
          (application) => application.id !== applicationToDelete.id,
        ),
      );

      setApplicationToDelete(null);
    } catch (err) {
      console.error(err);

      setError("Unable to delete application.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-blue-400">
              Career Pipeline
            </p>

            <h1 className="font-serif text-4xl tracking-tight text-white lg:text-5xl">
              Your applications,
              <br />
              in one place.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
              Track every opportunity from saved job to offer.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400"
          >
            <Plus size={16} />
            Add application
          </button>
        </div>

        {/* ================================================= */}
        {/* SUMMARY */}
        {/* ================================================= */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total" value={applications.length} />

          <SummaryCard label="Active" value={activeCount} />

          <SummaryCard label="Interviews" value={interviewCount} />

          <SummaryCard label="Offers" value={offerCount} />
        </section>

        {/* ================================================= */}
        {/* FILTERS */}
        {/* ================================================= */}

        <section className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const active = filter === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`rounded-lg border px-3 py-2 text-xs transition ${
                    active
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                      : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* APPLICATION LIST */}
        {/* ================================================= */}

        {loading ? (
          <div className="rounded-xl border border-white/10 p-8 text-sm text-zinc-500">
            Loading applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <BriefcaseBusiness size={30} className="mx-auto text-zinc-600" />

            <h2 className="mt-5 text-lg font-medium text-white">
              No applications here yet.
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Add an application manually or mark a job as applied later from
              Job Discovery.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onStatusChange={handleStatusChange}
                onDelete={setApplicationToDelete}
              />
            ))}
          </div>
        )}

        {/* ================================================= */}
        {/* CREATE MODAL */}
        {/* ================================================= */}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-xl rounded-xl border border-white/10 bg-[#0b0f17] p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-400">
                    New Application
                  </p>

                  <h2 className="mt-2 font-serif text-2xl text-white">
                    Add an opportunity
                  </h2>
                </div>

                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form
                onSubmit={handleCreateApplication}
                className="mt-7 space-y-5"
              >
                <FormField label="Job title *">
                  <input
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                    placeholder="Software Engineer"
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/50"
                  />
                </FormField>

                <FormField label="Company *">
                  <input
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Company name"
                    required
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/50"
                  />
                </FormField>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Location">
                    <input
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="Bangalore"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/50"
                    />
                  </FormField>

                  <FormField label="Status">
                    <select
                      value={initialStatus}
                      onChange={(event) =>
                        setInitialStatus(
                          event.target.value as ApplicationStatus,
                        )
                      }
                      className="w-full rounded-lg border border-white/10 bg-[#0d1119] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {formatStatus(status)}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <FormField label="Job URL">
                  <input
                    value={jobUrl}
                    onChange={(event) => setJobUrl(event.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/50"
                  />
                </FormField>

                <FormField label="Notes">
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Referral, recruiter contact, interview notes..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/50"
                  />
                </FormField>

                <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? "Adding..." : "Add application"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* DELETE CONFIRMATION MODAL */}
        {/* Same visual style as Delete Resume */}
        {/* ================================================= */}

        {applicationToDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !deleting) {
                setApplicationToDelete(null);
              }
            }}
          >
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1118] p-6 shadow-2xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
                <Trash2 size={20} className="text-red-400" />
              </div>

              <h2 className="mt-5 font-serif text-2xl text-white">
                Delete this application?
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/45">
                You're about to delete{" "}
                <span className="font-medium text-white/70">
                  {applicationToDelete.job_title}
                </span>{" "}
                at{" "}
                <span className="font-medium text-white/70">
                  {applicationToDelete.company}
                </span>
                .
              </p>

              <p className="mt-2 text-xs text-white/30">
                This action cannot be undone.
              </p>

              <div className="mt-7 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setApplicationToDelete(null)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="flex items-center gap-2 rounded-lg bg-red-500/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete application
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================
// APPLICATION CARD
// =========================================================

interface ApplicationCardProps {
  application: Application;

  onStatusChange: (id: number, status: ApplicationStatus) => Promise<void>;

  onDelete: (application: Application) => void;
}

function ApplicationCard({
  application,
  onStatusChange,
  onDelete,
}: ApplicationCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-medium text-white">
              {application.job_title}
            </h3>

            {application.source === "adzuna" && (
              <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-blue-400">
                Adzuna
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-zinc-400">{application.company}</p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            {application.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} />

                {application.location}
              </span>
            )}

            {application.applied_at && (
              <span>Applied {formatDate(application.applied_at)}</span>
            )}

            {!application.applied_at && (
              <span>Added {formatDate(application.created_at)}</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={application.status}
            onChange={(event) =>
              onStatusChange(
                application.id,
                event.target.value as ApplicationStatus,
              )
            }
            className="rounded-lg border border-white/10 bg-[#0d1119] px-3 py-2 text-xs text-zinc-200 outline-none transition focus:border-blue-500/50"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>

          {application.job_url && (
            <a
              href={application.job_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              View job
              <ExternalLink size={13} />
            </a>
          )}

          <button
            onClick={() => onDelete(application)}
            className="rounded-lg border border-white/10 p-2 text-zinc-500 transition hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400"
            title="Delete application"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {application.notes && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-xs leading-5 text-zinc-500">{application.notes}</p>
        </div>
      )}
    </div>
  );
}

// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-5">
      <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>

      <p className="mt-3 text-3xl font-medium text-white">{value}</p>
    </div>
  );
}

// =========================================================
// FORM FIELD
// =========================================================

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-zinc-400">{label}</span>

      {children}
    </label>
  );
}

export default ApplicationsPage;
