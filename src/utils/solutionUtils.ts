
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

/**
 * Gets the translated text for difficulty levels
 */
export const getDifficultyText = (difficulty: string): string => {
  switch (difficulty) {
    case "easy": return "Fácil";
    case "medium": return "Normal";
    case "advanced": return "Avançado";
    default: return difficulty;
  }
};

/**
 * Gets the color class for difficulty levels
 */
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case "easy": return "bg-green-500";
    case "medium": return "bg-yellow-500";
    case "advanced": return "bg-orange-500";
    default: return "bg-gray-500";
  }
};
