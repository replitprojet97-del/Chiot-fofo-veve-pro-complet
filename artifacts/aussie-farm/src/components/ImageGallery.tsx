import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  puppyName: string;
  isPremium: boolean;
}

export default function ImageGallery({ images, puppyName, isPremium }: ImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const allImages = images.length > 0 ? images : ["/images/puppy-bleu-merle.png"];
  const mainImg = allImages[activeIdx] ?? allImages[0];

  return (
    <div className="flex flex-col gap-2 p-3 pt-4">
      <div className={`aspect-[4/3] rounded-2xl overflow-hidden ${isPremium ? "mt-8" : ""}`}>
        <img src={mainImg} alt={puppyName} className="w-full h-full object-cover" />
      </div>
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
              className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
                i === activeIdx
                  ? "border-amber-500 shadow-md scale-105"
                  : "border-transparent opacity-60 hover:opacity-90 hover:scale-[1.02]"
              }`}
            >
              <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover pointer-events-none" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
