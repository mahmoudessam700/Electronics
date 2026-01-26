import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CategoryCardProps {
  title: string;
  image?: string;
  onClick: () => void;
}

export function CategoryCard({ title, image, onClick }: CategoryCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-[#D5D9D9] bg-white h-full flex flex-col overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-4 flex-1 flex flex-col items-center">
        <h3 className="text-base font-bold mb-4 text-[#0F1111] line-clamp-2 text-center h-12 flex items-center justify-center">
          {title}
        </h3>

        <div className="aspect-square w-full overflow-hidden rounded-lg bg-[#F7F8FA] flex items-center justify-center border border-gray-50 group-hover:border-[#FFD814] transition-all">
          <ImageWithFallback
            src={image || 'https://via.placeholder.com/400?text=Category'}
            alt={title}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <p className="text-xs font-bold text-[#007185] group-hover:text-[#C7511F] mt-4 group-hover:underline transition-all">
          Shop now
        </p>
      </CardContent>
    </Card>
  );
}