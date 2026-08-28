import { useEffect, useState } from "react";
import { fetchFoods } from "../api/foods";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { Food } from "../types/meal";
import { useAuth } from "../context/AuthContext";

interface FoodSelectProps {
  value: number | "";
  onChange: (foodId: number | "") => void;
}

// Search-as-you-type food picker. A plain <select> only ever showed page 1
// of the backend's paginated food list (fixed page size), so anything past
// the first ~10 alphabetically — like "Mursik" — never appeared. This queries
// the backend's `name` filter as the person types instead.
export function FoodSelect({ value, onChange }: FoodSelectProps) {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [results, setResults] = useState<Food[]>([]);
  const [selected, setSelected] = useState<Food | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || debouncedQuery.trim().length < 2 || selected) {
      setResults([]);
      return;
    }
    fetchFoods(token, { search: debouncedQuery, pageSize: 8 })
      .then((data) => setResults(data.results))
      .catch(() => setError("Couldn't search foods"));
  }, [token, debouncedQuery, selected]);

  // Reset the picker whenever the parent clears the selection (e.g. after submit).
  useEffect(() => {
    if (value === "") {
      setSelected(null);
      setQuery("");
    }
  }, [value]);

  function handlePick(food: Food) {
    setSelected(food);
    setQuery(`${food.name}${food.brand ? ` (${food.brand})` : ""}`);
    setOpen(false);
    onChange(food.id);
  }

  function handleInputChange(text: string) {
    setQuery(text);
    setSelected(null);
    onChange("");
    setOpen(true);
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Search for a food..."
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        required
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      {open && results.length > 0 && (
        <ul
          style={{
            position: "absolute",
            zIndex: 1,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: 6,
            width: "100%",
            maxHeight: 180,
            overflowY: "auto",
            margin: 0,
            padding: "0.25rem 0",
          }}
        >
          {results.map((food) => (
            <li key={food.id}>
              <button type="button" onClick={() => handlePick(food)}>
                {food.name}
                {food.brand ? ` (${food.brand})` : ""}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
