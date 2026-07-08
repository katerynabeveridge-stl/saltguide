type Props = {
  imageUrl?: string;
  imageAlt?: string;
  fallbackColor: string;
  fallbackIcon: string;
  className?: string;
};

export default function ListingThumb({
  imageUrl,
  imageAlt,
  fallbackColor,
  fallbackIcon,
  className = "sg-thumb",
}: Props) {
  if (imageUrl) {
    return (
      <div className={`${className} has-img`}>
        <img src={imageUrl} alt={imageAlt ?? ""} loading="lazy" decoding="async" />
      </div>
    );
  }

  return (
    <div
      className={className}
      aria-hidden
      style={{ background: fallbackColor }}
    >
      {fallbackIcon}
    </div>
  );
}
