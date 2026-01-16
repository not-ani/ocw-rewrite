import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@ocw/ui/button";
import { ArrowRight, Github, Linkedin, Globe, Instagram } from "lucide-react";

export const metadata: Metadata = {
  title: "Meet the Team | The OpenCourseWare Project",
  description:
    "Meet the passionate individuals behind OCW — students, developers, and educators working to make education accessible for everyone.",
};

interface TeamMember {
  name: string;
  role: string;
  image?: string;
  initials: string;
  links?: {
    github?: string;
    linkedin?: string;
    website?: string;
    instagram?: string;
  };
  gradient?: string;
}

const team: TeamMember[] = [
  {
    name: "Ani Chenjeri",
    role: "Cofounder, President & Lead Developer",
    initials: "AC",
    gradient: "from-indigo-500/20 via-blue-500/15 to-cyan-500/20",
    links: {
      github: "https://github.com/not-ani",
      linkedin: "https://www.linkedin.com/in/aniketh-chenjeri/",
      website: "https://www.anikethchenjeri.com/",
    },
  },
  {
    name: "Jason Chen",
    role: "Cofounder & Developer",
    initials: "JC",
    gradient: "from-emerald-500/20 via-green-500/15 to-teal-500/20",
    links: {
      github: "https://github.com/jasonschen3/",
      linkedin: "https://www.linkedin.com/in/chensjason",
      website: "https://jasonschen.com/",
    },
  },
  {
    name: "Rishabh Sodani",
    role: "Content Lead - Cherry Creek High School",
    initials: "RS",
    gradient: "from-rose-500/20 via-pink-500/15 to-fuchsia-500/20",
    links: {
      github: "https://github.com/rsodani28",
      linkedin: "https://www.linkedin.com/in/rishabh-sodani-838083297/",
    },
  },
  {
    name: "Kaushik Vukanthi",
    role: "Content Lead - Grandview High School",
    initials: "KV",
    gradient: "from-amber-500/20 via-orange-500/15 to-yellow-500/20",
    links: {
      linkedin: "https://www.linkedin.com/in/kaushik-vukanti-496414281/",
    },
  },
  {
    name: "Utkarsh Salgar",
    role: "Content Lead - Eaglecrest High School",
    initials: "US",
    gradient: "from-violet-500/20 via-purple-500/15 to-indigo-500/20",
    links: {
      linkedin: "https://www.linkedin.com/in/utkarsh-salgar-a800a6384/",
    },
  },
  {
    name: "Dhrithi Ramesh",
    role: "Content Lead - Rock Canyon High School",
    initials: "DR",
    gradient: "from-sky-500/20 via-cyan-500/15 to-blue-500/20",
    links: {
      linkedin: "https://www.linkedin.com/in/dhriti-ramesh-2a7444264/",
    },
  },
];

const values = [
  {
    title: "Student-First",
    description:
      "Every decision starts with the question: how does this help students?",
    icon: "◆",
  },
  {
    title: "Open by Default",
    description: "Transparency in code, process, and communication.",
    icon: "◇",
  },
  {
    title: "Local Impact",
    description: "Global platform, community-specific solutions.",
    icon: "○",
  },
];

function TeamMemberCard({
  member,
  index,
}: {
  member: TeamMember;
  index: number;
}) {
  const isOpenPosition = member.name === "Open Position";

  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden p-6 transition-all duration-500 md:p-8"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Subtle gradient background */}
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
          member.gradient ?? "from-primary/5 to-primary/10"
        }`}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Avatar */}
        <div
          className={`relative mb-6 h-20 w-20 overflow-hidden rounded-2xl border border-border/50 bg-linear-to-br transition-transform duration-500 group-hover:scale-105 ${
            member.gradient ?? "from-muted/50 to-muted/30"
          } ${isOpenPosition ? "border-dashed border-muted-foreground/30" : ""}`}
        >
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <span
              className={`flex h-full w-full items-center justify-center text-2xl font-medium tracking-tight ${
                isOpenPosition
                  ? "text-muted-foreground/50"
                  : "text-foreground/80"
              }`}
            >
              {member.initials}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <h3
            className={`text-lg font-semibold tracking-tight ${
              isOpenPosition ? "text-muted-foreground" : ""
            }`}
          >
            {member.name}
          </h3>
          <p className="text-primary text-sm font-medium">{member.role}</p>
        </div>
      </div>

      {/* Links */}
      <div className="relative z-10 mt-6 flex items-center gap-3">
        {member.links?.github && (
          <a
            href={member.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/50 text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
        )}
        {member.links?.linkedin && (
          <a
            href={member.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/50 text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        )}
        {member.links?.website && (
          <a
            href={member.links.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/50 text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
          >
            <Globe className="h-4 w-4" />
          </a>
        )}
        {member.links?.instagram && (
          <a
            href={member.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/50 text-muted-foreground transition-all hover:border-foreground hover:text-foreground"
          >
            <Instagram className="h-4 w-4" />
          </a>
        )}
        {isOpenPosition && (
          <a
            href="mailto:opencourseware.green379@passmail.net"
            className="flex items-center gap-2 rounded-full border border-dashed border-muted-foreground/30 px-4 py-2 text-muted-foreground text-sm transition-all hover:border-primary hover:text-primary"
          >
            <span>Join us</span>
            <ArrowRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <main className="divide-y">
      {/* Hero Section */}
      <section>
        <div className="sm:grid sm:grid-cols-12 sm:divide-x">
          <div />
          <div className="col-span-10 space-y-6 px-4 py-20 text-center sm:px-8 md:py-28">
            <div className="mx-auto w-fit rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              The People
            </div>
            <h1 className="font-semibold text-4xl leading-tight tracking-tighter sm:text-5xl md:text-6xl">
              Meet the team behind
              <br />
              <span className="bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                OCW Project
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
              A small but passionate group working to make educational resources
              accessible to every student, everywhere.
            </p>
          </div>
          <div className="border-r-0" />
        </div>
      </section>

      {/* Team Grid - Bento Style */}
      <section>
        <div className="sm:grid sm:grid-cols-12 sm:divide-x">
          <div />
          <div className="col-span-10">
            {/* Split team into rows of 3 */}
            {Array.from({ length: Math.ceil(team.length / 3) }).map(
              (_, rowIndex) => {
                const rowMembers = team.slice(rowIndex * 3, rowIndex * 3 + 3);
                return (
                  <div key={rowIndex}>
                    {rowIndex > 0 && <div className="border-t" />}
                    <div className="grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
                      {rowMembers.map((member, index) => (
                        <TeamMemberCard
                          key={member.name + member.role}
                          member={member}
                          index={rowIndex * 3 + index}
                        />
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </div>
          <div className="border-r-0" />
        </div>
      </section>

      {/* Values Section */}
      <section>
        <div className="sm:grid sm:grid-cols-12 sm:divide-x">
          <div />
          <div className="col-span-10 px-4 py-16 sm:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-12 text-center font-semibold text-2xl tracking-tight sm:text-3xl">
                What Drives Us
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                {values.map((value, index) => (
                  <div
                    key={value.title}
                    className="group text-center"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/30 text-2xl transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/10">
                      <span className="text-primary">{value.icon}</span>
                    </div>
                    <h3 className="mb-2 font-semibold text-lg tracking-tight">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-r-0" />
        </div>
      </section>

      {/* Join Section */}
      <section>
        <div className="sm:grid sm:grid-cols-12 sm:divide-x">
          <div />
          <div className="col-span-10">
            <div className="grid divide-y md:grid-cols-2 md:divide-x md:divide-y-0">
              {/* Left: Visual */}
              <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8">
                {/* Decorative elements */}
                <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />

                {/* Grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                                    linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                    backgroundSize: "24px 24px",
                  }}
                />

                {/* Stacked cards visual */}
                <div className="relative">
                  <div className="absolute -left-4 -top-4 h-24 w-24 rotate-[-15deg] rounded-2xl border border-border bg-muted/30 backdrop-blur-sm" />
                  <div className="absolute -right-2 -top-2 h-24 w-24 rotate-[8deg] rounded-2xl border border-border bg-muted/50 backdrop-blur-sm" />
                  <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border border-primary/30 bg-background shadow-lg">
                    <span className="text-4xl font-light text-primary">+</span>
                  </div>
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex flex-col justify-center p-8 md:p-12">
                <h2 className="mb-4 font-semibold text-2xl tracking-tight sm:text-3xl">
                  Want to join us?
                </h2>
                <p className="mb-8 text-muted-foreground leading-relaxed">
                  We&apos;re always looking for passionate individuals who
                  believe in open education. Whether you&apos;re a developer,
                  designer, educator, or student — there&apos;s a place for you.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg">
                    <a href="mailto:opencourseware.green379@passmail.net">
                      Get in Touch
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" asChild size="lg">
                    <a
                      href="https://github.com/not-ani/ocw-rewrite"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      View GitHub
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="border-r-0" />
        </div>
      </section>

      {/* Quote/Mission Reminder */}
      <section>
        <div className="sm:grid sm:grid-cols-12 sm:divide-x">
          <div />
          <div className="col-span-10 px-4 py-16 text-center sm:px-8 md:py-20">
            <blockquote className="mx-auto max-w-2xl">
              <p className="font-medium text-xl italic text-muted-foreground leading-relaxed md:text-2xl">
                &ldquo;Education is not the filling of a pail, but the lighting
                of a fire.&rdquo;
              </p>
              <footer className="mt-6 text-sm text-muted-foreground/70">
                — William Butler Yeats
              </footer>
            </blockquote>
          </div>
          <div className="border-r-0" />
        </div>
      </section>
    </main>
  );
}
