import { TaskForm } from "@/components/TaskForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NewTaskPage() {
  return (
    <>
      <PageHeader
        title="New task"
        description="Add a task to your list."
        backHref="/"
      />
      <TaskForm />
    </>
  );
}
