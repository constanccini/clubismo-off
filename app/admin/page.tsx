import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Masthead, Footer } from "@/components/editorial";

export const metadata: Metadata = { title: "Painel de matérias", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <><Masthead /><main className="page-shell admin-entry" id="conteudo">
    <span className="eyebrow" style={{ color: "var(--brand)" }}>ÁREA DO EDITOR</span>
    <h1>A próxima matéria começa aqui.</h1>
    <p>Use o Pages CMS para escrever, editar matérias e enviar fotos para o Clubismo Off.</p>
    <a className="panel-button" href="https://app.pagescms.org">Entrar no painel <ArrowUpRight size={18} /></a>
    <ol><li>Entre com a sua conta do GitHub e selecione <strong>clubismo-off</strong>, na branch <strong>main</strong>.</li>
      <li>Abra <strong>Matérias</strong> para criar um texto ou escolher um existente.</li>
      <li>Para publicar, ligue <strong>Visível no blog</strong> e salve. Para retirar, desligue a opção e salve, ou exclua a matéria.</li></ol>
    <p className="admin-help">As alterações aparecem depois que a publicação automática termina. Você pode acompanhar em <a className="text-link" href="https://github.com/constanccini/clubismo-off/actions">Publicações no GitHub <ArrowUpRight size={14} /></a>.</p>
    <p className="admin-help">O repositório é público: textos salvos no painel podem ser lidos no GitHub mesmo quando estão fora do blog. A data da matéria é informativa; não agenda publicações.</p>
  </main><Footer /></>;
}
