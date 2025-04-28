import React from 'react';
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from '@/contexts/auth';

const AdminEvents = () => {
  const { isLoading: isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto py-10">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !Date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>Pick a date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            // selected={date}
            // onSelect={setDate}
            disabled={(date) =>
              date > new Date() || date < new Date("2023-01-01")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AdminEvents;
