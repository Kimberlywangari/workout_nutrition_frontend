import { useState, useEffect, useCallback } from "react";
import { fetchFoods } from "../api/foods";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { Pagination } from "./Pagination";
import type { Food } from "../types/meal";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 5;

interface FoodListProps {
  refreshKey: number; // bump this from the parent after a new food is created
}

export function FoodList({ refreshKey }: FoodListProps) {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const [foods, setFoods] = useState<Food[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetchFoods(token, { search: debouncedSearch, page, pageSize: PAGE_SIZE })
      .then((data) => { setFoods(data.results); setCount(data.count); })
      .catch(() => setError("Couldn't load foods"))
      .finally(() => setLoading(false));
  }, [token, debouncedSearch, page]);

  useEffect(() => { load(); }, [load, refreshKey]);
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div>
      <input
        type="text"
        placeholder="Search foods by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {loading && <p>Loading foods...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <>
          <ul>
            {foods.map((food) => (
              <li key={food.id}>
                {food.name}{food.brand ? ` (${food.brand})` : ""} — {food.calories_per_100g} kcal/100g
              </li>
            ))}
          </ul>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}