"use client";

import React from "react";
import { SWRConfig } from "swr";

type DataProviderProps = React.ComponentProps<typeof SWRConfig>;
export const DataProvider = (props: DataProviderProps) => (
  <SWRConfig
    {...props}
    value={{
      fetcher: (input, init) =>
        fetch(input, init).then((response) => response.json()),
    }}
  />
);
