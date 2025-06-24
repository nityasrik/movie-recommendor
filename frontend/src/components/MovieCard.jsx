import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const MovieCard = ({ poster, title, onAddToWatchlist }) => {
  return (
    <div className="flex-shrink-0 w-52 group scroll-snap-align-start">
      <div className="relative overflow-hidden rounded-lg shadow-lg transform transition-transform duration-300 group-hover:scale-105">
        <img
          src={poster}
          alt={title}
          className="w-full h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <h3 className="text-lg font-bold text-white truncate">{title}</h3>
          <Button
            onClick={onAddToWatchlist}
            className="mt-2 w-full bg-white/90 text-black font-semibold text-sm hover:bg-white"
          >
            Add to List
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
