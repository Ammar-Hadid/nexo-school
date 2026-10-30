import { execFileSync } from 'node:child_process';
import { expect, it } from 'vitest';
it('isolates overlapping sprite rectangles without cutting out the intended cat', () => {
  const output = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
  import {inspectSprites} from './scripts/art/nexai/sprite-isolation.mjs';
  const width=360,height=200,data=new Uint8Array(width*height*4);
  function fill(x1,y1,x2,y2){for(let y=y1;y<y2;y++)for(let x=x1;x<x2;x++)data[(y*width+x)*4+3]=255;}
  fill(10,10,70,180);fill(10,120,160,180);fill(110,20,230,100);
  const sprites=inspectSprites({width,height,data});
  const target=sprites.find(s=>s.rect[0]===7);
  function contains(x,y){return [...target.path.matchAll(/M(\\d+) (\\d+)h(\\d+)v(\\d+)h-\\d+z/g)].some(m=>x>=+m[1]&&x<+m[1]+ +m[3]&&y>=+m[2]&&y<+m[2]+ +m[4]);}
  console.log(JSON.stringify({foreignBefore:target.foreignBefore,foreignAfter:target.foreignAfter,own:contains(20,50),other:contains(120,50)}));
 `,
    ],
    { encoding: 'utf8' },
  );
  const result = JSON.parse(output);
  expect(result.foreignBefore).toBeGreaterThan(0);
  expect(result.foreignAfter).toBe(0);
  expect(result.own).toBe(true);
  expect(result.other).toBe(false);
});
