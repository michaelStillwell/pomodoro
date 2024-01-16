Bun.serve({
	fetch(req) {
		return new Response(Bun.file("./index.html"));
	}
})
