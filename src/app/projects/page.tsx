"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import cvData from "../../data/cv.json";

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-accent hover:opacity-80 mb-8"
        >
          <ArrowLeft size={20} />
          Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">Projects</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvData.projects.map((project, index) => (
            <div
              key={index}
              className="bg-background-secondary border border-foreground/10 rounded-lg overflow-hidden hover:border-accent/50 transition-all duration-200 hover:shadow-lg group"
            >
              <div className="relative">
                <img
                  src={project.thumbnail}
                  alt={project.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200"></div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-semibold text-foreground line-clamp-2">
                    {project.name}
                  </h2>
                  <Link
                    href={`/projects/${project.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")}`}
                    className="text-accent hover:opacity-80 flex items-center gap-1 ml-2 flex-shrink-0"
                  >
                    <ExternalLink size={16} />
                  </Link>
                </div>
                <p className="text-foreground-secondary mb-4 text-sm line-clamp-3">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 3 && (
                    <span className="bg-foreground/10 text-foreground-secondary px-2 py-1 rounded-full text-xs">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
