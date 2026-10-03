import type { NewsImageData } from "@/lib/news-schema";
import { assetPath } from "@/lib/site";

export function NewsImage({ item }: { item: NewsImageData }) {
  if (!item.image) return null;
  return <figure className="article-figure">
    <img className="story-image" src={assetPath(item.image)} alt={item.imageAlt} width={1200} height={760} />
    {(item.imageCaption || item.imageCredit || item.imageLicense) && <figcaption>
      {item.imageCaption}
      {item.imageCredit && <> {item.imageSource ? <a href={item.imageSource} target="_blank" rel="noreferrer">Foto: {item.imageCredit}</a> : <>Foto: {item.imageCredit}</>}</>}
      {item.imageLicense && <> · {item.imageLicenseUrl ? <a href={item.imageLicenseUrl} target="_blank" rel="noreferrer">{item.imageLicense}</a> : item.imageLicense} · Redimensionada; enquadramento adaptável.</>}
    </figcaption>}
  </figure>;
}
