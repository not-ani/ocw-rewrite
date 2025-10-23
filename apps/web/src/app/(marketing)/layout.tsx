import FooterSections from "@/components/footer";
import { Header } from "@/components/header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenCourseWare - Free Educational Resources",
  description: "Access free, high-quality educational resources and courses. OpenCourseWare provides students with comprehensive learning materials and tools.",
  keywords: ["OpenCourseWare", "education", "free courses", "learning resources", "educational content"],
  openGraph: {
    title: "OpenCourseWare - Free Educational Resources",
    description: "Access free, high-quality educational resources and courses.",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      {children}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <FooterSections />
          </div>
        </div>
      </footer>
    </div>
  );
}
