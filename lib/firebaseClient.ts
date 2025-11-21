"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig";

const clientApp = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(clientApp);
