import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import {
  Loader2,
  Search,
  Utensils,
  CheckCircle2,
  History,
  Clock,
} from "lucide-react";
import useGetFromAPI from "../../hooks/useGetFromAPI";
import usePostToAPI from "../../hooks/usePostToAPI";

const MEAL_NAMES = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const mealTypeToName = { 1: "Breakfast", 2: "Lunch", 3: "Dinner", 4: "Snacks" };
const mealNameToType = { Breakfast: 1, Lunch: 2, Dinner: 3, Snacks: 4 };

const parseUTCDate = (dateStr) => {
  if (!dateStr) return new Date();
  const standardized =
    dateStr.includes("Z") || dateStr.includes("+") ? dateStr : `${dateStr}Z`;
  return new Date(standardized);
};

const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = parseUTCDate(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const WeeklyHistory = ({ userId, timezone }) => {
  const { data: historyData, loading } = useGetFromAPI(
    userId
      ? `/nutrition/week?user_id=${userId}&timezone=${encodeURIComponent(timezone)}`
      : null
  );

  if (loading || !historyData) {
    return (
      <div
        className="flex h-[60vh] w-full flex-col items-center justify-center
          p-6"
      >
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
        <p
          className="text-muted-foreground mt-4 text-xs font-bold
            tracking-widest uppercase"
        >
          Loading Your Meal History
        </p>
      </div>
    );
  }

  const groupedByDate = (historyData?.meal_plans || []).reduce((acc, plan) => {
    const date = parseUTCDate(plan.meal_logged_at).toLocaleDateString(
      undefined,
      { weekday: "long", month: "short", day: "numeric" }
    );
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
                        <Clock size={12} /> {formatTime(plan.meal_logged_at)}
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

// --- Meal Section ---
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
    if (readOnly || searchInput.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const delay = setTimeout(async () => {
      try {
        const data = await foodPost("/proxy/usda/foods/search", {
          query: searchInput,
          pageSize: 10,
        });
        const mapped = (data?.foods || []).slice(0, 5).map((food) => {
          const energy = food.foodNutrients?.find((n) =>
            n.nutrientName?.toLowerCase().includes("energy")
          );
          return {
            ...food,
            energyValue: Math.round(energy?.value || 0),
            brand: food.brandOwner || food.brandName || "Generic Food",
          };
        });
        setSearchResults(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchInput, foodPost, readOnly]);

  const handleSelect = (food) => {
    setLocalLog((prev) => [
      ...prev,
      {
        name: food.description,
        caloriesPer100g: food.energyValue,
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
    if (readOnly || !mealPlanId) return;
    const item = localLog[idx];
    setLocalLog((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, loading: true } : f))
    );
    try {
      await foodPost(`/nutrition/plans/${mealPlanId}/add_food`, {
        fdc_id: item.fdc_id,
        food_name: item.name,
        calories: item.caloriesPer100g,
        portion_size: parseFloat(item.portion) || 0,
      });
      await foodPost(`/nutrition/plans/${mealPlanId}/log_eaten`, {});
      setLocalLog((prev) =>
        prev.map((f, i) =>
          i === idx ? { ...f, isLogged: true, loading: false } : f
        )
      );
      onLogFood(Math.round((item.caloriesPer100g * item.portion) / 100));
    } catch (e) {
      setLocalLog((prev) =>
        prev.map((f, i) => (i === idx ? { ...f, loading: false } : f))
      );
    }
  };

  return (
    <section className="border-border bg-card rounded-xl border p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Utensils size={16} className="text-primary" /> {meal}
      </h2>
      {!readOnly && (
        <div className="relative">
          {isSearching ? (
            <Loader2
              className="text-primary absolute top-1/2 left-3 -translate-y-1/2
                animate-spin"
              size={14}
            />
          ) : (
            <Search
              className="text-muted-foreground absolute top-1/2 left-3
                -translate-y-1/2"
              size={14}
            />
          )}
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
                  className="hover:bg-muted flex w-full items-center
                    justify-between border-b p-3 text-left text-sm"
                  onClick={() => handleSelect(food)}
                >
                  <div className="flex min-w-0 flex-col pr-4">
                    <span className="line-clamp-1 font-medium">
                      {food.description}
                    </span>
                    <span
                      className="text-muted-foreground text-[10px] font-bold
                        tracking-tight uppercase"
                    >
                      {food.brand}
                    </span>
                  </div>
                  <div
                    className="text-muted-foreground shrink-0 text-xs
                      font-medium whitespace-nowrap"
                  >
                    {food.energyValue} kcal/100g
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mt-4 space-y-3">
        {localLog.map((f, i) => (
          <div key={i} className="bg-muted/30 rounded-lg border p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">{f.name}</p>
                <p className="text-muted-foreground text-xs">
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
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleLogToBackend(i)}
                  disabled={f.loading || !mealPlanId}
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
                  onChange={(e) =>
                    setLocalLog((p) =>
                      p.map((item, idx) =>
                        idx === i ? { ...item, portion: e.target.value } : item
                      )
                    )
                  }
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

const TodayView = ({ userId, timezone, apiPost, readOnly, refreshKey }) => {
  const [state, setState] = useState({
    calories: 0,
    plans: {},
    foods: {},
    isReady: false,
  });
  const creatingPlansRef = useRef(false);
  const CALORIE_GOAL = 2500;

  const { data: todayData, loading } = useGetFromAPI(
    userId
      ? `/nutrition/today?user_id=${userId}&timezone=${encodeURIComponent(timezone)}&_k=${refreshKey}`
      : null
  );

  useEffect(() => {
    if (!todayData || creatingPlansRef.current) return;

    const init = async () => {
      const plans = {
        Breakfast: null,
        Lunch: null,
        Dinner: null,
        Snacks: null,
      };
      const foods = { Breakfast: [], Lunch: [], Dinner: [], Snacks: [] };

      todayData.meal_plans.forEach((mp) => {
        const m = mealTypeToName[mp.meal_type];
        if (m) {
          plans[m] = mp.meal_plan_id;
          foods[m] = mp.meal_plan_foods;
        }
      });

      const missingMeals = MEAL_NAMES.filter((m) => !plans[m]);

      if (!readOnly && missingMeals.length > 0) {
        creatingPlansRef.current = true;
        for (const m of missingMeals) {
          try {
            const res = await apiPost("/nutrition/plans/create", {
              user_id: userId,
              meal_datetime: new Date().toISOString(),
              meal_type_id: mealNameToType[m],
            });
            if (res?.meal_plan_id) plans[m] = res.meal_plan_id;
          } catch (err) {
            console.error(err);
          }
        }
      }

      setState({
        calories: Math.round(todayData.daily_total_calories),
        plans,
        foods,
        isReady: true,
      });
    };

    init();
  }, [todayData, userId, readOnly, apiPost]);

  if (loading || !state.isReady) {
    return (
      <div
        className="flex h-[60vh] w-full flex-col items-center justify-center
          p-6"
      >
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
        <p
          className="text-muted-foreground mt-4 text-xs font-bold
            tracking-widest uppercase"
        >
          Loading Nutrition Tracker
        </p>
      </div>
    );
  }

  const progressValue = Math.min((state.calories / CALORIE_GOAL) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Refined Calorie Card */}
      <Card
        className="bg-card/50 flex min-h-[280px] flex-col items-center
          justify-center border-white/5 p-6 shadow-sm"
      >
        <div
          className="text-6xl leading-none font-bold tracking-tight
            text-[#e11d48]"
        >
          {state.calories}
        </div>
        <p
          className="text-muted-foreground mt-3 text-[11px] font-bold
            tracking-[0.2em] uppercase"
        >
          Total Calories Today
        </p>

        <div className="mt-8 w-full max-w-sm space-y-2">
          <Progress value={progressValue} className="h-2" />
          <div
            className="text-muted-foreground flex justify-between text-[9px]
              font-black tracking-wider uppercase opacity-60"
          >
            <span>{state.calories} KCAL</span>
            <span>GOAL: {CALORIE_GOAL} KCAL</span>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {MEAL_NAMES.map((m) => (
          <MealSection
            key={m}
            meal={m}
            mealPlanId={state.plans[m]}
            foodPost={apiPost}
            onLogFood={(c) =>
              setState((s) => ({ ...s, calories: s.calories + c }))
            }
            persistedFoods={state.foods[m]}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
};

const NutritionPage = ({ viewedUserId = null, readOnly = false }) => {
  const currentUserId = viewedUserId || localStorage.getItem("userId");
  const [activeTab, setActiveTab] = useState("today");
  const [todayKey, setTodayKey] = useState(0);
  const { postFunction: apiPost } = usePostToAPI();

  return (
    <div className="mx-auto w-full space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Nutrition</h1>
      </div>

      <div
        className="border-border bg-card mb-6 inline-flex rounded-xl border p-1"
      >
        <button
          type="button"
          onClick={() => {
            setActiveTab("today");
            setTodayKey((k) => k + 1);
          }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors
            ${
              activeTab === "today"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors
            ${
              activeTab === "history"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
        >
          Weekly Logs
        </button>
      </div>

      {activeTab === "today" && (
        <TodayView
          userId={currentUserId}
          timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
          apiPost={apiPost}
          readOnly={readOnly}
          refreshKey={todayKey}
        />
      )}
      {activeTab === "history" && (
        <WeeklyHistory
          key={activeTab}
          userId={currentUserId}
          timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
        />
      )}
    </div>
  );
};

export default NutritionPage;
