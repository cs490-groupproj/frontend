import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import { Loader2, Activity, Plus, Check, Flame } from "lucide-react";

const NutritionPage = () => {
  // CONFIG: Replace with your actual UUID from the database once registered
  const currentUserId =
    localStorage.getItem("userId") || "550e8400-e29b-41d4-a716-446655440000";
  const dailyCalorieGoal = 2500;
  const MEAL_TYPE_MAP = { Breakfast: 1, Lunch: 2, Dinner: 3 };

  // Helper for API calls to ensure consistent headers and URL construction
  const apiFetch = async (url, options = {}) => {
    const BASE_URL = "https://optimal-api.lambusta.me";
    const cleanBase = BASE_URL.replace(/\/$/, "");
    const cleanUrl = url.replace(/^\//, "");
    const finalUrl = `${cleanBase}/${cleanUrl}`;

    const headers = {
      "Content-Type": "application/json",
      // This pulls the fresh token from login, or falls back to your hardcoded one for one last test
      Authorization: `Bearer ${localStorage.getItem("token") || "PASTE_YOUR_HARDCODED_TOKEN_HERE"}`,
      ...options.headers,
    };

    try {
      const response = await fetch(finalUrl, { ...options, headers });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.warn(
          `Backend Status ${response.status}:`,
          errorBody.error || "Request failed"
        );
      }
      return response;
    } catch (err) {
      console.error("Network Error:", err);
      throw err;
    }
  };

  // --- STATE ---
  const [mealPlanId, setMealPlanId] = useState(null);
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
  const [loading, setLoading] = useState(false);

  // 1. SYNC: Check for existing plans (Matches GET /plans/plans_by_user)
  useEffect(() => {
    const fetchExistingPlan = async () => {
      try {
        const res = await apiFetch(
          `/nutrition/plans/plans_by_user?user_id=${currentUserId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.meal_plans && data.meal_plans.length > 0) {
            setMealPlanId(data.meal_plans[0].meal_plan_id);
            // Optional: Map existing foods from DB to UI here if desired
          }
        }
      } catch (e) {
        console.log(
          "Offline mode: Database user not found or server unreachable."
        );
      }
    };
    fetchExistingPlan();
  }, [currentUserId]);

  // 2. CREATE: Start a new day (Matches POST /plans/create)
  const handleStartNewPlan = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/nutrition/plans/create", {
        method: "POST",
        body: JSON.stringify({ user_id: currentUserId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMealPlanId(data.meal_plan_id);
        setDailyLog({ Breakfast: [], Lunch: [], Dinner: [] });
        setLoggedCalories(0);
      }
    } catch (error) {
      console.error("Could not create plan in DB.");
    } finally {
      setLoading(false);
    }
  };

  // 3. ADD: Add item (Matches POST /plans/<id>/add_food)
  const handleAddFood = async (mealType) => {
    const name = searchInputs[mealType];
    if (!name.trim()) return;

    const testFdcId = 1103374; // Mock FDC ID for testing

    // Update UI immediately so the demo looks responsive
    setDailyLog((prev) => ({
      ...prev,
      [mealType]: [
        ...prev[mealType],
        { name, calories: 450, fdc_id: testFdcId },
      ],
    }));
    setSearchInputs((prev) => ({ ...prev, [mealType]: "" }));

    // If we have a valid plan ID, sync to backend
    if (mealPlanId) {
      await apiFetch(`/nutrition/plans/${mealPlanId}/add_food`, {
        method: "POST",
        body: JSON.stringify({
          meal_type_id: MEAL_TYPE_MAP[mealType],
          fdc_id: testFdcId,
        }),
      });
    }
  };

  // 4. LOG: Consume item (Matches POST /plans/<id>/log_eaten)
  const handleLogAsEaten = async (mealType, index) => {
    const item = dailyLog[mealType][index];
    setLoggedCalories((prev) => prev + item.calories);
    setDailyLog((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((_, i) => i !== index),
    }));

    if (mealPlanId) {
      await apiFetch(`/nutrition/plans/${mealPlanId}/log_eaten`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    }
  };

  const progress = (loggedCalories / dailyCalorieGoal) * 100;

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans text-slate-50">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div
          className="mb-10 flex items-center justify-between border-b
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
                className="text-4xl font-black tracking-tighter uppercase
                  italic"
              >
                Fuel Tracker
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase">
                User: {currentUserId.slice(0, 8)}...
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className="text-[10px] font-black tracking-widest text-rose-500
                uppercase"
            >
              Target
            </p>
            <p className="text-2xl font-black">{dailyCalorieGoal} KCAL</p>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="mb-8 border-none bg-slate-900 shadow-2xl">
          <CardContent className="pt-8">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="text-rose-500" size={24} />
                <span className="text-5xl font-black">{loggedCalories}</span>
                <div
                  className="flex flex-col text-xs font-bold text-slate-400
                    uppercase"
                >
                  <span>Calories</span>
                  <span>Logged</span>
                </div>
              </div>
              <span className="text-3xl font-black text-rose-500">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress
              value={progress}
              className="h-4 rounded-full bg-slate-800 [&>div]:bg-rose-600"
            />
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button
          onClick={handleStartNewPlan}
          disabled={loading}
          className="mb-12 h-16 w-full bg-rose-600 text-lg font-black
            tracking-widest uppercase transition-all hover:bg-rose-700
            active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Reset Daily Plan"}
        </Button>

        {/* Meal Logging Grid */}
        <div className="space-y-12">
          {["Breakfast", "Lunch", "Dinner"].map((meal) => (
            <div key={meal}>
              <div
                className="mb-4 flex items-center px-2 text-sm font-black
                  tracking-[0.25em] text-slate-400 uppercase"
              >
                <span>{meal}</span>
                <div className="ml-4 h-[1px] flex-grow bg-slate-800" />
              </div>

              <Card
                className="overflow-hidden border-slate-800 bg-slate-900/50
                  backdrop-blur-sm"
              >
                <div className="flex border-b border-slate-800">
                  <Input
                    placeholder="Search for food..."
                    className="h-14 border-none bg-transparent font-medium
                      text-slate-50 focus-visible:ring-0"
                    value={searchInputs[meal]}
                    onChange={(e) =>
                      setSearchInputs((p) => ({ ...p, [meal]: e.target.value }))
                    }
                  />
                  <Button
                    variant="ghost"
                    className="h-14 border-l border-slate-800 px-8
                      text-rose-500"
                    onClick={() => handleAddFood(meal)}
                  >
                    <Plus size={24} strokeWidth={3} />
                  </Button>
                </div>

                <CardContent className="p-0">
                  <div className="divide-y divide-slate-800">
                    {dailyLog[meal].map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-5
                          hover:bg-slate-800/30"
                      >
                        <div className="flex flex-col">
                          <span className="text-lg font-bold">{f.name}</span>
                          <span
                            className="text-[10px] font-black text-slate-500
                              uppercase"
                          >
                            ~450 kcal
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleLogAsEaten(meal, i)}
                          className="bg-emerald-600 font-black
                            hover:bg-emerald-700"
                        >
                          <Check size={16} className="mr-2" strokeWidth={3} />{" "}
                          LOG EATEN
                        </Button>
                      </div>
                    ))}
                    {dailyLog[meal].length === 0 && (
                      <div
                        className="p-10 text-center font-black text-slate-800
                          uppercase italic opacity-30"
                      >
                        No items added
                      </div>
                    )}
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
