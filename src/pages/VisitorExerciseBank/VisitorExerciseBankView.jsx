import React, { useMemo, useState } from "react";

import useGetPublicAPI from "@/hooks/useGetPublicAPI";
import VisitorExercisesBank from "./components/VisitorExercisesBank";

const VisitorExerciseBankView = () => {
  const [bankBodyPartFilter, setBankBodyPartFilter] = useState("All");
  const [bankCategoryFilter, setBankCategoryFilter] = useState("All");

  const { data: exercisesCatalog } = useGetPublicAPI(
    "/visitors/exercises",
    null
  );
  const { data: bodyParts } = useGetPublicAPI("/visitors/body-parts", null);
  const {
    data: exerciseCategories,
    loading: loadingExerciseCategories,
    error: errorExerciseCategories,
  } = useGetPublicAPI("/visitors/exercise-categories", null);

  const bodyPartNameById = useMemo(() => {
    if (!Array.isArray(bodyParts)) return {};
    return bodyParts.reduce((acc, part) => {
      acc[part.body_part_id] = part.name;
      return acc;
    }, {});
  }, [bodyParts]);

  const categoryNameById = useMemo(() => {
    if (!Array.isArray(exerciseCategories)) return {};
    return exerciseCategories.reduce((acc, category) => {
      acc[category.category_id] = category.name;
      return acc;
    }, {});
  }, [exerciseCategories]);

  const bodyPartOptions = useMemo(() => {
    const options = (exercisesCatalog || [])
      .map(
        (exercise) =>
          exercise.body_part || bodyPartNameById[exercise.body_part_id] || null
      )
      .filter(Boolean);
    return ["All", ...new Set(options)];
  }, [exercisesCatalog, bodyPartNameById]);

  const categoryOptions = useMemo(() => {
    const options = (exercisesCatalog || [])
      .map(
        (exercise) =>
          exercise.category || categoryNameById[exercise.category_id] || null
      )
      .filter(Boolean);
    return ["All", ...new Set(options)];
  }, [exercisesCatalog, categoryNameById]);

  const filteredExerciseBank = useMemo(() => {
    return (exercisesCatalog || []).filter((exercise) => {
      const bodyPart =
        exercise.body_part || bodyPartNameById[exercise.body_part_id] || "N/A";
      const category =
        exercise.category || categoryNameById[exercise.category_id] || "N/A";
      const bodyPartMatch =
        bankBodyPartFilter === "All" || bodyPart === bankBodyPartFilter;
      const categoryMatch =
        bankCategoryFilter === "All" || category === bankCategoryFilter;
      return bodyPartMatch && categoryMatch;
    });
  }, [
    exercisesCatalog,
    bodyPartNameById,
    categoryNameById,
    bankBodyPartFilter,
    bankCategoryFilter,
  ]);

  return (
    <div
      className="bg-background mx-auto flex w-full max-w-7xl flex-col space-y-6
        pt-40"
    >
      <VisitorExercisesBank
        loadingExerciseCategories={loadingExerciseCategories}
        errorExerciseCategories={errorExerciseCategories}
        exerciseCategories={exerciseCategories}
        bodyPartOptions={bodyPartOptions}
        bankBodyPartFilter={bankBodyPartFilter}
        setBankBodyPartFilter={setBankBodyPartFilter}
        categoryOptions={categoryOptions}
        bankCategoryFilter={bankCategoryFilter}
        setBankCategoryFilter={setBankCategoryFilter}
        filteredExerciseBank={filteredExerciseBank}
        bodyPartNameById={bodyPartNameById}
        categoryNameById={categoryNameById}
      />
    </div>
  );
};

export default VisitorExerciseBankView;
