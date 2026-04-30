import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AdminExercisesBank = ({
  loadingExerciseCategories,
  errorExerciseCategories,
  loadingExercises,
  errorExercises,
  exerciseCategories,
  bodyParts,
  bodyPartOptions,
  bankBodyPartFilter,
  setBankBodyPartFilter,
  categoryOptions,
  bankCategoryFilter,
  setBankCategoryFilter,
  filteredExerciseBank,
  bodyPartNameById,
  categoryNameById,
  formState,
  setFormState,
  handleSubmit,
  editingExerciseId,
  startEditing,
  clearForm,
  handleDelete,
  actionError,
  actionSuccess,
}) => {
  const handleFieldChange = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Exercise Bank Management</h1>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-lg font-semibold">
            {editingExerciseId ? "Edit Exercise" : "Add Exercise"}
          </h2>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formState.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  placeholder="Exercise name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Tutorial URL</label>
                <Input
                  value={formState.youtube_url}
                  onChange={(event) =>
                    handleFieldChange("youtube_url", event.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Muscle Group</label>
                <select
                  className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm"
                  value={formState.body_part_id}
                  onChange={(event) =>
                    handleFieldChange("body_part_id", event.target.value)
                  }
                >
                  <option value="">Select body part</option>
                  {(bodyParts || []).map((bodyPart) => (
                    <option key={bodyPart.body_part_id} value={bodyPart.body_part_id}>
                      {bodyPart.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm"
                  value={formState.category_id}
                  onChange={(event) =>
                    handleFieldChange("category_id", event.target.value)
                  }
                >
                  <option value="">Select category</option>
                  {(exerciseCategories || []).map((category) => (
                    <option key={category.category_id} value={category.category_id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit">
                {editingExerciseId ? "Save Changes" : "Add Exercise"}
              </Button>
              <Button type="button" variant="outline" onClick={clearForm}>
                Cancel
              </Button>
            </div>
          </form>
          {actionError ? (
            <p className="text-destructive text-sm">{actionError}</p>
          ) : null}
          {actionSuccess ? (
            <p className="text-sm text-emerald-600">{actionSuccess}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Muscle Group</label>
            <select
              className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm"
              value={bankBodyPartFilter}
              onChange={(event) => setBankBodyPartFilter(event.target.value)}
            >
              {bodyPartOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Category</label>
            <select
              className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm"
              value={bankCategoryFilter}
              onChange={(event) => setBankCategoryFilter(event.target.value)}
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {errorExerciseCategories || errorExercises ? (
        <p className="flex flex-1 items-center justify-center">
          error: {errorExercises || errorExerciseCategories}
        </p>
      ) : loadingExerciseCategories || loadingExercises || !exerciseCategories ? (
        <p className="flex flex-1 items-center justify-center">Loading Exercises</p>
      ) : (
        <div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredExerciseBank.map((exercise) => (
              <Card key={exercise.exercise_id}>
                <CardContent className="space-y-3 p-4">
                  <h3 className="text-lg font-semibold">{exercise.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
                      Body Part:{" "}
                      {exercise.body_part ||
                        bodyPartNameById[exercise.body_part_id] ||
                        "N/A"}
                    </span>
                    <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
                      Category:{" "}
                      {exercise.category ||
                        categoryNameById[exercise.category_id] ||
                        "N/A"}
                    </span>
                  </div>
                  {exercise.youtube_url ? (
                    <a
                      href={exercise.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary inline-flex text-sm font-medium underline-offset-4 hover:underline"
                    >
                      Watch Tutorial
                    </a>
                  ) : null}
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => startEditing(exercise)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(exercise.exercise_id)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredExerciseBank.length === 0 && (
            <Card>
              <CardContent className="text-muted-foreground p-6 text-center">
                No exercises match the selected filters.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminExercisesBank;
