import { Building2, Mail, ShieldCheck, Calendar, Clock, BarChart2, Users, BookOpen, Download } from "lucide-react";

const USER = {
  name: "Tara Westbrook",
  initials: "TW",
  title: "District SEL Coordinator",
  organization: "Riverside Unified School District",
  email: "t.westbrook@riverside-usd.org",
  role: "Administrator",
  username: "twestbrook",
  memberSince: "August 2023",
  lastLogin: "Today, 8:47 AM",
};

const ACCESS_TAGS = [
  "Ratings Reports",
  "Completion Reports",
  "SEL Curriculum",
  "Student Portal Reports",
  "Move This World",
  "Data Export",
  "Batch Rating",
  "Administrator Access",
];

const SCHOOLS = [
  { name: "Lincoln Elementary",       students: 847  },
  { name: "Washington Middle School", students: 1203 },
  { name: "Jefferson High School",    students: 2156 },
  { name: "Roosevelt K-8",            students: 692  },
  { name: "Adams Elementary",         students: 534  },
];

const ACTIVITY = [
  { Icon: BarChart2, action: "Viewed Impact Report",                  when: "Today, 9:04 AM" },
  { Icon: Users,     action: "Rated 47 students · 25-26 Mid window",  when: "2 days ago"     },
  { Icon: BookOpen,  action: "Assigned SEL Curriculum to Lincoln",     when: "Last week"      },
  { Icon: Download,  action: "Exported Rating Data (CSV)",             when: "May 8"          },
  { Icon: BarChart2, action: "Viewed Grade Level Report",              when: "May 6"          },
];

export default function ProfilePage() {
  const totalStudents = SCHOOLS.reduce((s, sc) => s + sc.students, 0);

  return (
    <div className="p-6 space-y-5">

      {/* ── Profile card ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">

        {/* Banner */}
        <div className="relative h-36 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #1a4e8a 0%, #1e6fb5 45%, #0d9488 100%)" }}
          />
          {/* Decorative circles — subtle texture referencing SEL's overlapping competency domains */}
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 900 144"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <circle cx="760" cy="20"  r="150" fill="white" fillOpacity="0.05" />
            <circle cx="820" cy="120" r="100" fill="white" fillOpacity="0.07" />
            <circle cx="640" cy="90"  r="75"  fill="white" fillOpacity="0.05" />
            <circle cx="70"  cy="160" r="120" fill="white" fillOpacity="0.04" />
            <circle cx="220" cy="-10" r="100" fill="white" fillOpacity="0.06" />
            <circle cx="400" cy="130" r="65"  fill="white" fillOpacity="0.04" />
            <circle cx="520" cy="-30" r="80"  fill="white" fillOpacity="0.03" />
          </svg>
        </div>

        {/* Identity */}
        <div className="px-6 pb-6">
          <div className="relative -mt-9 mb-3">
            <div className="w-[72px] h-[72px] rounded-full bg-[#1a4e8a] border-4 border-white flex items-center justify-center shadow-sm">
              <span className="text-[22px] font-bold text-white tracking-wide select-none">
                {USER.initials}
              </span>
            </div>
          </div>

          <h1 className="text-[22px] font-bold text-gray-900 leading-tight">{USER.name}</h1>
          <p className="text-[14px] text-gray-500 mt-0.5">{USER.title}</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
            <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
              <Building2 size={13} className="text-gray-400 shrink-0" />
              {USER.organization}
            </span>
            <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
              <Mail size={13} className="text-gray-400 shrink-0" />
              {USER.email}
            </span>
            <span className="flex items-center gap-1.5 text-[13px]">
              <ShieldCheck size={13} className="text-[#1a4e8a] shrink-0" />
              <span className="text-[#1a4e8a] font-medium">{USER.role}</span>
            </span>
            <span className="flex items-center gap-1.5 text-[13px] text-gray-500">
              <Calendar size={13} className="text-gray-400 shrink-0" />
              Member since {USER.memberSince}
            </span>
          </div>
        </div>
      </div>

      {/* ── Two-column body ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_300px] gap-5 items-start">

        {/* Left */}
        <div className="space-y-5">

          {/* Access & Permissions */}
          <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-5">
            <h2 className="text-[13px] font-semibold text-gray-700 mb-3">Access & Permissions</h2>
            <div className="flex flex-wrap gap-2">
              {ACCESS_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="h-7 px-3 inline-flex items-center rounded-full border border-[#e8ecf0] text-[12.5px] text-gray-600 bg-gray-50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-5">
            <h2 className="text-[13px] font-semibold text-gray-700 mb-4">Recent Activity</h2>
            <div className="space-y-3.5">
              {ACTIVITY.map(({ Icon, action, when }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#eef2f8] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={13} className="text-[#1a4e8a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-800">{action}</p>
                    <p className="text-[11.5px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={10} />
                      {when}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right */}
        <div className="space-y-5">

          {/* My Schools */}
          <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-semibold text-gray-700">My Schools</h2>
              <span className="text-[11.5px] text-gray-400">{SCHOOLS.length} sites</span>
            </div>
            <div className="space-y-3">
              {SCHOOLS.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#eef2f8] flex items-center justify-center shrink-0">
                      <Building2 size={13} className="text-[#1a4e8a]" />
                    </div>
                    <span className="text-[13px] text-gray-700 truncate">{s.name}</span>
                  </div>
                  <span className="text-[12px] text-gray-400 shrink-0 tabular-nums">
                    {s.students.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3.5 border-t border-[#f0f4f8] flex items-center justify-between">
              <span className="text-[12px] text-gray-500">Total students</span>
              <span className="text-[13px] font-bold text-gray-900 tabular-nums">
                {totalStudents.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Account details */}
          <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-5">
            <h2 className="text-[13px] font-semibold text-gray-700 mb-3.5">Account</h2>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-gray-500">Username</span>
                <span className="text-[12.5px] text-gray-800 font-medium">{USER.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-gray-500">Last login</span>
                <span className="text-[12.5px] text-gray-700">{USER.lastLogin}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] text-gray-500">Status</span>
                <span className="text-[11.5px] font-semibold text-[#166534] bg-[#e4f4eb] px-2.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
