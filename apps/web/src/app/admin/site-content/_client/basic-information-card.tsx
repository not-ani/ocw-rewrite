"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const basicInfoSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  siteHero: z.string().optional(),
  siteLogo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  siteContributeLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

type BasicInformationCardProps = {
  school: string;
  schoolName: string;
  siteHero: string;
  siteLogo: string;
  siteContributeLink: string;
};

export function BasicInformationCard({
  school,
  schoolName,
  siteHero,
  siteLogo,
  siteContributeLink,
}: BasicInformationCardProps) {
  const updateBasicFields = useMutation(api.site.updateSiteConfigBasicFields);

  const form = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      schoolName: schoolName || "",
      siteHero: siteHero || "",
      siteLogo: siteLogo || "",
      siteContributeLink: siteContributeLink || "",
    },
  });

  const onSubmit = async (values: BasicInfoFormValues) => {
    try {
      await updateBasicFields({
        school,
        schoolName: values.schoolName,
        siteHero: values.siteHero || undefined,
        siteLogo: values.siteLogo || undefined,
        siteContributeLink: values.siteContributeLink || undefined,
      });
      toast.success("Basic information updated successfully");
    } catch (error) {
      toast.error("Failed to update basic information");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Update basic site information and branding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="schoolName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>School Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter school name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteHero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Hero Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter hero text for the homepage"
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
              name="siteLogo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Logo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteContributeLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contribute Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/contribute"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Basic Information"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
