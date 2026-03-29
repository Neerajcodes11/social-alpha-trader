"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Auth is disabled for demo — redirect to home
export default function LoginPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/"); }, [router]);
  return null;
}
