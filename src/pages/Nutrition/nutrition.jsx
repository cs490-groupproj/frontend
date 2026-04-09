import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import { Loader2, Activity, Plus, Check, Flame, Search } from "lucide-react";

const NutritionPage = () => {
  const currentUserId = localStorage.getItem("userId");
  const dailyCalorieGoal = 2500;

  // Mapping backend IDs to frontend keys
  const MEAL_TYPE_MAP = { Breakfast: 1, Lunch: 2, Dinner: 3, Snack: 4 };
  const REVERSE_MEAL_MAP = {
    1: "Breakfast",
    2: "Lunch",
    3: "Dinner",
    4: "Snack",
  };

  const apiFetch = async (url, options = {}) => {
    const BASE_URL = "https://optimal-api.lambusta.me";
    const cleanUrl = url.replace(/^\//, "");
    const finalUrl = `${BASE_URL}/${cleanUrl}`;
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(finalUrl, { ...options, headers });
    const contentType = response.headers.get("content-type");
    const data = contentType?.includes("application/json")
      ? await response.json()
      : null;
    return { ok: response.ok, status: response.status, data };
  };

  // --- STATE ---
  const [activePlanIds, setActivePlanIds] = useState({});
  const [dailyLog, setDailyLog] = useState({
    Breakfast: [],
    Lunch: [],
    Dinner: [],
  });
  const [loggedCalories, setLoggedCalories] = useState(0);
  const [searchInputs, setSearchInputs] = useState({
    Breakfast: "",
    Lunch: "",
    Dinner: "",
  });
  const [searchResults, setSearchResults] = useState({
    Breakfast: [],
    Lunch: [],
    Dinner: [],
  });
  const [loading, setLoading] = useState(false);

  // INITIAL SYNC
  useEffect(() => {
    if (!currentUserId) return;
    fetchAndSyncPlans();
  }, [currentUserId]);

  const fetchAndSyncPlans = async () => {
    try {
      setLoading(true);
      const { ok, data } = await apiFetch(
        `/nutrition/plans/plans_by_user?user_id=${currentUserId}`
      );

      if (ok && data.meal_plans) {
        const newDailyLog = { Breakfast: [], Lunch: [], Dinner: [] };
        const newPlanIds = {};

        data.meal_plans.forEach((plan) => {
          const typeName = REVERSE_MEAL_MAP[plan.meal_type_id];
          if (typeName) {
            newPlanIds[typeName] = plan.meal_plan_id;
            newDailyLog[typeName] = plan.meal_plan_foods.map((f) => ({
              fdc_id: f.fdc_id,
              name: `Food ID: ${f.fdc_id}`,
              calories: 0,
            }));
          }
        });

        setActivePlanIds(newPlanIds);
        setDailyLog(newDailyLog);
      }
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (mealType) => {
    const query = searchInputs[mealType];
    if (!query || query.length < 2) return;

    try {
      const { ok, data } = await apiFetch("/proxy/usda/foods/search", {
        method: "POST",
        body: JSON.stringify({ query, pageSize: 5 }),
      });

      if (ok && data.foods) {
        setSearchResults((prev) => ({ ...prev, [mealType]: data.foods }));
      }
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const ensurePlanExists = async (mealType) => {
    if (activePlanIds[mealType]) return activePlanIds[mealType];

    const timestamp = new Date().toISOString();
    const { ok, data } = await apiFetch("/nutrition/plans/create", {
      method: "POST",
      body: JSON.stringify({
        user_id: currentUserId,
        meal_type_id: MEAL_TYPE_MAP[mealType],
        meal_datetime: timestamp,
      }),
    });

    if (ok) {
      setActivePlanIds((prev) => ({ ...prev, [mealType]: data.meal_plan_id }));
      return data.meal_plan_id;
    }
    return null;
  };

  const handleAddFood = async (mealType, foodItem) => {
    const planId = await ensurePlanExists(mealType);
    if (!planId) return alert("Could not create/find a meal plan.");

    const kcalNutrient = foodItem.foodNutrients.find(
      (n) => n.nutrientId === 1008 || n.unitName === "KCAL"
    );
    const calories = kcalNutrient ? kcalNutrient.value : 0;

    try {
      const { ok } = await apiFetch(`/nutrition/plans/${planId}/add_food`, {
        method: "POST",
        body: JSON.stringify({ fdc_id: foodItem.fdcId }),
      });

      if (ok) {
        setDailyLog((prev) => ({
          ...prev,
          [mealType]: [
            ...prev[mealType],
            { name: foodItem.description, calories, fdc_id: foodItem.fdcId },
          ],
        }));
        setSearchInputs((p) => ({ ...p, [mealType]: "" }));
        setSearchResults((p) => ({ ...p, [mealType]: [] }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogAsEaten = async (mealType, index) => {
    const item = dailyLog[mealType][index];
    const planId = activePlanIds[mealType];

    const { ok } = await apiFetch(`/nutrition/plans/${planId}/log_eaten`, {
      method: "POST",
    });

    if (ok) {
      setLoggedCalories((prev) => prev + (item.calories || 0));
      setDailyLog((prev) => ({ ...prev, [mealType]: [] }));
      alert(`${mealType} logged successfully!`);
    }
  };

  const progress = Math.min((loggedCalories / dailyCalorieGoal) * 100, 100);

  return (
    <div
      className="min-h-screen w-full bg-slate-950 p-4 font-sans text-slate-50
        md:p-8"
    >
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div
          className="mb-10 flex items-end justify-between border-b
            border-slate-800 pb-8"
        >
          <div className="flex items-center gap-4">
            <div
              className="rounded-xl bg-rose-600 p-3 text-white shadow-lg
                shadow-rose-900/30"
            >
              <Activity size={32} />
            </div>
            <div>
              <h1
                className="text-4xl font-black tracking-tighter uppercase italic
                  md:text-5xl"
              >
                Fuel Tracker
              </h1>
              <p
                className="text-[10px] font-bold tracking-widest text-slate-500
                  uppercase"
              >
                User: {currentUserId?.slice(0, 8) || "Offline"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className="text-[10px] font-black tracking-widest text-rose-500
                uppercase"
            >
              Daily Target
            </p>
            <p className="text-3xl font-black">{dailyCalorieGoal} KCAL</p>
          </div>
        </div>

        {/* Progress Display */}
        <Card className="mb-8 border-none bg-slate-900 ring-1 ring-slate-800">
          <CardContent className="pt-8 pb-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center
                    rounded-full bg-rose-500/10 text-rose-500"
                >
                  <Flame size={28} />
                </div>
                <div>
                  <span className="text-6xl font-black tracking-tighter">
                    {loggedCalories}
                  </span>
                  <span
                    className="ml-2 text-xs font-bold text-slate-400 uppercase"
                  >
                    Logged
                  </span>
                </div>
              </div>
              <span className="text-4xl font-black text-rose-500">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress
              value={progress}
              className="h-4 bg-slate-800 [&>div]:bg-rose-600"
            />
          </CardContent>
        </Card>

        {/* Meal Sections */}
        <div className="grid grid-cols-1 gap-12">
          {["Breakfast", "Lunch", "Dinner"].map((meal) => (
            <div key={meal} className="space-y-4">
              <div
                className="flex items-center px-2 text-sm font-black
                  tracking-[0.3em] text-slate-500 uppercase"
              >
                <span className="mr-2 text-rose-500">//</span> {meal}
                <div className="ml-4 h-[1px] flex-grow bg-slate-800" />
              </div>

              <Card className="overflow-hidden border-slate-800 bg-slate-900/40">
                <div
                  className="flex items-center border-b border-slate-800 pr-4"
                >
                  <Input
                    placeholder={`Search ${meal}...`}
                    className="h-16 border-none bg-transparent text-lg
                      text-slate-50 focus-visible:ring-0
                      focus-visible:ring-offset-0"
                    value={searchInputs[meal]}
                    onChange={(e) =>
                      setSearchInputs((p) => ({ ...p, [meal]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(meal)}
                  />
                  <Button
                    variant="ghost"
                    onClick={() => handleSearch(meal)}
                    className="text-rose-500 hover:bg-transparent
                      hover:text-rose-400"
                  >
                    <Search size={24} />
                  </Button>
                </div>

                {/* Search Results Dropdown */}
                {searchResults[meal].length > 0 && (
                  <div className="divide-y divide-slate-700 bg-slate-800/50 p-2">
                    {searchResults[meal].map((food) => (
                      <div
                        key={food.fdcId}
                        className="flex items-center justify-between p-4
                          hover:bg-slate-700/50"
                      >
                        <span className="max-w-[70%] truncate text-sm font-bold">
                          {food.description}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleAddFood(meal, food)}
                          className="bg-rose-600"
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <CardContent className="p-0">
                  <div className="divide-y divide-slate-800/50">
                    {dailyLog[meal].map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-6"
                      >
                        <div>
                          <p className="text-xl font-bold">{f.name}</p>
                          <p
                            className="text-xs font-black text-slate-500
                              uppercase"
                          >
                            {f.calories} KCAL
                          </p>
                        </div>
                        {i === dailyLog[meal].length - 1 && (
                          <Button
                            onClick={() => handleLogAsEaten(meal, i)}
                            className="bg-emerald-600 hover:bg-emerald-500"
                          >
                            <Check size={18} className="mr-2" /> LOG MEAL
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NutritionPage;
