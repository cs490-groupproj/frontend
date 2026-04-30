import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import {
  Loader2,
  Search,
  Utensils,
  CheckCircle2,
  Calendar,
  History,
  TrendingUp,
  Clock,
} from "lucide-react";
import useGetFromAPI from "../../hooks/useGetFromAPI";
import usePostToAPI from "../../hooks/usePostToAPI";

const MEAL_NAMES = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const mealTypeToName = { 1: "Breakfast", 2: "Lunch", 3: "Dinner", 4: "Snacks" };
const mealNameToType = { Breakfast: 1, Lunch: 2, Dinner: 3, Snacks: 4 };

const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString.endsWith("Z") ? isoString : isoString + "Z");
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const emptyMealPlanIds = () => ({
  Breakfast: null,
  Lunch: null,
  Dinner: null,
  Snacks: null,
});
const emptyPersistedFoodsByMeal = () => ({
  Breakfast: [],
  Lunch: [],
  Dinner: [],
  Snacks: [],
});

/**
 * Detailed Weekly History Component
 */
const WeeklyHistory = ({ userId, timezone }) => {
  const { data: historyData, loading } = useGetFromAPI(
    userId
      ? `/nutrition/week?user_id=${userId}&timezone=${encodeURIComponent(timezone)}`
      : null
  );

  if (loading)
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="text-primary animate-spin" />
      </div>
    );

  const groupedByDate = (historyData?.meal_plans || []).reduce((acc, plan) => {
    // Also use the fix here if needed, but grouping relies on the date part
    const date = new Date(plan.meal_logged_at).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(plan);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <div className="space-y-8">
      {sortedDates.length === 0 ? (
        <div
          className="text-muted-foreground flex flex-col items-center
            justify-center py-12 text-center"
        >
          <History size={48} className="mb-4 opacity-20" />
          <p>No meal logs found for the past week.</p>
        </div>
      ) : (
        sortedDates.map((date) => (
          <div key={date} className="space-y-4">
            <h3
              className="text-muted-foreground border-b pb-1 text-sm font-bold
                tracking-wider uppercase"
            >
              {date}
            </h3>
            <div className="grid gap-4">
              {groupedByDate[date].map((plan) => {
                const mealTotal = plan.meal_plan_foods.reduce(
                  (sum, f) =>
                    sum +
                    parseFloat(f.calories) * (parseFloat(f.portion_size) / 100),
                  0
                );

                return (
                  <Card
                    key={plan.meal_plan_id}
                    className="bg-muted/20 overflow-hidden border shadow-none"
                  >
                    <div
                      className="bg-muted/30 flex items-center justify-between
                        border-b px-4 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Utensils size={14} className="text-primary" />
                        <span className="font-semibold">
                          {mealTypeToName[plan.meal_type]}
                        </span>
                      </div>
                      <div
                        className="text-muted-foreground flex items-center gap-1
                          text-xs"
                      >
                        <Clock size={12} />
                        {/* Corrected Time Display */}
                        {formatTime(plan.meal_logged_at)}
                      </div>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-2">
                        {plan.meal_plan_foods.map((food, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              <span className="text-foreground font-medium">
                                {food.food_name}
                              </span>
                              {` • ${food.portion_size}g`}
                            </span>
                            <span className="font-medium">
                              {Math.round(
                                food.calories * (food.portion_size / 100)
                              )}{" "}
                              kcal
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-end border-t pt-2">
                        <span
                          className="text-primary text-xs font-bold
                            tracking-tighter uppercase"
                        >
                          Meal Total: {Math.round(mealTotal)} kcal
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const MealSection = ({
  meal,
  mealPlanId,
  foodPost,
  onLogFood,
  persistedFoods = [],
  readOnly = false,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [localLog, setLocalLog] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (persistedFoods) {
      setLocalLog(
        persistedFoods.map((f) => ({
          name: f.food_name,
          caloriesPer100g: parseFloat(f.calories) || 0,
          fdc_id: f.fdc_id,
          portion: parseFloat(f.portion_size) || 100,
          isLogged: true,
          loading: false,
        }))
      );
    }
  }, [persistedFoods]);

  useEffect(() => {
    if (readOnly) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const q = searchInput.trim().toLowerCase();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const delay = setTimeout(async () => {
      try {
        const data = await foodPost("/proxy/usda/foods/search", {
          query: q,
          pageSize: 10,
        });
        setSearchResults((data?.foods || []).slice(0, 5));
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchInput, foodPost, readOnly]);

  const handleSelect = (food) => {
    if (readOnly) return;
    const energy = food.foodNutrients?.find((n) =>
      n.nutrientName?.toLowerCase().includes("energy")
    );
    setLocalLog((prev) => [
      ...prev,
      {
        name: food.description,
        caloriesPer100g: Math.round(energy?.value || 0),
        fdc_id: food.fdcId || food.fdc_id,
        portion: 100,
        isLogged: false,
        loading: false,
      },
    ]);
    setSearchInput("");
    setSearchResults([]);
  };

  const handleLogToBackend = async (idx) => {
    if (readOnly) return;
    const item = localLog[idx];
    const portion = parseFloat(item.portion) || 0;
    if (!mealPlanId) return;

    setLocalLog((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, loading: true } : f))
    );
    try {
      await foodPost(`/nutrition/plans/${mealPlanId}/add_food`, {
        fdc_id: item.fdc_id,
        food_name: item.name,
        calories: item.caloriesPer100g,
        portion_size: portion,
      });
      await foodPost(`/nutrition/plans/${mealPlanId}/log_eaten`, {});
      setLocalLog((prev) =>
        prev.map((f, i) =>
          i === idx ? { ...f, isLogged: true, loading: false } : f
        )
      );
      onLogFood(Math.round((item.caloriesPer100g * portion) / 100));
    } catch (e) {
      setLocalLog((prev) =>
        prev.map((f, i) => (i === idx ? { ...f, loading: false } : f))
      );
    }
  };

  return (
    <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Utensils size={16} className="text-primary" />
        {meal}
      </h2>
      {!readOnly && (
        <div className="relative">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3
              -translate-y-1/2"
            size={14}
          />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
            placeholder={`Search ${meal}...`}
          />
          {searchResults.length > 0 && (
            <div
              className="bg-card absolute z-50 mt-1 w-full overflow-hidden
                rounded-md border shadow-xl"
            >
              {searchResults.map((food) => (
                <button
                  key={food.fdcId}
                  className="hover:bg-muted w-full border-b p-3 text-left
                    text-sm last:border-0"
                  onClick={() => handleSelect(food)}
                >
                  <div className="line-clamp-1 font-medium">
                    {food.description}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {food.brandOwner || "General Food"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-4 space-y-3">
        {localLog.map((f, i) => (
          <div
            key={i}
            className="bg-muted/30 rounded-lg border border-transparent p-3"
          >
            <div className="flex items-start justify-between">
              <div className="mr-2 flex-1">
                <p className="text-sm leading-tight font-medium">{f.name}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {Math.round((f.caloriesPer100g * f.portion) / 100)} kcal
                </p>
              </div>
              {f.isLogged ? (
                <span
                  className="text-primary flex items-center gap-1 text-xs
                    font-semibold"
                >
                  <CheckCircle2 size={14} /> Logged
                </span>
              ) : readOnly ? null : (
                <Button
                  size="sm"
                  className="h-8"
                  onClick={() => handleLogToBackend(i)}
                  disabled={f.loading}
                >
                  {f.loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Log"
                  )}
                </Button>
              )}
            </div>
            {!readOnly && !f.isLogged && (
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="number"
                  value={f.portion}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalLog((prev) =>
                      prev.map((item, idx) =>
                        idx === i ? { ...item, portion: val } : item
                      )
                    );
                  }}
                  className="h-8 w-20"
                />
                <span className="text-muted-foreground text-xs">grams</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

const NutritionPage = ({ viewedUserId = null, readOnly = false }) => {
  const currentUserId = viewedUserId || localStorage.getItem("userId");
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [loggedCalories, setLoggedCalories] = useState(0);
  const [mealPlanIds, setMealPlanIds] = useState(emptyMealPlanIds);
  const [persistedFoodsByMeal, setPersistedFoodsByMeal] = useState(
    emptyPersistedFoodsByMeal
  );

  const hydrateRef = useRef(false);
  const { data: todayData, loading } = useGetFromAPI(
    currentUserId
      ? `/nutrition/today?user_id=${currentUserId}&timezone=${encodeURIComponent(userTimezone)}`
      : null
  );
  const { postFunction: apiPost } = usePostToAPI();

  useEffect(() => {
    hydrateRef.current = false;
  }, [currentUserId, readOnly]);

  const createMealPlan = useCallback(
    async (mealTypeId) => {
      const ts = new Date().toISOString().split(".")[0];
      const res = await apiPost("/nutrition/plans/create", {
        user_id: currentUserId,
        meal_datetime: ts,
        meal_type_id: mealTypeId,
      });
      return res?.meal_plan_id || null;
    },
    [apiPost, currentUserId]
  );

  const ensurePlans = useCallback(
    async (existing) => {
      const updated = { ...existing };
      for (const meal of MEAL_NAMES) {
        if (!updated[meal]) {
          updated[meal] = await createMealPlan(mealNameToType[meal]);
        }
      }
      return updated;
    },
    [createMealPlan]
  );

  const hydrate = useCallback(async () => {
    if (hydrateRef.current || !todayData) return;
    hydrateRef.current = true;

    const groupedFoods = emptyPersistedFoodsByMeal();
    const groupedIds = emptyMealPlanIds();

    (todayData?.meal_plans || []).forEach((mp) => {
      const meal = mealTypeToName[mp.meal_type];
      if (meal) {
        groupedIds[meal] = mp.meal_plan_id;
        groupedFoods[meal] = mp.meal_plan_foods || [];
      }
    });

    if (readOnly) {
      setMealPlanIds(groupedIds);
    } else {
      const finalIds = await ensurePlans(groupedIds);
      setMealPlanIds(finalIds);
    }
    setPersistedFoodsByMeal(groupedFoods);
    setLoggedCalories(Math.round(todayData?.daily_total_calories || 0));
  }, [todayData, ensurePlans, readOnly]);

  useEffect(() => {
    if (todayData && !loading) hydrate();
  }, [todayData, loading, hydrate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-8">
      <div
        className="flex flex-col gap-1 sm:flex-row sm:items-baseline
          sm:justify-between"
      >
        <h1 className="text-3xl font-bold">Nutrition</h1>
        {readOnly && (
          <p className="text-muted-foreground text-sm font-medium">
            Read-only (client view)
          </p>
        )}
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Calendar size={16} /> Today
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={16} /> Weekly Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          <Card
            className="flex flex-col items-center justify-center space-y-4 p-8"
          >
            <div className="text-primary text-6xl font-bold">
              {loggedCalories}
            </div>
            <div
              className="text-muted-foreground text-xs font-bold tracking-widest
                uppercase"
            >
              Total Calories Today
            </div>
            <div className="w-full max-w-md">
              <Progress
                value={Math.min((loggedCalories / 2500) * 100, 100)}
                className="h-2"
              />
              <div
                className="text-muted-foreground mt-2 flex justify-between
                  text-[10px] font-bold"
              >
                <span>0 KCAL</span>
                <span>GOAL: 2500 KCAL</span>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {MEAL_NAMES.map((meal) => (
              <MealSection
                key={meal}
                meal={meal}
                mealPlanId={mealPlanIds[meal]}
                foodPost={apiPost}
                onLogFood={(c) => setLoggedCalories((p) => p + c)}
                persistedFoods={persistedFoodsByMeal[meal]}
                readOnly={readOnly}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2 border-b pb-4">
              <TrendingUp className="text-primary" size={20} />
              <h2 className="text-xl font-semibold">Detailed Weekly History</h2>
            </div>
            <WeeklyHistory userId={currentUserId} timezone={userTimezone} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NutritionPage;
