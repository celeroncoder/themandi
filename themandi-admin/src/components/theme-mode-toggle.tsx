"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LaptopMinimal, Moon, Sun } from "lucide-react";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <Select onValueChange={(val) => setTheme(val)}>
      <SelectTrigger className="w-full min-w-[180px]">
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          <Sun className="mr-1 inline w-4" /> Light
        </SelectItem>
        <SelectItem value="dark">
          <Moon className="mr-1 inline w-4" /> Dark
        </SelectItem>
        <SelectItem value="system">
          <LaptopMinimal className="mr-1 inline w-4" /> System
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
