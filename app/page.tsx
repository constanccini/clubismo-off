import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { articles, Article } from "@/lib/articles";
import { Masthead, Footer, ArticleMeta, CategoryLabel, StoryImage } from "@/components/editorial";

function SideStory({ article, image = false }: { article: Article; image?: boolean }) {
  return <article className="side-story">
    {image && <Link href={`/materia/${article.slug}`} tabIndex={-1} aria-hidden="true"><StoryImage article={article} /></Link>}
    <CategoryLabel article={article} />
    <h2><Link href={`/materia/${article.slug}`}>{article.title}</Link></h2>
    <p>{article.excerpt}</p><ArticleMeta article={article} />
  </article>;
}
export default function Home() {
  const lead = articles[0];
  return <><Masthead active="inicio" /><main id="conteudo" className="page-shell">
    <div className="section-line"><h1>Em campo</h1><span>Futebol além do placar <ArrowUpRight size={16} /></span></div>
    {lead ? <section className={`front-page${articles.length === 1 ? " single-story" : ""}`} aria-label="Matérias em destaque">
      <article className="lead-story">
        {lead.image && <Link href={`/materia/${lead.slug}`} className="lead-image-link" tabIndex={-1} aria-hidden="true"><StoryImage article={lead} priority /><span className="image-stamp">A PAUTA DA VEZ</span></Link>}
        <CategoryLabel article={lead} /><h2><Link href={`/materia/${lead.slug}`}>{lead.title}</Link></h2>
        <p className="lead-excerpt">{lead.excerpt}</p>
        <div className="lead-bottom"><ArticleMeta article={lead} /><Link className="text-link" href={`/materia/${lead.slug}`}>Leia a matéria <ArrowUpRight size={18} /></Link></div>
      </article>
      {articles.length > 1 && <div className="side-stories">{articles.slice(1, 3).map((article, index) => <SideStory key={article.slug} article={article} image={index === 0} />)}</div>}
    </section> : <section className="category-empty"><h2>Novas matérias estão a caminho.</h2><p>Em breve, mais opinião, análise e resenha por aqui.</p></section>}
    {articles.length > 3 && <section className="more-stories" aria-labelledby="more-heading">
      <div className="section-line"><h2 id="more-heading">A conversa continua</h2><span>Mais para ler</span></div>
      <div className="story-grid">{articles.slice(3).map((article, index) => <article className="text-story" key={article.slug}>
        <div className="story-index">0{index + 1}<ArrowUpRight size={22} /></div><CategoryLabel article={article} />
        <h3><Link href={`/materia/${article.slug}`}>{article.title}</Link></h3><p>{article.excerpt}</p><ArticleMeta article={article} />
      </article>)}</div>
    </section>}
    <aside className="editorial-note"><div className="off-mark" aria-hidden="true">OFF.</div><div><span className="eyebrow">NOSSA LINHA EDITORIAL</span><h2>Seu time tem a sua torcida.<br />O argumento tem que se sustentar sozinho.</h2></div><Link href="/categoria/opiniao" className="note-link">Entre na conversa <ArrowRight size={20} /></Link></aside>
  </main><Footer /></>;
}
