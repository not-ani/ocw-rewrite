"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { toast } from "sonner";
import { XIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
} from "@/components/ui/kibo-ui/combobox";

const formSchema = z.object({
  name: z.string().min(3, "Lesson name must be at least 3 characters").max(200),
  unitId: z.string().min(1, "Please select a unit"),
  embedRaw: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateLessonInlineFormProps {
  courseId: Id<"courses">;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateLessonInlineForm({
  courseId,
  onSuccess,
  onCancel,
}: CreateLessonInlineFormProps) {
  const createLesson = useMutation(api.lesson.create);
  
  const units = useQuery(api.units.getTableData, { courseId });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      unitId: "",
      embedRaw: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const unitOptions = React.useMemo(() => {
    if (!units) return [];
    return units.map((unit) => ({
      label: unit.name,
      value: unit.id,
    }));
  }, [units]);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      await createLesson({
        courseId,
        unitId: values.unitId as Id<"units">,
        name: values.name,
        embedRaw: values.embedRaw,
      });
      toast.success("Lesson created successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to create lesson. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLoading = units === undefined;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Create New Lesson</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Variables and Data Types"
                      {...field}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit *</FormLabel>
                  <FormControl>
                    <Combobox
                      data={unitOptions}
                      type="unit"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <ComboboxTrigger className="w-full" />
                      <ComboboxContent>
                        <ComboboxInput />
                        <ComboboxList>
                          <ComboboxEmpty />
                          <ComboboxGroup>
                            {unitOptions.map((option) => (
                              <ComboboxItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </ComboboxItem>
                            ))}
                          </ComboboxGroup>
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </FormControl>
                  <FormDescription>
                    Select which unit this lesson belongs to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="embedRaw"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Embed URL or iFrame (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste embed URL or iframe code..."
                      className="resize-none font-mono text-xs"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can add this later if you prefer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Lesson"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
