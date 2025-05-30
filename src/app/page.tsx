export default function Home() {
  return (
    <main className="flex flex-col items-center w-full">
      <section className="flex flex-col gap-2 w-full p-8 bg-backgrounud items-center">
        <div className="text-foreground">
          Primary Text
          </div>
          <div className="text-foreground-secondary">
          Secondary Text
          </div>
          <div className="text-accent">
          Accent Text
          </div>
      </section>
      <section className="flex flex-col gap-2 w-full p-8 bg-background-secondary items-center">
        <div className="text-foreground">
          Primary Text
          </div>
          <div className="text-foreground-secondary">
          Secondary Text
          </div>
          <div className="text-accent">
          Accent Text
          </div>
      </section>
      <section className="flex flex-col gap-2 w-full p-8 bg-accent items-center">
        <div className="text-foreground">
          Primary Text
          </div>
          <div className="text-foreground/50">
          Secondary Text
          </div>
          <div className="text-foreground-inverse">
          Accent Text
          </div>
      </section>
    </main>
  );
}
