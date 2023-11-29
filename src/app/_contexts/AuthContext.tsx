"use client";

import { SessionProvider, SessionProviderProps } from "next-auth/react";

type AuthProviderProps = SessionProviderProps;
export const AuthProvider = (props: AuthProviderProps) => (
  <SessionProvider {...props} />
);
