import { useEffect, useState } from "react";
import axios from "axios";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  FileText,
  FolderGit2,
  GraduationCap,
  LoaderCircle,
  Trash2,
  Upload,
} from "lucide-react";

import {
  deleteResume,
  getResume,
  getResumes,
  uploadResume,
  type ResumeDetail,
  type ResumeListItem,
} from "../services/resume/resumeService";

function ResumePage() {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [selectedResume, setSelectedResume] =
    useState<ResumeDetail | null>(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  /*
   * Refresh the resume list.
   *
   * preferredResumeId is useful after uploading:
   * we refresh everything but keep/select the newly uploaded resume.
   */
  const loadResumes = async (preferredResumeId?: number) => {
    try {
      setLoading(true);
      setError("");

      const resumeList = await getResumes();
      setResumes(resumeList);

      if (resumeList.length === 0) {
        setSelectedResume(null);
        return;
      }

      const resumeId =
        preferredResumeId &&
        resumeList.some((resume) => resume.id === preferredResumeId)
          ? preferredResumeId
          : resumeList[0].id;

      const resumeDetails = await getResume(resumeId);

      setSelectedResume(resumeDetails);
    } catch {
      setError("Unable to load your resumes.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Initial page load.
   *
   * Kept separate from loadResumes() so the React ESLint rule
   * does not complain about synchronous state updates inside effect.
   */
  useEffect(() => {
    const fetchInitialResumes = async () => {
      try {
        const resumeList = await getResumes();

        setResumes(resumeList);

        if (resumeList.length > 0) {
          const latestResume = await getResume(resumeList[0].id);
          setSelectedResume(latestResume);
        } else {
          setSelectedResume(null);
        }
      } catch {
        setError("Unable to load your resumes.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialResumes();
  }, []);

  /*
   * Upload a PDF resume.
   */
  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      event.target.value = "";
      return;
    }

    setUploadFileName(file.name);

    try {
      setUploading(true);
      setError("");

      const result = await uploadResume(file);

      // Refresh and automatically select the newly uploaded resume.
      await loadResumes(result.resume_id);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;

        if (typeof detail === "string") {
          setError(detail);
        } else if (detail?.message) {
          setError(detail.message);
        } else {
          setError("Resume upload failed.");
        }
      } else {
        setError("Resume upload failed.");
      }
    } finally {
      setUploading(false);
      setUploadFileName("");

      // Allows the same file to be selected again after an error.
      event.target.value = "";
    }
  };

  /*
   * Select one of the previously uploaded resumes.
   */
  const handleSelectResume = async (resumeId: number) => {
    if (selectedResume?.id === resumeId) return;

    try {
      setError("");

      const resume = await getResume(resumeId);
      setSelectedResume(resume);
    } catch {
      setError("Unable to load this resume.");
    }
  };

  /*
   * Delete currently selected resume.
   */
  const handleDelete = async () => {
    if (!selectedResume) return;

    try {
      setDeleting(true);
      setError("");

      await deleteResume(selectedResume.id);

      setDeleteModalOpen(false);

      // Select newest remaining resume after deletion.
      await loadResumes();
    } catch {
      setError("Unable to delete the resume.");
    } finally {
      setDeleting(false);
    }
  };

  /*
   * Full-page loader only for the initial load.
   */
  if (loading && resumes.length === 0 && !uploading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle
          className="animate-spin text-blue-400"
          size={28}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 py-10 lg:px-14">
      <div className="mx-auto max-w-6xl">

        {/* ================= HEADER ================= */}

        <section className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-blue-400">
              Candidate profile
            </p>

            <h1 className="mt-3 font-serif text-4xl text-white lg:text-5xl">
              Your resume
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">
              PrepSphere uses your resume to understand your experience,
              skills and projects for job matching and personalized
              interviews.
            </p>
          </div>

          {/* Only show header upload button if user already has a resume */}
          {resumes.length > 0 && (
            <label
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition ${
                uploading
                  ? "cursor-not-allowed bg-blue-600/60"
                  : "cursor-pointer bg-blue-600 hover:bg-blue-500"
              }`}
            >
              {uploading ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />

                  Processing...
                </>
              ) : (
                <>
                  <Upload size={17} />
                  Upload new resume
                </>
              )}

              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                disabled={uploading}
                onChange={handleUpload}
              />
            </label>
          )}
        </section>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ================= NO RESUME ================= */}

        {resumes.length === 0 && (
          <section className="mt-16 flex min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.015] px-6 text-center">
            {uploading ? (
              <>
                <LoaderCircle
                  size={30}
                  className="animate-spin text-blue-400"
                />

                <h2 className="mt-6 font-serif text-3xl text-white">
                  Processing your resume
                </h2>

                <p className="mt-3 max-w-sm truncate text-sm text-white/55">
                  {uploadFileName}
                </p>

                <p className="mt-2 max-w-lg text-xs leading-5 text-white/30">
                  Extracting your skills, education, experience and
                  projects. This may take a few moments.
                </p>
              </>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
                  <FileText
                    className="text-blue-400"
                    size={25}
                  />
                </div>

                <h2 className="mt-6 font-serif text-3xl text-white">
                  Build your candidate profile
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-6 text-white/40">
                  Upload your resume and PrepSphere will extract your
                  skills, education, experience and projects.
                </p>

                <label className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500">
                  <Upload size={17} />
                  Upload PDF

                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={handleUpload}
                  />
                </label>
              </>
            )}
          </section>
        )}

        {/* ================= RESUME CONTENT ================= */}

        {selectedResume && (
          <>
            {/* Upload processing status when resumes already exist */}
            {uploading && (
              <section className="mt-8 flex items-center gap-4 rounded-xl border border-blue-400/20 bg-blue-500/[0.05] p-4">
                <LoaderCircle
                  size={20}
                  className="shrink-0 animate-spin text-blue-400"
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    Processing new resume
                  </p>

                  <p className="mt-1 truncate text-xs text-white/35">
                    {uploadFileName}
                  </p>
                </div>
              </section>
            )}

            {/* ================= RESUME HISTORY ================= */}

            {resumes.length > 1 && (
              <section className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/30">
                    Your resumes
                  </p>

                  <span className="text-xs text-white/25">
                    {resumes.length} uploaded
                  </span>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {resumes.map((resume) => {
                    const isSelected =
                      selectedResume.id === resume.id;

                    return (
                      <button
                        key={resume.id}
                        type="button"
                        disabled={uploading || deleting}
                        onClick={() =>
                          handleSelectResume(resume.id)
                        }
                        className={`min-w-[230px] rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-blue-400/30 bg-blue-500/[0.08]"
                            : "border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <FileText
                            size={18}
                            className={
                              isSelected
                                ? "mt-0.5 shrink-0 text-blue-400"
                                : "mt-0.5 shrink-0 text-white/35"
                            }
                          />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {resume.original_filename}
                            </p>

                            <p className="mt-1 text-xs text-white/30">
                              {new Date(
                                resume.uploaded_at
                              ).toLocaleDateString()}
                            </p>

                            {isSelected && (
                              <p className="mt-2 text-xs text-blue-400">
                                Currently viewing
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ================= SELECTED RESUME ================= */}

            <section className="mt-8 flex flex-col justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <FileText
                    size={20}
                    className="text-blue-400"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {selectedResume.original_filename}
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    Uploaded{" "}
                    {new Date(
                      selectedResume.uploaded_at
                    ).toLocaleDateString()}
                    {" · "}
                    {selectedResume.status}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={uploading || deleting}
                onClick={() => setDeleteModalOpen(true)}
                className="flex shrink-0 items-center gap-2 text-sm text-white/35 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </section>

            {/* ================= SKILLS ================= */}

            <ProfileSection
              icon={<BookOpen size={18} />}
              title="Skills"
            >
              {selectedResume.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedResume.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full border border-blue-400/15 bg-blue-400/[0.06] px-3 py-1.5 text-xs text-blue-200"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyText />
              )}
            </ProfileSection>

            {/* ================= EXPERIENCE ================= */}

            <ProfileSection
              icon={<BriefcaseBusiness size={18} />}
              title="Experience"
            >
              {selectedResume.experience.length > 0 ? (
                <div className="space-y-7">
                  {selectedResume.experience.map((experience) => (
                    <div key={experience.id}>
                      <h3 className="text-sm font-medium text-white">
                        {experience.role}
                      </h3>

                      <p className="mt-1 text-sm text-blue-300">
                        {experience.company}
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        {experience.start_date || "—"} —{" "}
                        {experience.end_date || "Present"}

                        {experience.location &&
                          ` · ${experience.location}`}
                      </p>

                      {experience.description && (
                        <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-6 text-white/45">
                          {experience.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyText />
              )}
            </ProfileSection>

            {/* ================= PROJECTS ================= */}

            <ProfileSection
              icon={<FolderGit2 size={18} />}
              title="Projects"
            >
              {selectedResume.projects.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2">
                  {selectedResume.projects.map((project) => (
                    <div
                      key={project.id}
                      className="border-l border-white/10 pl-4"
                    >
                      <h3 className="text-sm font-medium text-white">
                        {project.name}
                      </h3>

                      {project.description && (
                        <p className="mt-2 text-sm leading-6 text-white/40">
                          {project.description}
                        </p>
                      )}

                      <div className="mt-3 flex gap-4 text-xs text-blue-400">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-300"
                          >
                            GitHub
                          </a>
                        )}

                        {project.project_url && (
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-300"
                          >
                            Project
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyText />
              )}
            </ProfileSection>

            {/* ================= EDUCATION ================= */}

            <ProfileSection
              icon={<GraduationCap size={18} />}
              title="Education"
            >
              {selectedResume.education.length > 0 ? (
                <div className="space-y-6">
                  {selectedResume.education.map((education) => (
                    <div key={education.id}>
                      <h3 className="text-sm font-medium text-white">
                        {education.degree || "Education"}

                        {education.field_of_study &&
                          ` · ${education.field_of_study}`}
                      </h3>

                      <p className="mt-1 text-sm text-white/45">
                        {education.institution ||
                          "Institution not specified"}
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        {education.start_year || "—"} —{" "}
                        {education.end_year || "—"}

                        {education.grade &&
                          ` · Grade: ${education.grade}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyText />
              )}
            </ProfileSection>

            {/* ================= CERTIFICATIONS ================= */}

            <ProfileSection
              icon={<Award size={18} />}
              title="Certifications & achievements"
            >
              {selectedResume.certifications.length === 0 &&
              selectedResume.achievements.length === 0 ? (
                <EmptyText />
              ) : (
                <div className="space-y-4">
                  {selectedResume.certifications.map(
                    (certification) => (
                      <div key={certification.id}>
                        <p className="text-sm text-white">
                          {certification.name}
                        </p>

                        <p className="mt-1 text-xs text-white/35">
                          {[
                            certification.issuer,
                            certification.issue_date,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    )
                  )}

                  {selectedResume.achievements.map(
                    (achievement) => (
                      <p
                        key={achievement.id}
                        className="text-sm leading-6 text-white/50"
                      >
                        {achievement.description}
                      </p>
                    )
                  )}
                </div>
              )}
            </ProfileSection>
          </>
        )}
      </div>

      {/* ================= DELETE MODAL ================= */}

      {deleteModalOpen && selectedResume && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteModalOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1118] p-6 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10">
              <Trash2
                size={20}
                className="text-red-400"
              />
            </div>

            <h2 className="mt-5 font-serif text-2xl text-white">
              Delete this resume?
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              You're about to delete{" "}
              <span className="font-medium text-white/70">
                {selectedResume.original_filename}
              </span>
              . Its parsed profile data will also be removed.
            </p>

            <p className="mt-2 text-xs text-white/30">
              This action cannot be undone.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModalOpen(false)}
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
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete resume
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-b border-white/10 py-9 md:grid-cols-[220px_1fr]">
      <div className="flex items-center gap-3 self-start text-white/50">
        <span className="text-blue-400">
          {icon}
        </span>

        <h2 className="text-sm font-medium text-white/70">
          {title}
        </h2>
      </div>

      <div>{children}</div>
    </section>
  );
}

function EmptyText() {
  return (
    <p className="text-sm text-white/30">
      No information found in this resume.
    </p>
  );
}

export default ResumePage;