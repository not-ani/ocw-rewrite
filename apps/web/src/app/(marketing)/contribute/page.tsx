import {
  Clock,
  Code,
  FileEdit,
  Github,
  HelpCircle,
  Paintbrush,
} from "lucide-react";
import { Suspense } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCode } from "@/components/ui/kibo-ui/qr-code/server";

const forms = [
  {
    id: "write",
    title: "Write for OCW",
    description:
      "Share your knowledge and expertise by contributing written content to our open courseware platform.",
    url: "https://forms.gle/ALUL2GEsCRv7eifp9",
    icon: <FileEdit className="h-8 w-8 text-primary" />,
  },
  {
    id: "design",
    title: "Design for OCW",
    description:
      "Help improve the visual experience of our platform with your design skills and creative ideas.",
    url: "https://forms.gle/iFUVRvHtKehxVZah7",
    icon: <Paintbrush className="h-8 w-8 text-primary" />,
  },
  {
    id: "develop",
    title: "Develop the Platform",
    description:
      "Contribute to the technical development of our platform with your coding and development expertise.",
    url: "https://forms.gle/g4PBXz5LE3GBYYhT6",
    icon: <Code className="h-8 w-8 text-primary" />,
  },
];

const meetingTimes = [
  {
    id: "wednesday",
    day: "Wednesday",
    time: "After School",
    hours: "3:30 PM - 4:15 PM",
    icon: <Clock className="h-8 w-8 text-primary" />,
  },
  {
    id: "thursday",
    day: "Thursday",
    time: "Before School",
    hours: "7:50 AM - 8:10 AM",
    icon: <Clock className="h-8 w-8 text-primary" />,
  },
];

const faqs = [
  {
    question: "How long will it take to hear back?",
    answer: "We look over the forms every Sunday.",
  },
  {
    question: "Does what I do count as community service hours?",
    answer: "Yes.",
  },
  {
    question:
      "What if I want to contribute to a course that already has content on the website?",
    answer:
      "That's fine, we probably have something for you to do so include it when you fill the form out.",
  },
];

export default function RouteComponent() {
  return (
    <div>
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl">
              Contribute to the Project
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Join our community and help us improve the open courseware
              platform. There are several ways you can contribute.
            </p>
          </div>

          <section className="py-8">
            <h2 className="mb-6 font-bold text-2xl">Contribution Forms</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {forms.map((form) => (
                <Card className="flex h-full flex-col" key={form.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {form.icon}
                      <CardTitle>{form.title}</CardTitle>
                    </div>
                    <CardDescription>{form.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="grow">
                    <div className="flex justify-center">
                      <Suspense fallback={<Skeleton className="h-12 w-12" />}>
                        <QRCode

                          foreground="#111"
                          background="#eee"
                          className="size-48 rounded border bg-white p-4 shadow-xs"
                          data={form.url} />
                      </Suspense>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <a
                        href={form.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Open Form
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          <section className="py-8">
            <h2 className="mb-6 font-bold text-2xl">Meeting Times</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {meetingTimes.map((meeting) => (
                <Card className="flex h-full flex-col" key={meeting.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {meeting.icon}
                      <CardTitle>{meeting.day}</CardTitle>
                    </div>
                    <CardDescription>{meeting.time}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-full items-center justify-center">
                      <p className="text-center font-semibold text-xl">
                        {meeting.hours}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="py-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Github className="h-8 w-8 text-primary" />
                  <CardTitle>GitHub Repository</CardTitle>
                </div>
                <CardDescription>
                  Contribute directly to our codebase by submitting pull
                  requests, reporting issues, or reviewing code.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Our project is open source and we welcome contributions from
                  developers of all skill levels. Whether you&apos;re fixing a
                  bug, adding a feature, or improving documentation, your help
                  is valuable.
                </p>
                <p className="mb-4">
                  Before contributing, please read our contribution guidelines
                  to understand our workflow and coding standards.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant="outline">
                  <a
                    href="https://github.com/CCHS-Computer-Science-Honors-Society/ocw.git"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Github className="mr-2 h-4 w-4" /> Visit GitHub Repository
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </section>

          <section className="py-8">
            <h2 className="mb-6 font-bold text-2xl">
              Frequently Asked Questions
            </h2>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-8 w-8 text-primary" />
                  <CardTitle>FAQ</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion className="w-full" collapsible type="single">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>

          <section className="py-8">
            <h2 className="mb-6 font-bold text-2xl">Why Contribute?</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Make an Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Your contributions help make education more accessible to
                    people around the world. By sharing your knowledge and
                    skills, you&apos;re helping to create a valuable resource
                    for learners everywhere.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Join Our Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Become part of a passionate community of educators,
                    designers, and developers working together to improve open
                    education. Connect with like-minded individuals and expand
                    your professional network.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
