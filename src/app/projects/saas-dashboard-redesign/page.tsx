"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Users, TrendingUp } from "lucide-react";

export default function SaaSDashboardRedesign() {
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
            SaaS Dashboard Redesign
          </h1>
          <p className="text-lg text-foreground-secondary">
            Redesigned analytics dashboard improving user engagement by 40% and
            reducing support tickets
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <TrendingUp className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Impact</h3>
            <p className="text-foreground-secondary">
              40% increase in user engagement
            </p>
          </div>
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Calendar className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Duration</h3>
            <p className="text-foreground-secondary">4 months</p>
          </div>
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Users className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Team</h3>
            <p className="text-foreground-secondary">
              2 Designers, 4 Developers
            </p>
          </div>
        </div>

        <div className="mb-8">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
            alt="SaaS dashboard analytics interface"
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80"
              alt="Data visualization charts"
              className="w-full h-48 object-cover rounded-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&q=80"
              alt="Dashboard user interface"
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
              The existing analytics dashboard had poor user engagement and
              generated numerous support tickets due to confusing navigation and
              unclear data presentation. Users struggled to find key metrics and
              often abandoned tasks midway through complex workflows.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Research & Discovery
            </h2>
            <div className="space-y-4">
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  User Analytics Review
                </h3>
                <p className="text-foreground-secondary">
                  Analyzed user behavior data to identify pain points and
                  drop-off patterns in the existing dashboard.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Support Ticket Analysis
                </h3>
                <p className="text-foreground-secondary">
                  Reviewed 200+ support tickets to understand common user
                  confusion points and feature requests.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  User Interviews
                </h3>
                <p className="text-foreground-secondary">
                  Conducted 15 user interviews to understand workflow needs and
                  visualization preferences.
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
                  Improved Information Architecture
                </h3>
                <p className="text-foreground-secondary">
                  Reorganized dashboard layout with clear hierarchy and logical
                  grouping of related metrics.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Enhanced Data Visualization
                </h3>
                <p className="text-foreground-secondary">
                  Redesigned charts and graphs for better readability and
                  actionable insights.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Streamlined User Workflows
                </h3>
                <p className="text-foreground-secondary">
                  Simplified common tasks and reduced the number of steps
                  required for key actions.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Responsive Design
                </h3>
                <p className="text-foreground-secondary">
                  Optimized dashboard for all device sizes with adaptive layouts
                  and touch-friendly controls.
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
                "React",
                "Data Visualization",
                "User Research",
                "Prototyping",
                "A/B Testing",
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
                  User Engagement
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">+40%</p>
                <p className="text-foreground-secondary text-sm">
                  Increase in daily active users
                </p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Support Tickets
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">-60%</p>
                <p className="text-foreground-secondary text-sm">
                  Reduction in dashboard-related issues
                </p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Task Completion
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">+55%</p>
                <p className="text-foreground-secondary text-sm">
                  Improvement in workflow completion
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
