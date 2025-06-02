import { User, MapPin, Mail } from "lucide-react";
import cvData from "../data/cv.json";

export default function Bio() {
  return (
    <section className="w-full max-w-4xl px-6 py-12 bg-background">
      <div className="bg-background-secondary border border-foreground/10 rounded-lg p-8 shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center">
            <User size={32} className="text-foreground-inverse" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {cvData.name}
            </h1>
            <p className="text-xl text-accent font-medium">{cvData.title}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-wrap gap-6 mb-6 text-foreground-secondary">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{cvData.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} />
            <span>{cvData.email}</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-3">About</h2>
          <p className="text-foreground-secondary leading-relaxed">
            {cvData.summary}
          </p>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
