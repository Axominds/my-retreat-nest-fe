import { SafeHtml } from "@/components/ui/safe-html";
import { isHtml, plainTextToHtml } from "@/lib/rich-text";

interface StoryProps {
  name: string;
  story: string | null;
  /** Pre-split fallback for rows whose story hasn't been backfilled yet. */
  description?: string | null;
}

export function Story({ name, story, description }: StoryProps) {
  const source = story ?? description;
  if (!source) return null;
  // Legacy plain-text stories are converted so paragraph breaks survive.
  const html = isHtml(source) ? source : plainTextToHtml(source);
  return (
    <section id="story" className="scroll-mt-24">
      <div className="mx-auto max-w-2xl px-5 py-20 md:py-28">
        <p className="ts-overline text-center text-[#b45309]">Our story</p>
        <h2 className="ts-display mt-4 text-center text-3xl font-medium leading-tight md:text-[2.75rem] md:leading-[1.1]">
          Welcome to {name}
        </h2>
        <div className="mx-auto mt-6 h-px w-16 bg-[#b45309]/60" />
        <SafeHtml
          html={html}
          className="ts-richtext mt-10 text-[1.05rem] leading-[1.85] text-[#44403c]"
        />
      </div>
    </section>
  );
}
