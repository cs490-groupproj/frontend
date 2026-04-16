import { Card, CardContent } from "@/components/ui/card";

const ExerciseBankTab = ({
  bodyPartOptions,
  bankBodyPartFilter,
  setBankBodyPartFilter,
  categoryOptions,
  bankCategoryFilter,
  setBankCategoryFilter,
  filteredExerciseBank,
  bodyPartNameById,
  categoryNameById,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold">Exercise Bank</h1>
      </div>
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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filteredExerciseBank.map((exercise) => (
          <Card key={exercise.exercise_id}>
            <CardContent className="space-y-2 p-4">
              <h3 className="text-lg font-semibold">{exercise.name}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
                  Body Part: {exercise.body_part || bodyPartNameById[exercise.body_part_id] || "N/A"}
                </span>
                <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs">
                  Category:{" "}
                  {exercise.category || categoryNameById[exercise.category_id] || "N/A"}
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
  );
};

export default ExerciseBankTab;
