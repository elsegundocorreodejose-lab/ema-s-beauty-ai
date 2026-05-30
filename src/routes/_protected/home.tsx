import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMaternidad } from "@/lib/maternidad/store";

export const Route = createFileRoute("/_protected/home")({
  component: HomeRedirect,
});

function HomeRedirect() {
  const { currentUser } = useMaternidad();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate({ to: "/auth" });
      return;
    }
    if (currentUser.role === "admin") {
      navigate({ to: "/hub" });
    } else {
      navigate({ to: "/technician" });
    }
  }, [currentUser, navigate]);

  return null;
}
