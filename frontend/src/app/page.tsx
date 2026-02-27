"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();
    router.replace(session?.token ? "/plants" : "/auth/login");
  }, [router]);

  return null;
}
