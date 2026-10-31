import { createContext } from "react";

/** Increments whenever the stage changes; stage headings take focus when it moves past 0. */
export const FocusContext = createContext(0);
