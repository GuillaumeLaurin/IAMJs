import { useTranslations } from "next-intl";

export interface Collaborator {
  src: string;
  alt: string;
}

export interface FeaturedDocumentCardProps {
  tag?: string;
  title: string;
  lastEditedBy: string;
  lastEditedAt: string;
  imageSrc: string;
  imageAlt: string;
  collaborators: Collaborator[];
  /** Number of additional collaborators beyond the displayed avatars */
  extraCollaboratorsCount?: number;
}

/**
 * FeaturedDocumentCard
 */
export default function FeaturedDocumentCard({
  tag = 'Priority Project',
  title,
  lastEditedBy,
  lastEditedAt,
  imageSrc,
  imageAlt,
  collaborators,
  extraCollaboratorsCount,
}: FeaturedDocumentCardProps) {
  const t = useTranslations('dashboard');

  return (
    <div className="col-span-8 bg-surface-container-lowest rounded-[2rem] p-10 shadow-sm hover:shadow-[0_12px_32px_rgba(25,28,30,0.06)] transition-all group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest rounded-full">
            {tag}
          </span>
          <h3 className="text-2xl font-bold mt-4 text-slate-800">
            {title}
          </h3>
          <p>
            {t('edited')} {lastEditedAt} {t('by')} {lastEditedBy}
          </p>
        </div>
        <button className="text-slate-300 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">
            more_vert
          </span>
        </button>
      </div>
      <div className="aspect-[21/9] w-full bg-slate-100 rounded-2xl overflow-hidden relative">
        <img 
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6">
          <CollaboratorStack collaborators={collaborators} extra={extraCollaboratorsCount} />
        </div>
      </div>
    </div>
  );
}

function CollaboratorStack({
  collaborators,
  extra
}: {
  collaborators: Collaborator[];
  extra?: number;
}) {
  return (
    <div className="flex -space-x-2">
      {collaborators.map((c, i) => (
        <img
          key={i}
          src={c.src}
          alt={c.alt}
          className="w-8 h-8 rounded-full border-2 border-white"
        />
      ))}
      {extra && extra > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 text-[10px] font-bold flex items-center justify-center text-white">
          +{extra}
        </div>
      )}
    </div>
  );
}