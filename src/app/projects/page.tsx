import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getProjects } from "@/lib/content";

export default function ProjectsPage() {
  const projects = getProjects();

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

        <h1 className="text-3xl font-medium text-foreground mb-8">Projects</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.slug}
              className="bg-background-secondary border border-foreground/10 rounded-lg overflow-hidden hover:border-accent/50 transition-all duration-200 hover:shadow-lg group"
            >
              {project.thumbnail && (
                <div className="relative h-48">
                  <Image
                    src={project.thumbnail}
                    alt={project.name}
                    fill
                    sizes="(min-width: 1024px) 300px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200"></div>
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-medium text-foreground line-clamp-2">
                    {project.name}
                  </h2>
                  {!project.draft && (
                    <Link
                      href={`/projects/${project.slug}`}
                      aria-label={`Open ${project.name}`}
                      className="text-accent hover:opacity-80 flex items-center gap-1 ml-2 flex-shrink-0"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  )}
                </div>
                {project.summary && (
                  <p className="text-foreground-secondary mb-4 text-sm line-clamp-3">
                    {project.summary}
                  </p>
                )}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="bg-foreground/10 text-foreground-secondary px-2 py-1 rounded-full text-xs">
                        +{project.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
