import * as React from "react"
import { format, parse, isValid } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/Components/ui/button"
import { Calendar } from "@/Components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/Components/ui/popover"

interface DatePickerProps {
    value?: string | null       // ISO date string YYYY-MM-DD or empty
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    clearable?: boolean
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Izberi datum",
    className,
    disabled,
    clearable = true,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false)

    const selected = React.useMemo(() => {
        if (!value) return undefined
        const d = new Date(value)
        return isValid(d) ? d : undefined
    }, [value])

    const handleSelect = (date: Date | undefined) => {
        if (date) {
            onChange(format(date, "yyyy-MM-dd"))
        } else {
            onChange("")
        }
        setOpen(false)
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange("")
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        "w-auto justify-start text-left font-normal",
                        !selected && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 size-4 shrink-0" />
                    <span>
                        {selected ? format(selected, "dd.MM.yyyy") : placeholder}
                    </span>
                    {clearable && selected && (
                        <X
                            className="ml-2 size-4 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={handleClear}
                        />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={handleSelect}
                    defaultMonth={selected}
                    captionLayout="dropdown"
                    fromYear={2000}
                    toYear={2050}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
