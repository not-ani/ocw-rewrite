import Image from "next/image";

export default function Page() {
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
              This OpenCourseWare site is proudly maintained by the Cherry Creek
              High School&apos;s Computer Science Honor Society. For general
              inquiries about the site&apos;s maintenance or the organization,
              please contact:
            </p>
            <a
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 hover:underline"
              href="mailto:cherrycreekcshs@gmail.com"
            >
              cherrycreekcshs@gmail.com
            </a>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex flex-col items-center text-center">
              <Image
                alt="Aniketh Chenjeri"
                className="mb-4 h-20 w-20 rounded-full object-cover"
                height={80}
                src="https://ugakd4mkxv.ufs.sh/f/QRXW6mPDvNgcf1bAHpXv5c4nkOatgwsmYj96KRpli3hUEdx1"
                width={80}
              />
              <h2 className="font-semibold text-foreground text-xl">
                Aniketh Chenjeri
              </h2>
              <p className="text-foreground/90">
                Aniketh serves as the Project Lead and Lead Developer. In this
                dual role, he directs the project&apos;s development and manages
                the content presented on the site.
              </p>
              <a
                className="mt-4 text-blue-600 hover:text-blue-800 hover:underline"
                href="mailto:anikethchenjeri@gmail.com"
              >
                anikethchenjeri@gmail.com
              </a>
            </div>

            <div className="flex flex-col items-center text-center">
              <Image
                alt="Jason Chen"
                className="mb-4 h-20 w-20 rounded-full object-cover"
                height={80}
                src="https://ugakd4mkxv.ufs.sh/f/QRXW6mPDvNgcBOk5v5CzYZbKVLiWvQ9r1lpMUyjw58osCXnO"
                width={80}
              />
              <h2 className="font-semibold text-gray-900 text-xl">
                Jason Chen
              </h2>
              <p className="text-gray-600">
                Jason is the Co-Founder of the original OpenCourseWare platform
                and is helping develop the current site.
              </p>
              <a
                className="mt-4 text-blue-600 hover:text-blue-800 hover:underline"
                href="mailto:jchen3200@gatech.edu"
              >
                jchen3200@gatech.edu
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
