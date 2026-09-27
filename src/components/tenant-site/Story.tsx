interface StoryProps {
  name: string;
  description: string | null;
}

export function Story({ name, description }: StoryProps) {
  if (!description) return null;
  return (
    <section id="story" className="scroll-mt-24">
      <div className="mx-auto max-w-2xl px-5 py-20 md:py-28">
        <p className="ts-overline text-center text-[#b45309]">Our story</p>
        <h2 className="ts-display mt-4 text-center text-3xl font-medium leading-tight md:text-[2.75rem] md:leading-[1.1]">
          Welcome to {name}
        </h2>
        <div className="mx-auto mt-6 h-px w-16 bg-[#b45309]/60" />
        <p className="ts-dropcap mt-10 whitespace-pre-line text-[1.05rem] leading-[1.85] text-[#44403c]">
          {description}
        </p>
      </div>
    </section>
  );
}
