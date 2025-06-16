
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import type { EventFormData } from "./EventFormSchema";
import { ImageUpload } from "@/components/common/ImageUpload";

interface EventCoverImageProps {
  form: UseFormReturn<EventFormData>;
}

export const EventCoverImage = ({ form }: EventCoverImageProps) => {
  return (
    <FormField
      control={form.control}
      name="cover_image_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Imagem de Capa</FormLabel>
          <FormControl>
            <ImageUpload
              value={field.value}
              onChange={field.onChange}
              bucketName="event_images"
              folderPath="covers"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
