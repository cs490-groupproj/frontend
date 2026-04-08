import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import { Loader2, Activity, Plus, Check, Flame } from "lucide-react";

const NutritionPage = () => {
  // 1. IDENTITY BRIDGE: Pulling real data from your new Login/SignUp logic
  const currentUserId = localStorage.getItem("userId");
  const dailyCalorieGoal = 2500;
  const MEAL_TYPE_MAP = { Breakfast: 1, Lunch: 2, Dinner: 3 };

  /**
   * REUSABLE API HELPER
   * Automatically attaches your fresh Bearer token and handles base URLs
   */
  const apiFetch = async (url, options = {}) => {
    const BASE_URL = "https://optimal-api.lambusta.me";
    const cleanBase = BASE_URL.replace(/\/$/, "");
    const cleanUrl = url.replace(/^\//, "");
    const finalUrl = `${cleanBase}/${cleanUrl}`;
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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

  // 2. INITIAL SYNC: Load the user's current plan on page load
  useEffect(() => {
    if (!currentUserId) return;

    const fetchExistingPlan = async () => {
      try {
        const res = await apiFetch(
          `/nutrition/plans/plans_by_user?user_id=${currentUserId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.meal_plans && data.meal_plans.length > 0) {
            // Get the most recent plan ID
            setMealPlanId(data.meal_plans[0].meal_plan_id);
          }
        }
      } catch (e) {
        console.log(
          "Sync Error: Backend unreachable or plan does not exist yet."
        );
      }
    };
    fetchExistingPlan();
  }, [currentUserId]);

  // --- HANDLERS ---
  const handleStartNewPlan = async () => {
    if (!currentUserId) return alert("Please log in to track nutrition.");
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

  const handleAddFood = async (mealType) => {
    const name = searchInputs[mealType];
    if (!name.trim()) return;

    const testFdcId = 1103374; // Standard Mock ID for demo

    // Update UI immediately for responsiveness
    setDailyLog((prev) => ({
      ...prev,
      [mealType]: [
        ...prev[mealType],
        { name, calories: 450, fdc_id: testFdcId },
      ],
    }));
    setSearchInputs((prev) => ({ ...prev, [mealType]: "" }));

    // Sync to backend if plan exists
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

  const handleLogAsEaten = async (mealType, index) => {
    const item = dailyLog[mealType][index];

    if (mealPlanId) {
      const res = await apiFetch(`/nutrition/plans/${mealPlanId}/log_eaten`, {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (res.ok) {
        setLoggedCalories((prev) => prev + item.calories);
        setDailyLog((prev) => ({
          ...prev,
          [mealType]: prev[mealType].filter((_, i) => i !== index),
        }));
      }
    }
  };

  const progress = (loggedCalories / dailyCalorieGoal) * 100;

  // --- RENDER ---
  return (
    <div
      className="min-h-screen w-full bg-slate-950 p-4 font-sans text-slate-50
        md:p-8"
    >
      <div className="mx-auto max-w-4xl">
        {/* Header - Fixed Alignment for Target and Title */}
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
                className="text-4xl leading-none font-black tracking-tighter
                  uppercase italic md:text-5xl"
              >
                Fuel Tracker
              </h1>
              <p
                className="mt-1 text-[10px] font-bold tracking-widest
                  text-slate-500 uppercase"
              >
                User: {currentUserId ? currentUserId.slice(0, 8) : "NO_USER"}...
              </p>
            </div>
          </div>

          <div className="pb-1 text-right">
            <p
              className="text-[10px] font-black tracking-widest text-rose-500
                uppercase"
            >
              Daily Target
            </p>
            <p className="text-3xl leading-none font-black">
              {dailyCalorieGoal} KCAL
            </p>
          </div>
        </div>

        {/* Progress Card */}
        <Card
          className="mb-8 border-none bg-slate-900 shadow-2xl ring-1
            ring-slate-800"
        >
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
                    className="ml-2 text-xs font-bold tracking-tighter
                      text-slate-400 uppercase"
                  >
                    Calories Logged
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-rose-500">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            <Progress
              value={progress}
              className="h-4 rounded-full bg-slate-800 shadow-inner
                [&>div]:bg-rose-600"
            />
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button
          onClick={handleStartNewPlan}
          disabled={loading || !currentUserId}
          className="mb-12 h-20 w-full bg-rose-600 text-xl font-black
            tracking-[0.2em] uppercase shadow-lg shadow-rose-900/20
            transition-all hover:bg-rose-700 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Reset Daily Plan"}
        </Button>

        {/* Meal Logging Grid */}
        <div className="grid grid-cols-1 gap-8">
          {["Breakfast", "Lunch", "Dinner"].map((meal) => (
            <div key={meal} className="space-y-4">
              <div
                className="flex items-center px-2 text-sm font-black
                  tracking-[0.3em] text-slate-500 uppercase"
              >
                <span className="mr-2 text-rose-500">//</span>
                <span>{meal}</span>
                <div className="ml-4 h-[1px] flex-grow bg-slate-800" />
              </div>

              <Card
                className="overflow-hidden border-slate-800 bg-slate-900/40
                  shadow-xl backdrop-blur-md"
              >
                <div
                  className="flex items-center border-b border-slate-800
                    bg-slate-900/80 px-2"
                >
                  <Input
                    placeholder={`Search ${meal} items...`}
                    className="h-16 border-none bg-transparent text-lg
                      font-medium text-slate-50 placeholder:text-slate-600
                      focus-visible:ring-0"
                    value={searchInputs[meal]}
                    onChange={(e) =>
                      setSearchInputs((p) => ({ ...p, [meal]: e.target.value }))
                    }
                  />
                  <Button
                    variant="ghost"
                    className="mr-2 h-12 w-12 rounded-lg bg-rose-600/10
                      text-rose-500 transition-colors hover:bg-rose-600
                      hover:text-white"
                    onClick={() => handleAddFood(meal)}
                  >
                    <Plus size={24} strokeWidth={3} />
                  </Button>
                </div>

                <CardContent className="p-0">
                  <div className="divide-y divide-slate-800/50">
                    {dailyLog[meal].map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-6
                          transition-colors hover:bg-slate-800/20"
                      >
                        <div className="flex flex-col">
                          <span className="text-xl font-bold tracking-tight">
                            {f.name}
                          </span>
                          <span
                            className="text-[11px] font-black tracking-widest
                              text-slate-500 uppercase"
                          >
                            EST. {f.calories} KCAL
                          </span>
                        </div>
                        <Button
                          size="lg"
                          onClick={() => handleLogAsEaten(meal, i)}
                          className="bg-emerald-600 px-6 font-black shadow-lg
                            shadow-emerald-900/20 hover:bg-emerald-500"
                        >
                          <Check size={18} className="mr-2" strokeWidth={3} />
                          LOG
                        </Button>
                      </div>
                    ))}
                    {dailyLog[meal].length === 0 && (
                      <div className="p-16 text-center">
                        <p
                          className="text-xs font-black tracking-[0.5em]
                            text-slate-800 uppercase italic opacity-20"
                        >
                          Empty Plate
                        </p>
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
