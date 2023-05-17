build:
	deno bundle --config ./deno.json src/index.ts > index.js

serve:
	npx serve 
