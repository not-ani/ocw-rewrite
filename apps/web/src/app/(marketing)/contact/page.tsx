"use client";
import { useSiteContext } from "@/lib/multi-tenant/context";
import Image from "next/image";

export default function Page() {
  const { siteConfig } = useSiteContext();

  const people = siteConfig?.personsContact;
  const club = siteConfig?.club;


  return (
    <div>
      <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-center font-bold text-3xl text-foreground tracking-tight">
            Contact Us
          </h1>
          <div className="space-y-6 text-foreground/90">
            <p className="leading-relaxed">
              If you have any questions or would like to get in touch with us,
              please feel free to contact our team members below or the
              organization maintaining this site.
            </p>
          </div>

          <div className="mt-16 border-gray-200 border-t pt-8 text-center">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              Maintained By
            </h2>
            <p className="mx-auto max-w-2xl text-foreground/90">
              This OpenCourseWare site is proudly maintained by {siteConfig?.schoolName}{" "}
              {club?.name}. For general inquiries about the site&apos;s
              maintenance or the organization, please contact:
            </p>
            <a
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 hover:underline"
              href={`mailto:${club?.email}`}
            >
              {club?.email}
            </a>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex flex-col items-center text-center">
              {people?.map((person) => (
                <div key={person.name}>
                  <Image
                    alt={person.name}
                    className="mb-4 h-20 w-20 rounded-full object-cover"
                    height={80}
                    src="https://ugakd4mkxv.ufs.sh/f/QRXW6mPDvNgcf1bAHpXv5c4nkOatgwsmYj96KRpli3hUEdx1"
                    width={80}
                  />
                  <h2 className="font-semibold text-foreground text-xl">
                    {person.name}
                  </h2>
                  <p className="text-foreground/90">{person.description}</p>
                  <a
                    className="mt-4 text-blue-600 hover:text-blue-800 hover:underline"
                    href={`mailto:${person.email}`}
                  >
                    {person.email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
