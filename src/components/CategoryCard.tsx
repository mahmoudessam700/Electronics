import { Card, CardContent } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CategoryCardProps {
  title: string;
  image: string;
  link: string;
  onClick: () => void;
}

export function CategoryCard({ title, image, onClick }: CategoryCardProps) {
  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-200 border-[#D5D9D9]"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <h3 className="text-xl mb-4">{title}</h3>
        <div className="aspect-square overflow-hidden rounded-md bg-white">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <p className="text-sm text-[#4A5568] hover:text-[#2D3748] mt-4 cursor-pointer">
          Shop now
        </p>
      </CardContent>
    </Card>
  );
}