import { Outlet, createFileRoute } from "@tanstack/react-router";
import { authMiddleware } from "../../helpers/authMiddleware";

export const Route = createFileRoute("/(protected)/_layout")({
  component: ProtectedLayout,
  server: {
    middleware: [authMiddleware],
  },
});

function ProtectedLayout() {
  return <Outlet />;
}
