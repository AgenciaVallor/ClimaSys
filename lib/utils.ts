import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateBTU(area: number, people: number, electronics: number, sunExposure: 'low' | 'high') {
  const baseBtu = sunExposure === 'high' ? 800 : 600;
  let btu = area * baseBtu;
  if (people > 1) {
    btu += (people - 1) * 600;
  }
  btu += electronics * 600;
  return btu;
}

