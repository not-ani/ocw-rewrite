"use client"
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const defaultPhoto =
  "https://ugakd4mkxv.ufs.sh/f/QRXW6mPDvNgcf1bAHpXv5c4nkOatgwsmYj96KRpli3hUEdx1";

const writers = [
  {
    id: 1,
    name: "Aniketh Chenjeri",
    role: " Co-Founder | Project Lead",
    avatar: defaultPhoto,
    description:
      "Aniketh is the President of the Computer Science Honor Society and lead developer of our platform",
  },
  {
    id: 2,
    name: "Jason Chen",
    role: "Co-Founder | Developer",
    avatar:
      "https://ugakd4mkxv.ufs.sh/f/QRXW6mPDvNgcBOk5v5CzYZbKVLiWvQ9r1lpMUyjw58osCXnO",
    description:
      "Jason is the Co-Founder of the old OpenCourseWare site and is helping develop this platform.",
  },
  {
    id: 3,
    name: "Matthew Anderson",
    role: "Co-Founder | Writer",
    avatar: defaultPhoto,
    description: "Matthew was is the Co-Founder of the old OpenCourseWare site",
  },

  {
    id: 9,
    name: "Cooper Shine",
    role: "Mathematics Lead | Writer",
    avatar: defaultPhoto,
    description:
      "Cooper is the co-maintainer of the Mathematics section of the platform",
  },
  {
    id: 10,
    name: "Krit Krishna",
    role: "Mathematics Lead | Writer",
    avatar: defaultPhoto,
    description:
      "Krit is the co-maintainer of the Mathematics section of the platform",
  },
  {
    id: 11,
    name: "Andrew Doyle",
    role: "Mathematics Lead | Writer",
    avatar: defaultPhoto,
    description:
      "Andrew is theco-maintainer of the Mathematics & Chemistry section of the platform",
  },
  {
    id: 5,
    role: "Writer",
    name: "Rodrigo Salgado Vallarino",
    avatar:
      "https://ugakd4mkxv.ufs.sh/f/QRXW6mPDvNgcbTcMMoLZTl6LHeR2dnPrGuZSo1VBEa3gxciU",
    description:
      "Rodrigo is a contributor to many courses on the platform and maintained the content on OpenCourseWare for the 2023-2024 school year",
  },
  {
    id: 4,
    name: "Jonathan Varghese",
    role: "Writer",
    avatar: defaultPhoto,
    description:
      "Jonathan is a contributor to many of the courses on the platform, including the AP US Government and Politics course",
  },

  {
    id: 6,
    name: "Aimee Resnick",
    role: "Writer",
    avatar: defaultPhoto,
    description:
      "Aimee is a contributor to many of the courses on the platform, including the AP Biology course",
  },
  {
    id: 7,
    name: " Josh Guthrie",
    role: "Writer",
    avatar: defaultPhoto,
    description:
      "Josh is a contributor to many of the courses on the platform, including the AP Environmental Science course",
  },
  {
    id: 8,
    name: "Anna Liu",
    role: "Writer",
    avatar: defaultPhoto,
    description:
      "Anna is a contributor to many of the courses on the platform, including the AP Statistics course",
  },

  {
    id: 12,
    name: "Rohith Thomas",
    role: "Writer",
    avatar: defaultPhoto,
    description:
      "Rohith is a mathematical specialist and contributor to physical and high level mathematics courses on the platform",
  },
  {
    id: 13,
    name: "Ani Gadepalli",
    role: "Writer",
    avatar: defaultPhoto,
    description:
      "Ani has contributed to the AP Comparative Government Course on the platform",
  },
];

export default function WritersTable() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleRowClick = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="mx-auto  h-screen max-w-4xl">
      <div className="overflow-hidden rounded-2xl">
        {/* Table Header */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-12 items-center gap-4">
            <div className="col-span-1" />
            <div className="col-span-5">
              <span className="font-semibold text-gray-600 text-sm uppercase tracking-wide">
                Name
              </span>
            </div>
            <div className="col-span-5">
              <span className="font-semibold text-gray-600 text-sm uppercase tracking-wide">
                Role
              </span>
            </div>
            <div className="col-span-1" />
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {writers.map((writer) => (
            <div className="group relative" key={writer.id}>
              {/* Table Row */}
              <div
                aria-expanded={expandedId === writer.id}
                aria-label={`${expandedId === writer.id ? "Collapse" : "Expand"} details for ${writer.name}`}
                className={`cursor-pointer px-8 py-6 transition-all duration-300 ease-out ${expandedId === writer.id ? "text-primary/30" : ""
                  }`}
                onClick={() => handleRowClick(writer.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRowClick(writer.id);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="grid grid-cols-12 items-center gap-4">
                  {/* Avatar */}
                  <div className="col-span-1">
                    <div
                      className={`relative transition-all duration-300 ease-out ${expandedId === writer.id
                        ? "scale-75 opacity-0"
                        : "scale-100 opacity-100"
                        }`}
                    >
                      <img
                        alt={writer.name}
                        className="h-10 w-10 rounded-full object-cover shadow-sm ring-2 ring-white transition-all duration-300 hover:ring-gray-200"
                        src={writer.avatar}
                      />
                    </div>
                  </div>

                  {/* Name */}
                  <div className="col-span-5">
                    <h3
                      className={`font-semibold transition-all duration-300 group-hover:text-foreground ${expandedId === writer.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                        }`}
                    >
                      {writer.name}
                    </h3>
                  </div>

                  {/* Role */}
                  <div className="col-span-5">
                    <span
                      className={`transition-all duration-300 group-hover:text-foreground/90 ${expandedId === writer.id
                        ? "font-medium text-accent-foreground/80"
                        : "text-muted-foreground"
                        }`}
                    >
                      {writer.role}
                    </span>
                  </div>

                  {/* Expand Icon */}
                  <div className="col-span-1 flex justify-end">
                    <div
                      className={
                        "text-muted-foreground transition-all duration-300 group-hover:text-foreground/90"
                      }
                    >
                      {expandedId === writer.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-out ${expandedId === writer.id
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
                  }`}
              >
                <div className="px-8 pt-6 pb-8">
                  <div className="mx-auto max-w-2xl">
                    <div
                      className={`transform transition-all duration-500 ease-out ${expandedId === writer.id
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                        }`}
                    >
                      <div className="overflow-hidden rounded-2xl border">
                        {/* Card Header with Image */}
                        <div className="relative h-48 bg-primary-foreground">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <img
                              alt={writer.name}
                              className="h-24 w-24 rounded-xl object-cover shadow-lg ring-4"
                              src={writer.avatar}
                            />
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-6">
                          <div className="mb-4 text-center">
                            <h3 className="mb-1 font-bold text-xl">
                              {writer.name}
                            </h3>
                            <span className="font-medium text-primary/70">
                              {writer.role}
                            </span>
                          </div>

                          <p className="text-primary/30 text-sm leading-relaxed">
                            {writer.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
