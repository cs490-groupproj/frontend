import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import { Loader2, Activity, Plus, Check, Flame } from "lucide-react";

const NutritionPage = () => {
  const currentUserId = localStorage.getItem("userId");
  const dailyCalorieGoal = 2500;
  const MEAL_TYPE_MAP = { Breakfast: 1, Lunch: 2, Dinner: 3 };

  /**
   * REUSABLE API HELPER
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

      let data = null;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textError = await response.text();
        if (!response.ok) console.warn("Raw Server Response:", textError);
      }

      return { ok: response.ok, status: response.status, data };
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

  // INITIAL SYNC
  useEffect(() => {
    if (!currentUserId) return;

    const fetchExistingPlan = async () => {
      try {
        const { ok, data } = await apiFetch(
          `/nutrition/plans/plans_by_user?user_id=${currentUserId}`
        );
        if (ok && data?.meal_plans?.length > 0) {
          setMealPlanId(data.meal_plans[0].meal_plan_id);
        }
      } catch (e) {
        console.log("Initial Sync Error: Server unreachable or no plan.");
      }
    };
    fetchExistingPlan();
  }, [currentUserId]);

  // --- HANDLERS ---

  /**
   * FIXED: Key changed to 'meal_datetime' based on console error
   */
  const handleStartNewPlan = async () => {
    if (!currentUserId) return alert("Please log in to track nutrition.");
    setLoading(true);

    // Format: YYYY-MM-DDTHH:MM:SS
    const timestamp = new Date().toISOString().split(".")[0];

    try {
      const { ok, status, data } = await apiFetch("/nutrition/plans/create", {
        method: "POST",
        body: JSON.stringify({
          user_id: String(currentUserId).trim(),
          meal_datetime: timestamp, // <-- Exact key required by your backend
        }),
      });

      if (ok && data) {
        setMealPlanId(data.meal_plan_id);
        setDailyLog({ Breakfast: [], Lunch: [], Dinner: [] });
        setLoggedCalories(0);
        console.log("Success! New Plan ID:", data.meal_plan_id);
      } else {
        console.error(
          `Backend Status ${status}:`,
          data?.error || "Plan creation failed."
        );
        alert(`Error: ${data?.error || "Check console for details."}`);
      }
    } catch (error) {
      console.error("Critical Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFood = async (mealType) => {
    const name = searchInputs[mealType];
    if (!name.trim()) return;

    const testFdcId = 1103374;
    setDailyLog((prev) => ({
      ...prev,
      [mealType]: [
        ...prev[mealType],
        { name, calories: 450, fdc_id: testFdcId },
      ],
    }));
    setSearchInputs((prev) => ({ ...prev, [mealType]: "" }));

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
      const { ok } = await apiFetch(
        `/nutrition/plans/${mealPlanId}/log_eaten`,
        {
          method: "POST",
          body: JSON.stringify({
            meal_type_id: MEAL_TYPE_MAP[mealType],
            fdc_id: item.fdc_id,
          }),
        }
      );

      if (ok) {
        setLoggedCalories((prev) => prev + item.calories);
        setDailyLog((prev) => ({
          ...prev,
          [mealType]: prev[mealType].filter((_, i) => i !== index),
        }));
      }
    }
  };

  const progress = (loggedCalories / dailyCalorieGoal) * 100;

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
                className="text-4xl leading-none font-black tracking-tighter
                  uppercase italic md:text-5xl"
              >
                Fuel Tracker
              </h1>
              <p
                className="mt-1 text-[10px] font-bold tracking-widest
                  text-slate-500 uppercase"
              >
                User:{" "}
                {currentUserId ? currentUserId.slice(0, 8) : "LOG_IN_REQUIRED"}
                ...
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
              className="h-4 rounded-full bg-slate-800 [&>div]:bg-rose-600"
            />
          </CardContent>
        </Card>

        {/* Reset Button */}
        <Button
          onClick={handleStartNewPlan}
          disabled={loading || !currentUserId}
          className="mb-12 h-20 w-full bg-rose-600 text-xl font-black
            tracking-widest uppercase transition-all hover:bg-rose-700
            active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Reset Daily Plan"}
        </Button>

        {/* Meal Sections */}
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
                    placeholder={`Search ${meal}...`}
                    className="focus:visible:ring-0 h-16 border-none
                      bg-transparent text-lg font-medium text-slate-50
                      placeholder:text-slate-600"
                    value={searchInputs[meal]}
                    onChange={(e) =>
                      setSearchInputs((p) => ({ ...p, [meal]: e.target.value }))
                    }
                  />
                  <Button
                    variant="ghost"
                    className="mr-2 h-12 w-12 text-rose-500 transition-colors
                      hover:bg-rose-600 hover:text-white"
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
                          hover:bg-slate-800/20"
                      >
                        <div className="flex flex-col">
                          <span className="text-xl font-bold">{f.name}</span>
                          <span
                            className="text-[11px] font-black text-slate-500
                              uppercase"
                          >
                            ~{f.calories} KCAL
                          </span>
                        </div>
                        <Button
                          size="lg"
                          onClick={() => handleLogAsEaten(meal, i)}
                          className="bg-emerald-600 px-6 font-black
                            hover:bg-emerald-500"
                        >
                          <Check size={18} className="mr-2" strokeWidth={3} />{" "}
                          LOG
                        </Button>
                      </div>
                    ))}
                    {dailyLog[meal].length === 0 && (
                      <div
                        className="p-16 text-center text-xs font-black
                          tracking-widest uppercase italic opacity-20"
                      >
                        No Items Logged
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
