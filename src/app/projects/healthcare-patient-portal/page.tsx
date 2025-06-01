"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Users, Shield } from "lucide-react";

export default function HealthcarePatientPortal() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-accent hover:opacity-80 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Healthcare Patient Portal
          </h1>
          <p className="text-lg text-foreground-secondary">
            Created accessible patient portal serving 50k+ users with focus on
            elderly accessibility
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Shield className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">
              Accessibility
            </h3>
            <p className="text-foreground-secondary">WCAG 2.1 AA compliant</p>
          </div>
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Calendar className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Duration</h3>
            <p className="text-foreground-secondary">8 months</p>
          </div>
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Users className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Users</h3>
            <p className="text-foreground-secondary">50k+ active patients</p>
          </div>
        </div>

        <div className="mb-8">
          <img
            src="https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&q=80"
            alt="Healthcare patient portal interface"
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80"
              alt="Accessible design elements"
              className="w-full h-48 object-cover rounded-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80"
              alt="Patient portal dashboard"
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Challenge
            </h2>
            <p className="text-foreground-secondary leading-relaxed">
              The healthcare system needed a patient portal that would serve
              users of all ages and abilities, with particular attention to
              elderly users who may have visual or motor impairments. The
              existing system was difficult to navigate and not accessible to
              users with disabilities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Research & Discovery
            </h2>
            <div className="space-y-4">
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Accessibility Audit
                </h3>
                <p className="text-foreground-secondary">
                  Conducted comprehensive accessibility testing with screen
                  readers and assistive technologies.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  User Testing with Elderly
                </h3>
                <p className="text-foreground-secondary">
                  Tested with 30+ elderly users to understand specific needs and
                  challenges with digital interfaces.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Healthcare Provider Interviews
                </h3>
                <p className="text-foreground-secondary">
                  Interviewed doctors and nurses to understand workflow
                  requirements and patient needs.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Large, Readable Typography
                </h3>
                <p className="text-foreground-secondary">
                  Implemented scalable fonts and high contrast ratios for
                  improved readability.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Keyboard Navigation
                </h3>
                <p className="text-foreground-secondary">
                  Full keyboard accessibility with clear focus indicators and
                  logical tab order.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Screen Reader Optimization
                </h3>
                <p className="text-foreground-secondary">
                  Semantic HTML and ARIA labels for seamless screen reader
                  experience.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Simplified Interface
                </h3>
                <p className="text-foreground-secondary">
                  Clean, uncluttered design with clear visual hierarchy and
                  intuitive navigation.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Technologies Used
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                "Adobe XD",
                "Accessibility Testing",
                "User Interviews",
                "WCAG Guidelines",
                "Screen Reader Testing",
                "Usability Testing",
              ].map((tech) => (
                <span
                  key={tech}
                  className="bg-accent/10 text-accent px-3 py-2 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Results
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  User Adoption
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">50k+</p>
                <p className="text-foreground-secondary text-sm">
                  Active patient users
                </p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Accessibility Score
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">AA</p>
                <p className="text-foreground-secondary text-sm">
                  WCAG 2.1 compliance level
                </p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  User Satisfaction
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">4.7★</p>
                <p className="text-foreground-secondary text-sm">
                  Average user rating
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
