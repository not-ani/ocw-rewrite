"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import type { Id } from "@ocw-rewrite/backend/convex/_generated/dataModel";
import { toast } from "sonner";
import { XIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useSite } from "@/lib/multi-tenant/context";

const formSchema = z.object({
  unitName: z
    .string()
    .min(3, "Unit name must be at least 3 characters")
    .max(50),
  description: z.string().optional(),
  isPublished: z.boolean().default(false).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateUnitInlineFormProps {
  courseId: Id<"courses">;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateUnitInlineForm({
  courseId,
  onSuccess,
  onCancel,
}: CreateUnitInlineFormProps) {
  const createUnit = useMutation(api.units.create);
  const { subdomain } = useSite();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitName: "",
      description: "",
      isPublished: false,
    },
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      await createUnit({
        courseId,
        school: subdomain,
        unitName: values.unitName,
        description: values.description,
        isPublished: values.isPublished,
      });
      toast.success("Unit created successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to create unit. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Create New Unit</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="h-8 w-8"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="unitName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Introduction to Programming"
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
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of this unit..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    Publish immediately
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Unit"
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
    </div>
  );
}
