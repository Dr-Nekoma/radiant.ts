build:
	deno bundle --config ./deno.json index.ts > index.js

serve:
	npx serve 
