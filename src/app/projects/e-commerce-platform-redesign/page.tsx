"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Users, TrendingUp } from "lucide-react";

export default function EcommercePlatformRedesign() {
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
            E-commerce Platform Redesign
          </h1>
          <p className="text-lg text-foreground-secondary">
            Complete redesign of checkout flow resulting in 25% increase in
            conversion rate
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <TrendingUp className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Impact</h3>
            <p className="text-foreground-secondary">
              25% increase in conversion rate
            </p>
          </div>
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Calendar className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Duration</h3>
            <p className="text-foreground-secondary">3 months</p>
          </div>
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Users className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Team</h3>
            <p className="text-foreground-secondary">
              2 Designers, 3 Developers
            </p>
          </div>
        </div>

        <div className="mb-8">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
            alt="E-commerce checkout flow wireframes"
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80"
              alt="Before and after checkout comparison"
              className="w-full h-48 object-cover rounded-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80"
              alt="Mobile checkout interface"
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
              The existing checkout flow had a high abandonment rate of 68%,
              significantly impacting revenue. Users were dropping off at
              various stages, particularly during payment information entry and
              shipping selection. The interface was cluttered, confusing, and
              didn't instill confidence in users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Solution
            </h2>
            <div className="space-y-4">
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Simplified Flow
                </h3>
                <p className="text-foreground-secondary">
                  Reduced checkout from 5 steps to 3, combining related
                  information and removing unnecessary fields.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Trust Indicators
                </h3>
                <p className="text-foreground-secondary">
                  Added security badges, customer reviews, and clear return
                  policy information to build confidence.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Mobile Optimization
                </h3>
                <p className="text-foreground-secondary">
                  Redesigned for mobile-first experience with larger touch
                  targets and simplified forms.
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
                "User Testing",
                "A/B Testing",
                "Hotjar",
                "Google Analytics",
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
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Conversion Rate
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">+25%</p>
                <p className="text-foreground-secondary text-sm">
                  From 32% to 40%
                </p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Cart Abandonment
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">-15%</p>
                <p className="text-foreground-secondary text-sm">
                  From 68% to 53%
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
