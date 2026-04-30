import React, { useMemo, useState } from "react";
import useGetFromAPI from "@/hooks/useGetFromAPI";
import usePostToAPI from "@/hooks/usePostToAPI";
import usePutToAPI from "@/hooks/usePutToAPI";
import useDeleteFromAPI from "@/hooks/useDeleteFromAPI";
import AdminExercisesBank from "./components/AdminExercisesBank";

const emptyForm = {
  name: "",
  body_part_id: "",
  category_id: "",
  youtube_url: "",
};

const AdminExerciseBankView = () => {
  const [bankBodyPartFilter, setBankBodyPartFilter] = useState("All");
  const [bankCategoryFilter, setBankCategoryFilter] = useState("All");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [formState, setFormState] = useState(emptyForm);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const { postFunction } = usePostToAPI();
  const { putFunction } = usePutToAPI();
  const { deleteFunction } = useDeleteFromAPI();

  const {
    data: exercisesCatalog,
    loading: loadingExercises,
    error: errorExercises,
  } = useGetFromAPI("/exercises", refreshKey);
  const { data: bodyParts } = useGetFromAPI("/body-parts", null);
  const {
    data: exerciseCategories,
    loading: loadingExerciseCategories,
    error: errorExerciseCategories,
  } = useGetFromAPI("/exercise-categories", null);

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

  const clearForm = () => {
    setEditingExerciseId(null);
    setFormState(emptyForm);
  };

  const startEditing = (exercise) => {
    setEditingExerciseId(exercise.exercise_id);
    setFormState({
      name: exercise.name || "",
      body_part_id: exercise.body_part_id ? String(exercise.body_part_id) : "",
      category_id: exercise.category_id ? String(exercise.category_id) : "",
      youtube_url: exercise.youtube_url || "",
    });
    setActionError("");
    setActionSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setActionError("");
    setActionSuccess("");

    if (!formState.name.trim()) {
      setActionError("Exercise name is required.");
      return;
    }
    if (!formState.body_part_id) {
      setActionError("Body part is required.");
      return;
    }
    if (!formState.category_id) {
      setActionError("Category is required.");
      return;
    }

    const payload = {
      name: formState.name.trim(),
      body_part_id: Number(formState.body_part_id),
      category_id: Number(formState.category_id),
      youtube_url: formState.youtube_url.trim() || null,
    };

    try {
      if (editingExerciseId) {
        await putFunction(`/exercises/${editingExerciseId}`, payload);
        setActionSuccess("Exercise updated.");
      } else {
        await postFunction("/exercises", payload);
        setActionSuccess("Exercise created.");
      }
      clearForm();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      setActionError(error?.message || "Failed to save exercise.");
    }
  };

  const handleDelete = async (exerciseId) => {
    setActionError("");
    setActionSuccess("");
    try {
      await deleteFunction(`/exercises/${exerciseId}`);
      if (editingExerciseId === exerciseId) {
        clearForm();
      }
      setActionSuccess("Exercise removed.");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      setActionError(error?.message || "Failed to remove exercise.");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col space-y-6">
      <AdminExercisesBank
        loadingExerciseCategories={loadingExerciseCategories}
        errorExerciseCategories={errorExerciseCategories}
        loadingExercises={loadingExercises}
        errorExercises={errorExercises}
        exerciseCategories={exerciseCategories}
        bodyParts={bodyParts}
        bodyPartOptions={bodyPartOptions}
        bankBodyPartFilter={bankBodyPartFilter}
        setBankBodyPartFilter={setBankBodyPartFilter}
        categoryOptions={categoryOptions}
        bankCategoryFilter={bankCategoryFilter}
        setBankCategoryFilter={setBankCategoryFilter}
        filteredExerciseBank={filteredExerciseBank}
        bodyPartNameById={bodyPartNameById}
        categoryNameById={categoryNameById}
        formState={formState}
        setFormState={setFormState}
        handleSubmit={handleSubmit}
        editingExerciseId={editingExerciseId}
        startEditing={startEditing}
        clearForm={clearForm}
        handleDelete={handleDelete}
        actionError={actionError}
        actionSuccess={actionSuccess}
      />
    </div>
  );
};

export default AdminExerciseBankView;
