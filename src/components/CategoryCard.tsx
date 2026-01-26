import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SubCategory {
  id: string;
  name: string;
  image: string;
}

interface CategoryCardProps {
  title: string;
  image?: string;
  link: string;
  onClick: () => void;
  children?: SubCategory[];
  onSubCategoryClick?: (sub: SubCategory) => void;
}

export function CategoryCard({ title, image, onClick, children, onSubCategoryClick }: CategoryCardProps) {
  const isMultiItem = children && children.length > 0;

  return (
    <Card
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-[#D5D9D9] bg-white h-full flex flex-col"
      onClick={!isMultiItem ? onClick : undefined}
    >
      <CardContent className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold mb-4 text-[#0F1111] line-clamp-1">{title}</h3>

        {isMultiItem ? (
          <div className="grid grid-cols-2 gap-4 flex-1">
            {children.slice(0, 4).map((sub) => (
              <div
                key={sub.id}
                className="flex flex-col gap-2 group/item"
                onClick={(e) => {
                  e.stopPropagation();
                  onSubCategoryClick?.(sub);
                }}
              >
                <div className="aspect-square overflow-hidden rounded bg-[#F7F8FA] flex items-center justify-center border border-gray-100 group-hover/item:border-[#FFD814] transition-all">
                  <ImageWithFallback
                    src={sub.image || 'https://via.placeholder.com/150?text=Sub'}
                    alt={sub.name}
                    className="w-full h-full object-contain p-2 group-hover/item:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-xs font-semibold text-[#565959] group-hover/item:text-[#007185] line-clamp-1">
                  {sub.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="aspect-square overflow-hidden rounded-md bg-white flex-1 flex items-center justify-center">
            <ImageWithFallback
              src={image || 'https://via.placeholder.com/400?text=Category'}
              alt={title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <button
          className="text-sm font-bold text-[#007185] hover:text-[#C7511F] mt-4 text-left group-hover:underline transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {isMultiItem ? 'See more' : 'Shop now'}
        </button>
      </CardContent>
    </Card>
  );
}