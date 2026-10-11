import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** clsx + tailwind-merge. Keeps caller overrides winning over component defaults. */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
