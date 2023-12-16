"use client";

import { useIsClient } from "@uidotdev/usehooks";
import { PropsWithChildren } from "react";

// This make sure useLocalStorage() works!
// https://github.com/uidotdev/usehooks/issues/218#issuecomment-1835624086
export const IsClientOnlyComponent = (props: PropsWithChildren) => {
  const { children } = props;
  const isClient = useIsClient();
  return isClient ? children : null;
};
