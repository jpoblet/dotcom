"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Users, Plane } from "lucide-react";

export default function TravelBookingPlatform() {
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
            Travel Booking Platform
          </h1>
          <p className="text-lg text-foreground-secondary">
            Designed end-to-end booking experience resulting in 30% increase in
            completed bookings
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Plane className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Platform</h3>
            <p className="text-foreground-secondary">Web & Mobile</p>
          </div>
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Calendar className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Duration</h3>
            <p className="text-foreground-secondary">5 months</p>
          </div>
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Users className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Team</h3>
            <p className="text-foreground-secondary">
              3 Designers, 5 Developers
            </p>
          </div>
        </div>

        <div className="mb-8">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
            alt="Travel booking platform interface"
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80"
              alt="Travel search interface"
              className="w-full h-48 object-cover rounded-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80"
              alt="Booking confirmation flow"
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
              The existing travel booking platform had a high abandonment rate
              and complex user flow that prevented users from completing their
              travel bookings. Users were frustrated with the lengthy process
              and unclear pricing structure, leading to significant revenue
              loss.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Research & Discovery
            </h2>
            <div className="space-y-4">
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  User Journey Mapping
                </h3>
                <p className="text-foreground-secondary">
                  Mapped complete user journeys to identify pain points and
                  opportunities for improvement.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Conversion Funnel Analysis
                </h3>
                <p className="text-foreground-secondary">
                  Analyzed booking funnel data to understand where users were
                  dropping off in the process.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Competitive Research
                </h3>
                <p className="text-foreground-secondary">
                  Studied leading travel platforms to identify best practices
                  and innovative solutions.
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
                  Streamlined Search Flow
                </h3>
                <p className="text-foreground-secondary">
                  Simplified search interface with smart filters and instant
                  results.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Transparent Pricing
                </h3>
                <p className="text-foreground-secondary">
                  Clear pricing breakdown with no hidden fees and upfront total
                  costs.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Mobile-First Design
                </h3>
                <p className="text-foreground-secondary">
                  Optimized mobile experience with touch-friendly controls and
                  fast loading.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Quick Booking Process
                </h3>
                <p className="text-foreground-secondary">
                  Reduced booking steps from 8 to 4 with smart form
                  auto-completion.
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
                "Figma",
                "Prototyping",
                "Usability Testing",
                "A/B Testing",
                "User Research",
                "Mobile Design",
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
                  Booking Completion
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">+30%</p>
                <p className="text-foreground-secondary text-sm">
                  Increase in completed bookings
                </p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Mobile Conversion
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">+45%</p>
                <p className="text-foreground-secondary text-sm">
                  Mobile booking improvement
                </p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  User Satisfaction
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">4.5★</p>
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
