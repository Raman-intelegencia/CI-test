// Vanilla JS, reusable, platform and project agnostic helper methods

// replaces all "*" with "•" for better formatted masks
export function replaceAsterisksWithDots(text = "") {
  const re = /\*/g;
  return text.replace(re,"•");
}

