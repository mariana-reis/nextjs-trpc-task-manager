"use client";

import { useState, type SubmitEvent } from "react";
import { z } from "zod";
import { useSaveTask } from "@/hooks/useTaskMutations";
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  taskFieldsSchema,
  type Task,
  type TaskFields,
} from "@/types/task";
import { cx } from "@/utils/cx";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { LinkButton } from "./ui/LinkButton";
import { cardStyles } from "./ui/styles";

type TaskFormProps = { task?: Task };

type FormValues = { title: string; description: string };
type FormField = keyof FormValues;
type FieldErrors = Partial<Record<FormField, string>>;

function clearFieldError(current: FieldErrors, field: FormField): FieldErrors {
  return current[field] ? { ...current, [field]: undefined } : current;
}

function submitTaskForm(
  event: SubmitEvent<HTMLFormElement>,
  values: FormValues,
  setFieldErrors: (errors: FieldErrors) => void,
  save: (values: TaskFields) => void,
) {
  event.preventDefault();

  const parsed = taskFieldsSchema.safeParse(values);
  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors;
    setFieldErrors({
      title: errors.title?.[0],
      description: errors.description?.[0],
    });
    return;
  }

  setFieldErrors({});
  save(parsed.data);
}

function getSubmitLabel(isPending: boolean, isEditing: boolean) {
  if (isPending) return "Saving…";
  return isEditing ? "Save changes" : "Create task";
}

function TaskFormError({ error }: { error: string | null | undefined }) {
  if (!error) return null;
  return <Alert>{error}</Alert>;
}

export function TaskForm({ task }: TaskFormProps) {
  const isEditing = task !== undefined;
  const [values, setValues] = useState<FormValues>({
    title: task?.title ?? "",
    description: task?.description ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { save, error, isPending } = useSaveTask(task);

  function handleFieldChange(field: FormField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => clearFieldError(current, field));
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    submitTaskForm(event, values, setFieldErrors, save);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cx(cardStyles, "space-y-6 p-6")}
    >
      <TaskFormError error={error} />

      <Field
        id="title"
        label="Title"
        value={values.title}
        onChange={(value) => handleFieldChange("title", value)}
        maxLength={TITLE_MAX_LENGTH}
        error={fieldErrors.title}
        placeholder="e.g. Prepare the weekly report"
      />

      <Field
        id="description"
        label="Description"
        value={values.description}
        onChange={(value) => handleFieldChange("description", value)}
        maxLength={DESCRIPTION_MAX_LENGTH}
        error={fieldErrors.description}
        placeholder="Add more details"
        optional
        multiline
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <LinkButton href="/" variant="secondary">
          Cancel
        </LinkButton>
        <Button type="submit" loading={isPending}>
          {getSubmitLabel(isPending, isEditing)}
        </Button>
      </div>
    </form>
  );
}
