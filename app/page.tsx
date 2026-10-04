import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Masthead, Footer } from "@/components/editorial";
import { stories } from "@/lib/stories";
import { StoryFeed } from "@/components/story-feed";
import { EmCampo } from "@/components/em-campo";

export default function Home() {
  return <><Masthead active="inicio" /><main id="conteudo" className="page-shell">
    <EmCampo items={stories} />
    <section className="latest-section" aria-labelledby="latest-heading"><div className="section-line"><h2 id="latest-heading">Últimas</h2><Link className="text-link" href="/ultimas">Todas as publicações <ArrowUpRight size={16} /></Link></div><StoryFeed items={stories.slice(0, 6)} /></section>
    <aside className="editorial-note"><div className="off-mark" aria-hidden="true">OFF.</div><div><span className="eyebrow">NOSSA LINHA EDITORIAL</span><h2>Seu time tem a sua torcida.<br />O argumento tem que se sustentar sozinho.</h2></div><Link href="/categoria/opiniao" className="note-link">Entre na conversa <ArrowRight size={20} /></Link></aside>
  </main><Footer /></>;
}
