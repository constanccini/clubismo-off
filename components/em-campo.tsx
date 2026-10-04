"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Story, WeeklyReadership } from "@/lib/story-catalog";
import { rankStories, validReadership } from "@/lib/story-catalog";
import { readershipApiUrl } from "@/lib/readership-config";
import { StoryCard, StoryCategory, StoryCover, StoryMeta } from "@/components/story-card";

export function EmCampo({ items }: { items: Story[] }) {
  const [readership, setReadership] = useState<WeeklyReadership | null>(null);
  const [selected, setSelected] = useState(0);
  const interacted = useRef(false);
  const [carouselRef, carousel] = useEmblaCarousel({ loop: false, align: "start" });
  const ordered = useMemo(() => rankStories(items, readership), [items, readership]);
  const slides = ordered.slice(0, 6);
  const hasReadership = readership && items.some(item => (readership.views[item.id] || 0) > 0);

  useEffect(() => {
    if (!readershipApiUrl) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch(`${readershipApiUrl}/v1/ranking`, { signal: controller.signal, credentials: "omit" })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (!interacted.current) setReadership(validReadership(data)); })
      .catch(() => { /* Preserve the date-ordered cover if metrics are unavailable. */ })
      .finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  useEffect(() => {
    if (!carousel) return;
    const update = () => setSelected(carousel.selectedScrollSnap());
    const touched = () => { interacted.current = true; };
    carousel.on("select", update).on("reInit", update).on("pointerDown", touched);
    update();
    return () => { carousel.off("select", update).off("reInit", update).off("pointerDown", touched); };
  }, [carousel]);

  function goTo(index: number) { interacted.current = true; carousel?.scrollTo(index); }

  return <section aria-labelledby="em-campo-heading" className="em-campo">
    <div className="section-line"><h1 id="em-campo-heading">Em campo</h1><span>{hasReadership ? "Mais lidas nos últimos 7 dias" : "Publicações recentes"}</span></div>
    {slides.length ? <>
      <div className="campo-carousel" role="region" aria-roledescription="carrossel" aria-label="Destaques de Em campo">
        <div className="campo-viewport" ref={carouselRef}><div className="campo-track">
          {slides.map((story, index) => <article key={story.id} className={`campo-slide${story.image ? "" : " campo-text-only"}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${slides.length}`} inert={index !== selected ? true : undefined}>
            {story.image && <figure className="campo-photo"><Link href={story.href} tabIndex={-1} aria-hidden="true"><StoryCover story={story} eager={index === 0} /></Link>
              {story.imageCredit && <figcaption>{story.imageSource ? <a href={story.imageSource} target="_blank" rel="noreferrer">Foto: {story.imageCredit}</a> : `Foto: ${story.imageCredit}`}</figcaption>}
            </figure>}
            <div className="campo-copy"><StoryCategory story={story} /><h2><Link href={story.href}>{story.title}</Link></h2><p className="lead-excerpt">{story.excerpt}</p>
              <StoryMeta story={story} /><Link className="text-link campo-read" href={story.href}>Leia a matéria</Link>
            </div>
          </article>)}
        </div></div>
        {slides.length > 1 && <div className="campo-controls">
          <div className="campo-counter" aria-live="polite" aria-atomic="true">{String(selected + 1).padStart(2, "0")} <span>/ {String(slides.length).padStart(2, "0")}</span></div>
          <div className="campo-dots" aria-label="Escolher destaque">{slides.map((story, index) => <button key={story.id} type="button" aria-label={`Ver destaque ${index + 1}: ${story.title}`} aria-current={index === selected ? "true" : undefined} onClick={() => goTo(index)} />)}</div>
          <div className="campo-arrows"><button type="button" aria-label="Destaque anterior" disabled={selected === 0} onClick={() => goTo(selected - 1)}><ChevronLeft size={22} /></button><button type="button" aria-label="Próximo destaque" disabled={selected === slides.length - 1} onClick={() => goTo(selected + 1)}><ChevronRight size={22} /></button></div>
        </div>}
      </div>
      {ordered.length > slides.length && <div className="cover-grid">{ordered.slice(slides.length).map(story => <StoryCard story={story} key={story.id} />)}</div>}
    </> : <div className="category-empty"><h2>Novas matérias estão a caminho.</h2><p>As publicações do Clubismo Off aparecerão aqui.</p></div>}
  </section>;
}
