import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utilitário para combinar classes CSS do Tailwind de forma inteligente
 * Usado extensivamente com shadcn/ui
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
