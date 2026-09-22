import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Article, categories } from "@/lib/articles";
import { assetPath, brand } from "@/lib/site";
import { settings } from "@/lib/settings";
function BrandLogo({ footer = false }: { footer?: boolean }) {
  return <Link href="/" aria-label="Clubismo Off — início" className={`brand-logo-link${footer ? " brand-logo-footer" : ""}`}>
    <span className="brand-logo-frame"><img src={assetPath(brand.logo)} alt="Clubismo Off" width={1536} height={1536} className="brand-logo" loading={footer ? "lazy" : "eager"} /></span>
  </Link>;
}
export function Masthead({ active = "" }: { active?: string }) {
  return <header className="site-header"><a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
    <div className="masthead-top"><span>FUTEBOL BRASILEIRO</span><span>INDEPENDENTE POR PRINCÍPIO.</span></div>
    <div className="masthead page-shell"><BrandLogo /><nav className="main-nav" aria-label="Editorias"><Link href="/" aria-current={active === "inicio" ? "page" : undefined}>Início</Link>{Object.entries(categories).map(([key, value]) => <Link key={key} href={`/categoria/${key}`} aria-current={active === key ? "page" : undefined}>{value.label}</Link>)}<span className="nav-signature">A paixão fica. O clubismo sai. <ArrowUpRight size={15} /></span></nav></div>
    {settings.showDemoNotice && <div className="demo-notice"><span>PRÉ-ESTREIA</span> Você está lendo uma edição de demonstração, com textos ilustrativos.</div>}
  </header>;
}
export function CategoryLabel({ article }: { article: Article }) { return <div className="category-label"><Link href={`/categoria/${article.category}`}>{categories[article.category].label}</Link><span>{article.topic}</span></div>; }
export function ArticleMeta({ article }: { article: Article }) { return <div className="article-meta"><span>{article.demo ? "Texto de demonstração" : article.author || "Redação Clubismo Off"}</span>{!article.demo && article.date && <time dateTime={article.date}>{article.date.split("-").reverse().join("/")}</time>}<span className="read-time"><Clock3 size={13} /> {article.minutes} min de leitura</span></div>; }
export function StoryImage({ article, priority = false }: { article: Article; priority?: boolean }) { return article.image ? <img className="story-image" src={assetPath(article.image)} alt={article.imageAlt || ""} width={1200} height={760} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} /> : null; }
export function Footer() { return <footer className="site-footer"><div className="page-shell footer-inner"><BrandLogo footer /><p>Futebol brasileiro. Opinião, análise e uma boa resenha.</p><span className="footer-detail">© {new Date().getFullYear()} Clubismo Off · <Link href="/admin">Painel</Link></span></div><div className="page-shell photo-credits">Fotografias de arquivo: <a href="https://commons.wikimedia.org/wiki/File:Maracana_a_Noite.jpg" target="_blank" rel="noreferrer">Alexandre Cabus</a> (<a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>; redimensionada, enquadramento adaptável) e <a href="https://unsplash.com/photos/white-red-and-blue-soccer-ball-on-green-grass-Xo5MkDpEohw" target="_blank" rel="noreferrer">Marcel Strauß / Unsplash</a>.</div></footer>; }
