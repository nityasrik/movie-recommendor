import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchBar({ setMovies, setLoading }) {
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: query }),
      });
      const data = await res.json();
      setMovies(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 max-w-3xl w-full mx-auto">
      <Input
        className="flex-1"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a movie..."
      />
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
}
