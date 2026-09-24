import React, { useEffect, useMemo, useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
  useLocation,
  useParams
} from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Plus,
  Send,
  GraduationCap,
  ShieldCheck,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  Menu,
  X,
  SunMoon
} from 'lucide-react';
import api from './api';

const statuses = {
  Pending: 'pending',
  Submitted: 'submitted',
  Late: 'late',
  Graded: 'graded',
  Missing: 'missing'
};

function Layout({ children, user, setUser }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    nav('/login');
  };

  return (
    <div className="shell">
      <div className="orb orb1" />
      <div className="orb orb2" />

      <aside className={open ? 'open' : ''}>
        <div className="brand">
          <div className="brandIcon">
            <GraduationCap />
          </div>

          <div>
            <b>
              Academic<span>Flow</span>
            </b>
            <small>ACADEMIC INTELLIGENCE</small>
          </div>
        </div>

        <nav>
          <Link to="/">
            <LayoutDashboard />
            Dashboard
          </Link>

          {user.role === 'professor' && (
            <Link to="/manage">
              <BookOpen />
              Manage Assignments
            </Link>
          )}
        </nav>

        <div className="sideBottom">
          <div className="profile">
            <div className="avatar">{user.name[0]}</div>

            <div>
              <b>{user.name}</b>
              <small>{user.role}</small>
            </div>
          </div>

          <button className="ghost" onClick={logout}>
            <LogOut />
            Sign out
          </button>
        </div>
      </aside>

      <main>
        <header>
          <button
            className="mobileMenu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>

          <div>
            <span className="eyebrow">
              {user.role === 'student'
                ? 'STUDENT PORTAL'
                : 'FACULTY CONSOLE'}
            </span>

            <h2>
              Good day, {user.name.split(' ')[0]}{' '}
              <span className="wave">✦</span>
            </h2>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');

    try {
      const r = await api.post('/auth/login', form);

      localStorage.setItem('af_token', r.data.token);
      onLogin(r.data.user);
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          'Unable to sign in. Please try again.'
      );
    }
  };

  return (
    <div className="auth">
      <div className="authVisual">
        <div className="brand big">
          <div className="brandIcon">
            <GraduationCap />
          </div>

          <div>
            <b>
              Academic<span>Flow</span>
            </b>
            <small>ACADEMIC INTELLIGENCE</small>
          </div>
        </div>

        <div className="heroText">
          <span>THE NEXT-GEN ACADEMIC WORKSPACE</span>

          <h1>
            Turn assignments into
            <br />
            <em>academic momentum.</em>
          </h1>

          <p>
            One intelligent workspace for publishing, submissions,
            grading and student progress.
          </p>
        </div>

        <div className="floatingCard">
          <CheckCircle2 />

          <div>
            <b>Revision protected</b>
            <small>Every submission is preserved</small>
          </div>
        </div>
      </div>

      <form className="authCard" onSubmit={submit}>
        <span className="eyebrow">WELCOME BACK</span>

        <h2>Sign in to AcademicFlow</h2>

        <p className="muted">
          Use your registered account to enter your workspace.
        </p>

        <label>
          Email

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </label>

        <label>
          Password

          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </label>

        {err && <div className="error">{err}</div>}

        <button className="primary full">
          Enter workspace <Send size={17} />
        </button>

        <p className="authSwitch">
          Don't have an account?{' '}
          <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}

const SUBJECT_OPTIONS = [
  'DBMS',
  'Operating Systems',
  'Web Technology',
  'Data Structures',
  'Computer Networks',
  'Software Engineering'
];

function Register({ onRegister }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    academicYear: '2026-27',
    section: 'A',
    subjects: [],
    facultyCode: ''
  });

  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const toggleSubject = (subject) =>
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(subject)
        ? f.subjects.filter((x) => x !== subject)
        : [...f.subjects, subject]
    }));

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);

    try {
      const payload = { ...form };

      if (form.role === 'student') {
        delete payload.facultyCode;
      }

      const r = await api.post('/auth/register', payload);

      localStorage.setItem('af_token', r.data.token);
      onRegister(r.data.user);
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          'Unable to create account. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="authVisual">
        <div className="brand big">
          <div className="brandIcon">
            <GraduationCap />
          </div>

          <div>
            <b>
              Academic<span>Flow</span>
            </b>
            <small>ACADEMIC INTELLIGENCE</small>
          </div>
        </div>

        <div className="heroText">
          <span>YOUR ACADEMIC WORKSPACE</span>

          <h1>
            Build your
            <br />
            <em>academic momentum.</em>
          </h1>

          <p>
            Create a secure workspace for assignments, submissions,
            grading and measurable academic progress.
          </p>
        </div>

        <div className="floatingCard">
          <ShieldCheck />

          <div>
            <b>Section protected</b>
            <small>Students only see their assigned work</small>
          </div>
        </div>
      </div>

      <form
        className="authCard registerCard"
        onSubmit={submit}
      >
        <span className="eyebrow">CREATE ACCOUNT</span>

        <h2>Join AcademicFlow</h2>

        <p className="muted">
          Create your own secure academic workspace.
        </p>

        <div className="roleSwitch">
          <button
            type="button"
            className={
              form.role === 'student' ? 'active' : ''
            }
            onClick={() =>
              setForm({
                ...form,
                role: 'student'
              })
            }
          >
            Student
          </button>

          <button
            type="button"
            className={
              form.role === 'professor' ? 'active' : ''
            }
            onClick={() =>
              setForm({
                ...form,
                role: 'professor'
              })
            }
          >
            Professor
          </button>
        </div>

        <label>
          Full name

          <input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
            placeholder="Your full name"
            required
            autoComplete="name"
          />
        </label>

        <label>
          Email

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value
              })
            }
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </label>

        <label>
          Password

          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
            placeholder="At least 6 characters"
            minLength={6}
            required
            autoComplete="new-password"
          />
        </label>

        {form.role === 'student' && (
          <div className="two">
            <label>
              Academic year

              <input
                value={form.academicYear}
                onChange={(e) =>
                  setForm({
                    ...form,
                    academicYear: e.target.value
                  })
                }
                placeholder="2026-27"
                required
              />
            </label>

            <label>
              Section

              <input
                value={form.section}
                onChange={(e) =>
                  setForm({
                    ...form,
                    section: e.target.value.toUpperCase()
                  })
                }
                placeholder="A"
                required
              />
            </label>
          </div>
        )}

        {form.role === 'professor' && (
          <label>
            Faculty access code

            <input
              type="password"
              value={form.facultyCode}
              onChange={(e) =>
                setForm({
                  ...form,
                  facultyCode: e.target.value
                })
              }
              placeholder="Private faculty code"
              required
            />
          </label>
        )}

        <div className="subjectPicker">
          <span>
            Subjects{' '}
            {form.role === 'student'
              ? 'you are enrolled in'
              : 'you manage'}
          </span>

          <div>
            {SUBJECT_OPTIONS.map((subject) => (
              <button
                type="button"
                key={subject}
                className={
                  form.subjects.includes(subject)
                    ? 'selected'
                    : ''
                }
                onClick={() => toggleSubject(subject)}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {err && <div className="error">{err}</div>}

        <button
          className="primary full"
          disabled={busy}
        >
          {busy ? (
            'Creating workspace…'
          ) : (
            <>
              Create workspace <Send size={17} />
            </>
          )}
        </button>

        <p className="authSwitch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

function Stat({ icon, label, value, tone }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`stat ${tone}`}
    >
      <div className="statIcon">{icon}</div>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </motion.div>
  );
}

function Status({ s }) {
  return (
    <span className={`status ${statuses[s] || 'pending'}`}>
      {s}
    </span>
  );
}

function StudentDashboard() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [msg, setMsg] = useState('');

  const load = () =>
    api
      .get('/student/dashboard')
      .then((r) => setData(r.data));

  // FIXED: do not pass load directly to useEffect
  useEffect(() => {
    load();
  }, []);

  if (!data) return <Loader />;

  const a = data.assignments;

  const counts = a.reduce(
    (o, x) => {
      o[x.status] = (o[x.status] || 0) + 1;
      return o;
    },
    {}
  );

  return (
    <div className="page">
      <div className="hero">
        <div>
          <span className="eyebrow">
            {new Date().getFullYear()} / ACADEMIC YEAR
          </span>

          <h1>
            Your progress, <em>in motion.</em>
          </h1>

          <p>
            Section {data.profile?.section || '—'} ·{' '}
            {data.subjects.length} subjects · live from your
            academic records
          </p>
        </div>

        <div className="heroBadge">
          <ShieldCheck />

          <span>
            Section secured
            <br />
            <b>Access verified</b>
          </span>
        </div>
      </div>

      <div className="stats">
        <Stat
          icon={<Clock3 />}
          label="Pending"
          value={counts.Pending || 0}
          tone="purple"
        />

        <Stat
          icon={<Send />}
          label="Submitted"
          value={counts.Submitted || 0}
          tone="blue"
        />

        <Stat
          icon={<AlertTriangle />}
          label="Late"
          value={counts.Late || 0}
          tone="orange"
        />

        <Stat
          icon={<CheckCircle2 />}
          label="Graded"
          value={counts.Graded || 0}
          tone="green"
        />
      </div>

      {data.flags.length > 0 && (
        <div className="intervention">
          <AlertTriangle />

          <div>
            <b>Academic review flag active</b>

            <p>
              {data.flags
                .map(
                  (f) =>
                    `${f.subject}: ${f.missedCount} missed`
                )
                .join(' · ')}
            </p>
          </div>
        </div>
      )}

      <section className="section">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">WORKSPACE</span>
            <h2>Assignments</h2>
          </div>

          <span className="count">
            {a.length} records
          </span>
        </div>

        <div className="assignmentGrid">
          {a.map((x, i) => (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -5 }}
              className="assignment"
              key={x._id}
            >
              <div className="assignmentTop">
                <span className="subject">{x.subject}</span>
                <Status s={x.status} />
              </div>

              <h3>{x.title}</h3>

              <p>{x.description}</p>

              <div className="deadline">
                <Clock3 size={15} />
                Due{' '}
                {new Date(x.deadline).toLocaleString([], {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </div>

              {x.submission?.revisions?.length > 0 && (
                <div className="revisions">
                  <span>
                    {x.submission.revisions.length}{' '}
                    revision
                    {x.submission.revisions.length > 1
                      ? 's'
                      : ''}{' '}
                    protected
                  </span>

                  <span>
                    R{x.submission.activeRevision}
                  </span>
                </div>
              )}

              <button
                className="outline full"
                onClick={() => {
                  setSelected(x);
                  setMsg('');
                }}
              >
                {x.status === 'Pending'
                  ? 'Submit work'
                  : 'View / revise'}
              </button>
            </motion.article>
          ))}
        </div>
      </section>

      {selected && (
        <div
          className="modalWrap"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              onClick={() => setSelected(null)}
            >
              <X />
            </button>

            <span className="subject">
              {selected.subject}
            </span>

            <h2>{selected.title}</h2>

            <p>{selected.description}</p>

            {selected.submission?.revisions?.length > 0 && (
              <div className="timeline">
                {selected.submission.revisions.map((r) => (
                  <div
                    className="timelineItem"
                    key={r._id}
                  >
                    <div className="dot" />

                    <div>
                      <b>
                        Revision {r.revisionNumber}
                      </b>

                      <small>
                        {new Date(
                          r.submittedAt
                        ).toLocaleString()}{' '}
                        · {r.timeliness}
                      </small>

                      {r.score != null && (
                        <small>
                          Score {r.score}/
                          {selected.maxScore} ·{' '}
                          {r.feedback ||
                            'No written feedback'}
                        </small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <label>
              Submission content

              <textarea
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                placeholder="Write your submission here..."
              />
            </label>

            <label>
              File / document link (optional)

              <input
                value={fileUrl}
                onChange={(e) =>
                  setFileUrl(e.target.value)
                }
                placeholder="https://..."
              />
            </label>

            {msg && (
              <div className="notice">{msg}</div>
            )}

            <button
              className="primary full"
              onClick={async () => {
                try {
                  await api.post(
                    `/submissions/${selected._id}`,
                    {
                      content,
                      fileUrl
                    }
                  );

                  setContent('');
                  setFileUrl('');
                  setMsg(
                    'Revision submitted and permanently archived.'
                  );

                  load();
                } catch (e) {
                  setMsg(
                    e.response?.data?.message ||
                      'Submission failed'
                  );
                }
              }}
            >
              <Send size={17} />
              Submit revision
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ProfessorDashboard() {
  const [d, setD] = useState(null);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/professor/dashboard'),
      api.get('/student/students')
    ]).then(([a, b]) => {
      setD(a.data);
      setStudents(b.data);
    });
  }, []);

  if (!d) return <Loader />;

  const graded = d.submissions.filter((s) =>
    s.revisions.some((r) => r.state === 'graded')
  ).length;

  return (
    <div className="page">
      <div className="hero">
        <div>
          <span className="eyebrow">
            FACULTY CONSOLE
          </span>

          <h1>
            Command your <em>academic flow.</em>
          </h1>

          <p>
            Publish, review and grade with complete revision
            visibility.
          </p>
        </div>

        <div className="heroBadge">
          <BookOpen />

          <span>
            {d.assignments.length}
            <br />
            <b>Active assignments</b>
          </span>
        </div>
      </div>

      <div className="stats">
        <Stat
          icon={<BookOpen />}
          label="Assignments"
          value={d.assignments.length}
          tone="purple"
        />

        <Stat
          icon={<Send />}
          label="Submissions"
          value={d.submissions.length}
          tone="blue"
        />

        <Stat
          icon={<CheckCircle2 />}
          label="Graded"
          value={graded}
          tone="green"
        />

        <Stat
          icon={<GraduationCap />}
          label="Students"
          value={students.length}
          tone="orange"
        />
      </div>

      <section className="section">
        <div className="sectionHead">
          <div>
            <span className="eyebrow">
              GRADING WORKBENCH
            </span>

            <h2>Recent submissions</h2>
          </div>
        </div>

        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Assignment</th>
                <th>Subject</th>
                <th>Revision</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {d.submissions.map((s) => {
                const a = d.assignments.find(
                  (x) =>
                    String(x._id) === String(s.assignment)
                );

                const rev = s.revisions.find(
                  (r) =>
                    r.revisionNumber ===
                    s.activeRevision
                );

                return (
                  <tr key={s._id}>
                    <td>
                      <b>{s.student?.name}</b>
                      <small>
                        {s.student?.email}
                      </small>
                    </td>

                    <td>{a?.title}</td>

                    <td>
                      <span className="subject">
                        {a?.subject}
                      </span>
                    </td>

                    <td>R{s.activeRevision}</td>

                    <td>
                      <Status
                        s={
                          rev?.state === 'graded'
                            ? 'Graded'
                            : rev?.timeliness ||
                              'Submitted'
                        }
                      />
                    </td>

                    <td>
                      <Link
                        className="textLink"
                        to={`/grade/${s._id}`}
                      >
                        Open work →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Manage() {
  const [items, setItems] = useState([]);

  const [form, setForm] = useState({
    title: '',
    subject: 'DBMS',
    description: '',
    academicYear: '2026-27',
    section: 'A',
    deadline: '',
    maxScore: 100
  });

  const load = () =>
    api
      .get('/assignments')
      .then((r) => setItems(r.data));

  // FIXED: do not pass load directly to useEffect
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page">
      <div className="sectionHead">
        <div>
          <span className="eyebrow">
            CONTENT CONTROL
          </span>

          <h1>Assignment studio</h1>

          <p className="muted">
            Publish section-scoped academic work.
          </p>
        </div>
      </div>

      <div className="studio">
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();

            await api.post('/assignments', form);

            setForm({
              ...form,
              title: '',
              description: ''
            });

            load();
          }}
        >
          <h3>Create assignment</h3>

          <label>
            Title

            <input
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value
                })
              }
              required
            />
          </label>

          <div className="two">
            <label>
              Subject

              <input
                value={form.subject}
                onChange={(e) =>
                  setForm({
                    ...form,
                    subject: e.target.value
                  })
                }
              />
            </label>

            <label>
              Section

              <input
                value={form.section}
                onChange={(e) =>
                  setForm({
                    ...form,
                    section: e.target.value
                  })
                }
              />
            </label>
          </div>

          <label>
            Academic year

            <input
              value={form.academicYear}
              onChange={(e) =>
                setForm({
                  ...form,
                  academicYear: e.target.value
                })
              }
            />
          </label>

          <label>
            Deadline

            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(e) =>
                setForm({
                  ...form,
                  deadline: e.target.value
                })
              }
              required
            />
          </label>

          <label>
            Maximum score

            <input
              type="number"
              value={form.maxScore}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxScore: +e.target.value
                })
              }
            />
          </label>

          <label>
            Description

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value
                })
              }
            />
          </label>

          <button className="primary full">
            <Plus size={18} />
            Publish assignment
          </button>
        </form>

        <div className="studioList">
          {items.map((x) => (
            <div className="miniCard" key={x._id}>
              <div>
                <span className="subject">
                  {x.subject}
                </span>

                <h3>{x.title}</h3>

                <small>
                  {x.section} · {x.academicYear} · due{' '}
                  {new Date(
                    x.deadline
                  ).toLocaleString()}
                </small>
              </div>

              <Status s="Pending" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Grade() {
  const { id } = useParams();

  const [s, setS] = useState(null);

  const [form, setForm] = useState({
    score: 0,
    feedback: ''
  });

  const [reopen, setReopen] = useState({
    resubmissionDeadline: '',
    reopeningReason: ''
  });

  const [notice, setNotice] = useState('');

  useEffect(() => {
    api
      .get('/professor/dashboard')
      .then((r) =>
        setS(
          r.data.submissions.find(
            (x) => x._id === id
          )
        )
      );
  }, [id]);

  if (!s) return <Loader />;

  const rev = s.revisions.find(
    (r) =>
      r.revisionNumber === s.activeRevision
  );

  return (
    <div className="page">
      <Link to="/" className="back">
        ← Dashboard
      </Link>

      <div className="gradeHeader">
        <div>
          <span className="subject">
            REVISION {rev.revisionNumber}
          </span>

          <h1>
            Review {s.student?.name}'s work
          </h1>

          <p className="muted">
            Immutable revision record ·{' '}
            {new Date(
              rev.submittedAt
            ).toLocaleString()}
          </p>
        </div>

        <div className="scoreBubble">
          {rev.score ?? '—'}
          <small>/ score</small>
        </div>
      </div>

      <div className="gradeGrid">
        <div className="submissionBox">
          <span className="eyebrow">
            SUBMITTED CONTENT
          </span>

          <div className="contentPreview">
            {rev.content ||
              'No text content provided.'}
          </div>

          <div className="timeline">
            {s.revisions.map((r) => (
              <div
                className="timelineItem"
                key={r._id}
              >
                <div className="dot" />

                <div>
                  <b>
                    Revision {r.revisionNumber}
                  </b>

                  <small>
                    {new Date(
                      r.submittedAt
                    ).toLocaleString()}{' '}
                    · {r.timeliness}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();

            const r = await api.post(
              '/professor/grade',
              {
                submissionId: s._id,
                revisionId: rev._id,
                ...form
              }
            );

            setS(r.data);
            setNotice('Grade saved.');
          }}
        >
          <h3>Grade this revision</h3>

          <label>
            Score

            <input
              type="number"
              value={form.score}
              onChange={(e) =>
                setForm({
                  ...form,
                  score: +e.target.value
                })
              }
            />
          </label>

          <label>
            Written feedback

            <textarea
              value={form.feedback}
              onChange={(e) =>
                setForm({
                  ...form,
                  feedback: e.target.value
                })
              }
              placeholder="Give actionable feedback..."
            />
          </label>

          <button className="primary full">
            <CheckCircle2 />
            Save grade
          </button>

          {notice && (
            <div className="notice">
              {notice}
            </div>
          )}

          <div className="reopenBox">
            <span className="eyebrow">
              CONTROLLED RESUBMISSION
            </span>

            <h3>Reopen for this student</h3>

            <label>
              New resubmission deadline

              <input
                type="datetime-local"
                value={
                  reopen.resubmissionDeadline
                }
                onChange={(e) =>
                  setReopen({
                    ...reopen,
                    resubmissionDeadline:
                      e.target.value
                  })
                }
              />
            </label>

            <label>
              Reason

              <textarea
                value={reopen.reopeningReason}
                onChange={(e) =>
                  setReopen({
                    ...reopen,
                    reopeningReason:
                      e.target.value
                  })
                }
                placeholder="Why is this revision being authorized?"
              />
            </label>

            <button
              type="button"
              className="outline full"
              onClick={async () => {
                try {
                  await api.post(
                    '/professor/reopen',
                    {
                      assignmentId: s.assignment,
                      studentId: s.student._id,
                      resubmissionDeadline:
                        reopen.resubmissionDeadline,
                      reopeningReason:
                        reopen.reopeningReason
                    }
                  );

                  setNotice(
                    'Resubmission authorized. The student can now submit before the new deadline.'
                  );
                } catch (e) {
                  setNotice(
                    e.response?.data?.message ||
                      'Reopen failed'
                  );
                }
              }}
            >
              <ShieldCheck />
              Authorize revision
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="loader">
      <div />
      <span>Loading AcademicFlow…</span>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('af_token')) {
      api
        .get('/auth/me')
        .then((r) => setUser(r.data.user))
        .catch(() => localStorage.clear());
    }
  }, []);

  if (!user) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<Login onLogin={setUser} />}
        />

        <Route
          path="/register"
          element={
            <Register onRegister={setUser} />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    );
  }

  return (
    <Layout user={user} setUser={setUser}>
      <Routes>
        <Route
          path="/"
          element={
            user.role === 'student' ? (
              <StudentDashboard />
            ) : (
              <ProfessorDashboard />
            )
          }
        />

        <Route
          path="/manage"
          element={<Manage />}
        />

        <Route
          path="/grade/:id"
          element={<Grade />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
