import {
  Tv,
  Heart,
  TrendingUp,
  PlayCircle,
  Star,
  Film,
  Search,
} from "lucide-react";

export const Icons = {
  Tv,
  Heart,
  TrendingUp,
  PlayCircle,
  Star,
  Film,
  Search,
  User: (props) => (
    <svg {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  ),
  ChevronLeft: (props) => (
    <svg {...props}><path d="m15 18-6-6 6-6" /></svg>
  ),
  ChevronRight: (props) => (
    <svg {...props}><path d="m9 18 6-6-6-6" /></svg>
  ),
};

export default Icons;
