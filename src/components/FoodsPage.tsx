import { useState } from "react";
import { FoodForm } from "./FoodForm";
import { FoodList } from "./FoodList";

export function FoodsPage() {
  const [foodsRefreshKey, setFoodsRefreshKey] = useState(0);

  return (
    <>
      <h2>Foods</h2>
      <FoodForm onFoodCreated={() => setFoodsRefreshKey((k) => k + 1)} />
      <FoodList refreshKey={foodsRefreshKey} />
    </>
  );
}