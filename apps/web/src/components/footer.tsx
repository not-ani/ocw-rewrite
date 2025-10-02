import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function FooterSections() {
  const footerData = [
    {
      title: "About Us",
      content:
        "OpenCourseWare is dedicated to providing free, high-quality education to learners worldwide.",
    },
    {
      title: "Quick Links",
      links: [
        { text: "Home", href: "/" },
        { text: "Courses", href: "/courses" },
        { text: "About", href: "/about" },
        { text: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Connect With Us",
      links: [
        { text: "Instagram", href: "https://www.instagram.com/creekcshs/" },
      ],
    },
  ];

  return (
    <>
      {footerData.map((section, index) => (
        <div key={section.title}>
          <h5 className="mb-4 text-lg font-semibold">{section.title}</h5>
          {section.content && (
            <p className="text-muted-foreground text-sm">{section.content}</p>
          )}
          {section.links && (
            <nav className="space-y-2">
              {section.links.map((link) => (
                <Link
                  key={link.text}
                  href={link.href}
                  prefetch
                  className="text-muted-foreground hover:text-primary block text-sm"
                  {...(link.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {link.text}
                </Link>
              ))}
            </nav>
          )}
        </div>
      ))}
      <div>
        <h5 className="mb-4 text-lg font-semibold">Authentication</h5>
        <nav>
          <SignInButton />
        </nav>
      </div>
    </>
  );
}
