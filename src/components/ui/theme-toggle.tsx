
import { Moon, Sun, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10">
          {theme === "light" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ColorModeToggle() {
  const { colorMode, setColorMode } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10">
          <Eye className="h-5 w-5" />
          <span className="sr-only">Color blindness mode</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setColorMode("normal")}>
          Normal
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setColorMode("protanopia")}>
          Protanopia
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setColorMode("deuteranopia")}>
          Deuteranopia
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setColorMode("tritanopia")}>
          Tritanopia
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
