import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Masthead, Footer } from "@/components/editorial";
import Link from "next/link";

export const metadata: Metadata = { title: "Painel de matérias", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <><Masthead /><main className="page-shell admin-entry" id="conteudo">
    <span className="eyebrow" style={{ color: "var(--brand)" }}>ÁREA DO EDITOR</span>
    <h1>A próxima matéria começa aqui.</h1>
    <p>Use o Pages CMS para escrever, editar matérias e enviar fotos para o Clubismo Off.</p>
    <a className="panel-button" href="https://app.pagescms.org">Entrar no painel <ArrowUpRight size={18} /></a>
    <p><a className="text-link" href="https://app.pagescms.org/constanccini/clubismo-off/main/collection/ultimas">Abrir fila da Redação Clubismo Off <ArrowUpRight size={18} /></a></p>
    <p><Link className="text-link" href="/admin/previa">Ver prévias das notícias <ArrowUpRight size={18} /></Link></p>
    <ol><li>Abra <strong>Fila</strong>, revise a notícia e salve suas alterações. Use a prévia para conferir como o texto ficará no blog.</li>
      <li>Clique em <strong>Publicar</strong> no topo da notícia. Ao concluir a publicação, ela sai da Fila e fica em <strong>Matérias</strong>.</li>
      <li>Em <strong>Matérias</strong>, edite e salve para atualizar o texto. Para retirar do site, desligue <strong>Visível no blog</strong> e salve, ou exclua a matéria.</li></ol>
    <p className="admin-help">As alterações aparecem depois que a publicação automática termina. Você pode acompanhar em <a className="text-link" href="https://github.com/constanccini/clubismo-off/actions">Publicações no GitHub <ArrowUpRight size={14} /></a>.</p>
    <p className="admin-help">O repositório é público: textos salvos no painel podem ser lidos no GitHub mesmo quando estão fora do blog. A data da matéria é informativa; não agenda publicações.</p>
  </main><Footer /></>;
}
