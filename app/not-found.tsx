import Link from "next/link";
import { Masthead, Footer } from "@/components/editorial";
export default function NotFound() { return <><Masthead /><main id="conteudo" className="page-shell not-found"><span className="category-label">404 · BOLA FORA</span><h1>Essa página saiu de campo.</h1><p>O endereço não existe ou a matéria foi movida.</p><Link href="/" className="text-link">← Voltar à capa</Link></main><Footer /></>; }
