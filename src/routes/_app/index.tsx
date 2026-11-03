import { createFileRoute } from "@tanstack/react-router";
import SalesDashboard from "@/pages/sales-dashboard";

export const Route = createFileRoute("/_app/")({
	component: SalesDashboard,
});
