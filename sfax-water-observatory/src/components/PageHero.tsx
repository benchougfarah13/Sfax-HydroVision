import { ReactNode } from 'react';

interface PageHeroProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function PageHero({ title, description, action }: PageHeroProps) {
  return (
    <section className="rounded-[2rem] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_30%),linear-gradient(160deg,_rgba(15,23,42,0.96),_rgba(2,6,23,0.98))] p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-white md:text-6xl">{title}</h1>
            {description ? <p className="mt-4 max-w-2xl text-lg text-slate-300">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </section>
  );
}
