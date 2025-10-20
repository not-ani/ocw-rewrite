"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSite } from "@/lib/multi-tenant/context";
import Image from "next/image";

export default function Page() {
  const { siteConfig } = useSite();

  const people = siteConfig?.personsContact;
  const club = siteConfig?.club;

  return (
    <div>
      <div className="bg-background min-h-screen px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-foreground mb-8 text-center text-3xl font-bold tracking-tight">
            Contact Us
          </h1>

          <div className="text-foreground/90 space-y-6 text-center">
            <p className="leading-relaxed">
              If you have any questions or would like to get in touch with us,
              please feel free to contact our team members below or the
              organization maintaining this site.
            </p>
          </div>

          <div className="mt-16 border-t border-gray-200 pt-8 text-center">
            <h2 className="text-foreground mb-4 text-2xl font-semibold">
              Maintained By
            </h2>
            <p className="text-foreground/90 mx-auto max-w-2xl">
              This OpenCourseWare site is proudly maintained by{" "}
              {siteConfig?.schoolName} {club?.name}. For general inquiries about
              the site&apos;s maintenance or the organization, please contact:
            </p>
            <a
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 hover:underline"
              href={`mailto:${club?.email}`}
            >
              {club?.email}
            </a>
          </div>

          {/* Centered People Section */}
          <div className="mt-16 border-t border-gray-200 pt-8">
            <h2 className="text-foreground mb-8 text-center text-2xl font-semibold">
              Our Team
            </h2>
            <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2">
              {people?.map((person) => (
                <Card
                  key={person.name}
                  className="flex h-full w-80 flex-col items-center justify-between p-4 text-center"
                >
                  <CardHeader className="flex flex-col items-center justify-center">
                    <Image
                      alt={person.name}
                      className="mb-4 h-20 w-20 rounded-full object-cover"
                      height={80}
                      src="https://ugakd4mkxv.ufs.sh/f/QRXW6mPDvNgcf1bAHpXv5c4nkOatgwsmYj96KRpli3hUEdx1"
                      width={80}
                    />
                    <h2 className="text-foreground text-xl font-semibold">
                      {person.name}
                    </h2>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col items-center justify-between">
                    <p className="text-foreground/90 flex-grow">
                      {person.description}
                    </p>
                    <a
                      className="mt-4 text-blue-600 hover:text-blue-800 hover:underline"
                      href={`mailto:${person.email}`}
                    >
                      {person.email}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
