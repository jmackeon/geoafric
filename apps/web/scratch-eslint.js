const { ESLint } = require("eslint");
const fs = require("fs");
const path = require("path");

async function main() {
  const eslint = new ESLint({
    cwd: __dirname
  });
  
  const results = await eslint.lintFiles(["src/**/*.{js,jsx,ts,tsx}"]);
  
  const formatter = await eslint.loadFormatter("json");
  const resultText = formatter.format(results);
  
  fs.writeFileSync(path.join(__dirname, "eslint-results.json"), resultText);
  console.log("Done. Results saved to eslint-results.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
