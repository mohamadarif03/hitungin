import { createFileRoute } from "@tanstack/react-router";
import AplikasiGuru from "@/pages/aplikasi-guru";

export const Route = createFileRoute("/guru")({
	component: AplikasiGuru,
});
