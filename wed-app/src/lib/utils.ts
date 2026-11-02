import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM yyyy')
}

export function calculateAdvance(total: number, pct = 0.30): number {
  return Math.round(total * pct)
}

export function toShortPrice(n: number): string {
  if (n >= 100000) {
    const formatted = (n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)
    return `₹${formatted}L`
  }
  if (n >= 1000) {
    const formatted = (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)
    return `₹${formatted}K`
  }
  return `₹${n}`
}
