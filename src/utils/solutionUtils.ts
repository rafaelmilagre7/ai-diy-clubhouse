
import { slugify as baseSlugify, truncateSlug } from "./slugify";

/**
 * Utility functions for solution management
 */

/**
 * Converts a text string into a URL-friendly slug with a timestamp for uniqueness
 */
export const slugify = (text: string): string => {
  return baseSlugify(text, true);
};

/**
 * Creates a slug without a timestamp (for display or user-editable slugs)
 */
export const createSimpleSlug = (text: string): string => {
  return baseSlugify(text, false);
};

/**
 * Creates a unique slug with a timestamp and ensures it's not too long
 */
export const createUniqueSlug = (text: string, maxLength = 60): string => {
  const slug = baseSlugify(text, true);
  return truncateSlug(slug, maxLength);
};
