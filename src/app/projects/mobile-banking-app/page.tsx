"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Users, Smartphone } from "lucide-react";

export default function MobileBankingApp() {
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
            Mobile Banking App
          </h1>
          <p className="text-lg text-foreground-secondary">
            Designed intuitive mobile banking experience for 100k+ users
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Smartphone className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Platform</h3>
            <p className="text-foreground-secondary">iOS & Android</p>
          </div>
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Calendar className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Duration</h3>
            <p className="text-foreground-secondary">6 months</p>
          </div>
          <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
            <Users className="text-accent mb-3" size={24} />
            <h3 className="font-semibold text-foreground mb-2">Users</h3>
            <p className="text-foreground-secondary">100k+ active users</p>
          </div>
        </div>

        <div className="mb-8">
          <img
            src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80"
            alt="Mobile banking app interface design"
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80"
              alt="Banking app user flow"
              className="w-full h-48 object-cover rounded-lg"
            />
            <img
              src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&q=80"
              alt="Mobile banking dashboard"
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
              The bank's existing mobile app had poor user ratings (2.1 stars)
              and low adoption rates. Users complained about complex navigation,
              slow performance, and difficulty completing basic banking tasks.
              The app needed a complete overhaul to meet modern user
              expectations and compete with fintech alternatives.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Research & Discovery
            </h2>
            <div className="space-y-4">
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  User Interviews
                </h3>
                <p className="text-foreground-secondary">
                  Conducted 25 in-depth interviews with existing customers to
                  understand pain points and needs.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Competitive Analysis
                </h3>
                <p className="text-foreground-secondary">
                  Analyzed 8 leading banking and fintech apps to identify best
                  practices and opportunities.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Usage Analytics
                </h3>
                <p className="text-foreground-secondary">
                  Analyzed existing app usage data to identify most common user
                  flows and drop-off points.
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
                  Quick Actions Dashboard
                </h3>
                <p className="text-foreground-secondary">
                  Personalized home screen with most-used actions accessible in
                  one tap.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Biometric Authentication
                </h3>
                <p className="text-foreground-secondary">
                  Secure and fast login using fingerprint and face recognition.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Smart Notifications
                </h3>
                <p className="text-foreground-secondary">
                  Contextual alerts for transactions, bills, and account
                  activities.
                </p>
              </div>
              <div className="bg-background-secondary border border-foreground/10 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Visual Transaction History
                </h3>
                <p className="text-foreground-secondary">
                  Easy-to-scan transaction list with merchant logos and spending
                  categories.
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
                "Sketch",
                "Principle",
                "User Research",
                "InVision",
                "Zeplin",
                "Maze",
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
                  App Store Rating
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">4.6★</p>
                <p className="text-foreground-secondary text-sm">
                  Up from 2.1★
                </p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  User Adoption
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">+180%</p>
                <p className="text-foreground-secondary text-sm">
                  Monthly active users
                </p>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-2">
                  Task Completion
                </h3>
                <p className="text-2xl font-bold text-accent mb-1">+65%</p>
                <p className="text-foreground-secondary text-sm">
                  Successful transactions
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
