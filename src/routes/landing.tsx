import { createFileRoute } from "@tanstack/react-router";
import HalamanLanding from "@/pages/landing-page";

export const Route = createFileRoute("/landing")({
	component: HalamanLanding,
});
