/**
 * 사용법: npm run render -- <projectId>
 * 결과: out/<projectId>_<renderId>.mp4
 */
import { renderProject } from "../src/lib/render";

const id = process.argv[2];
if (!id) {
  console.error("usage: npm run render -- <projectId>");
  process.exit(1);
}

let last = -1;
renderProject(id, (p) => {
  const pct = Math.floor(p * 100);
  if (pct !== last && pct % 5 === 0) {
    last = pct;
    process.stdout.write(`\r렌더링 ${pct}%`);
  }
})
  .then((r) => {
    console.log(`\n완료: ${r.outputPath}`);
  })
  .catch((e) => {
    console.error("\n실패:", e.message);
    process.exit(1);
  });
