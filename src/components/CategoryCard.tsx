interface CategoryCardProps {
  title: string;
  image?: string;
  onClick: () => void;
}

export function CategoryCard({ title, image, onClick }: CategoryCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 20,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'box-shadow 0.2s'
      }}
    >
      {/* Title at top left */}
      <h3 style={{
        fontSize: 18,
        fontWeight: 700,
        color: '#0F1111',
        margin: '0 0 16px 0',
        lineHeight: 1.3
      }}>
        {title}
      </h3>

      {/* Square image */}
      <div style={{
        aspectRatio: '1',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 4,
        marginBottom: 16,
        backgroundColor: '#f7f7f7'
      }}>
        <img
          src={image || 'https://via.placeholder.com/300?text=Category'}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Shop now link at bottom left */}
      <span style={{
        fontSize: 13,
        fontWeight: 400,
        color: '#007185',
        marginTop: 'auto'
      }}>
        Shop now
      </span>
    </div>
  );
}