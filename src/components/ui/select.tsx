
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-white text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1 bg-white",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

// Create a new component for the split age selector
interface SplitAgeSelectProps {
  value?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

const SplitAgeSelect = React.forwardRef<
  HTMLDivElement,
  SplitAgeSelectProps
>(({ value, onValueChange, disabled, className }, ref) => {
  // Break down the age into sections (e.g., days/months/years)
  const [days, setDays] = React.useState<number | undefined>(undefined);
  const [months, setMonths] = React.useState<number | undefined>(undefined);
  const [years, setYears] = React.useState<number | undefined>(undefined);
  
  // Update the component when the value changes from outside
  React.useEffect(() => {
    if (value !== undefined) {
      // For this example, we'll consider value as total days
      // and convert it to a days/months/years representation
      const totalDays = value;
      const calculatedYears = Math.floor(totalDays / 365);
      const remainingDays = totalDays - (calculatedYears * 365);
      const calculatedMonths = Math.floor(remainingDays / 30);
      const finalDays = remainingDays - (calculatedMonths * 30);
      
      setYears(calculatedYears);
      setMonths(calculatedMonths);
      setDays(finalDays);
    }
  }, [value]);
  
  // Update the total age when any section changes
  const updateAge = React.useCallback((d: number | undefined, m: number | undefined, y: number | undefined) => {
    if (onValueChange && d !== undefined && m !== undefined && y !== undefined) {
      // Convert back to total days for the parent component
      const totalDays = (y * 365) + (m * 30) + d;
      onValueChange(totalDays);
    }
  }, [onValueChange]);
  
  // Handle changes to each section
  const handleDaysChange = (value: string) => {
    const newDays = parseInt(value, 10);
    setDays(newDays);
    updateAge(newDays, months, years);
  };
  
  const handleMonthsChange = (value: string) => {
    const newMonths = parseInt(value, 10);
    setMonths(newMonths);
    updateAge(days, newMonths, years);
  };
  
  const handleYearsChange = (value: string) => {
    const newYears = parseInt(value, 10);
    setYears(newYears);
    updateAge(days, months, newYears);
  };
  
  // Generate options for each dropdown
  const daysOptions = Array.from({ length: 31 }, (_, i) => i);
  const monthsOptions = Array.from({ length: 12 }, (_, i) => i);
  const yearsOptions = Array.from({ length: 120 }, (_, i) => i);
  
  return (
    <div 
      className={cn("flex items-center space-x-1", className)}
      ref={ref}
    >
      <Select
        disabled={disabled}
        value={days?.toString()}
        onValueChange={handleDaysChange}
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="DD" />
        </SelectTrigger>
        <SelectContent>
          {daysOptions.map((day) => (
            <SelectItem key={`day-${day}`} value={day.toString()}>
              {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <span className="text-lg font-medium">/</span>
      
      <Select
        disabled={disabled}
        value={months?.toString()}
        onValueChange={handleMonthsChange}
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {monthsOptions.map((month) => (
            <SelectItem key={`month-${month}`} value={month.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <span className="text-lg font-medium">/</span>
      
      <Select
        disabled={disabled}
        value={years?.toString()}
        onValueChange={handleYearsChange}
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="YYYY" />
        </SelectTrigger>
        <SelectContent>
          {yearsOptions.map((year) => (
            <SelectItem key={`year-${year}`} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
SplitAgeSelect.displayName = "SplitAgeSelect";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SplitAgeSelect,
}
