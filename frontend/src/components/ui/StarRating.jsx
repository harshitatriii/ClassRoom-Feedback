import { Star } from 'lucide-react';

export default function StarRating({ value, onChange, label }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-600 hover:text-gray-400'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
