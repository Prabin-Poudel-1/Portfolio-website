/** Cubic contours traced from the supplied joined-hands reference (1534 × 1547).
 * Fingers overlap in profile: they are not four separated, front-facing digits.
 * Pixel-space anatomy is sampled once, then corrected for the hero projection.
 */
type Curve = readonly [number, number, number, number, number, number, number, number];
const leftOutline: readonly Curve[] = [
  [345,1265, 405,1230, 465,1182, 486,1124],
  [486,1124, 518,1020, 518,927, 530,862],
  [530,862, 550,750, 592,674, 608,602],
  [608,602, 621,555, 630,524, 641,482],
  [641,482, 651,426, 665,372, 675,332],
  [675,332, 682,300, 694,250, 704,234],
  [704,234, 730,231, 754,243, 758,280],
  [758,280, 757,345, 752,401, 755,470],
  [755,470, 758,514, 763,535, 758,581],
  [758,581, 753,625, 762,653, 758,686],
  [758,686, 754,763, 755,847, 767,923],
  [767,923, 770,1007, 772,1080, 768,1126],
  [768,1126, 753,1212, 727,1274, 645,1315],
  [645,1315, 550,1302, 425,1276, 345,1265],
];
const rightOutline: readonly Curve[] = [
  [1200,1235, 1148,1207, 1072,1163, 1049,1110],
  [1049,1110, 1029,1042, 1026,1009, 1018,942],
  [1018,942, 1007,859, 1007,803, 984,757],
  [984,757, 949,693, 943,642, 922,589],
  [922,589, 898,526, 885,490, 875,443],
  [875,443, 863,395, 846,360, 842,332],
  [842,332, 838,292, 832,249, 825,235],
  [825,235, 804,233, 771,249, 762,281],
  [762,281, 760,340, 763,405, 760,466],
  [760,466, 759,508, 770,533, 765,581],
  [765,581, 761,625, 767,651, 763,687],
  [763,687, 764,766, 773,847, 771,923],
  [771,923, 771,1010, 775,1084, 773,1126],
  [773,1126, 788,1216, 816,1263, 903,1315],
  [903,1315, 990,1290, 1113,1258, 1200,1235],
];
const fingers: readonly Curve[] = [
  [591,822, 594,775, 620,744, 625,692],
  [625,692, 635,621, 665,537, 675,452],
  [675,452, 681,422, 688,382, 691,365],
  [691,365, 713,345, 744,350, 753,383],
  [753,383, 759,405, 757,443, 756,468],
  [948,793, 925,743, 911,689, 895,645],
  [895,645, 878,594, 864,524, 841,475],
  [841,475, 836,442, 824,402, 817,384],
  [817,384, 795,371, 772,385, 762,408],
  [762,408, 755,424, 756,447, 759,467],
];
const thumbs: readonly Curve[] = [
  [671,855, 676,786, 682,725, 687,682],
  [687,682, 695,640, 698,572, 706,523],
  [706,523, 733,513, 751,527, 760,553],
  [879,865, 862,812, 841,748, 837,703],
  [837,703, 834,658, 815,618, 815,535],
  [815,535, 792,529, 768,534, 761,555],
];
const detail: readonly Curve[] = [
  // Narrow nails follow the stacked finger profiles and the two front thumbs.
  [704,235, 714,236, 720,244, 716,257],
  [716,257, 707,281, 707,321, 691,330],
  [691,330, 685,334, 680,335, 675,332],
  [825,237, 814,239, 807,246, 810,260],
  [810,260, 817,297, 821,326, 841,333],
  [691,367, 705,368, 714,373, 708,393],
  [708,393, 701,420, 699,445, 675,452],
  [817,386, 807,390, 799,396, 804,408],
  [804,408, 816,440, 820,466, 841,475],
  [706,526, 717,528, 729,526, 725,543],
  [725,543, 719,576, 716,596, 698,600],
  [815,540, 808,538, 797,542, 799,556],
  [799,556, 798,589, 803,600, 818,608],
  // Sparse knuckle creases, not a second set of finger outlines.
  [658,407, 665,407, 669,411, 672,415],
  [610,562, 620,558, 627,559, 635,562],
  [607,580, 614,581, 620,582, 626,582],
  [638,643, 646,641, 650,641, 659,644],
  [679,764, 686,765, 692,768, 700,771],
  [865,429, 869,428, 873,426, 877,424],
  [916,601, 922,598, 928,597, 933,596],
  [873,653, 882,644, 887,642, 899,646],
  [838,782, 844,779, 849,777, 854,778],
];
type Path = { xy: Float64Array; lengths: Float64Array; length: number };
function flatten(curves: readonly Curve[]): Path {
  const xy = new Float64Array(curves.length * 49 * 2);
  const lengths = new Float64Array(xy.length / 2);
  let i = 0, length = 0;
  for (const c of curves) for (let j = 0; j <= 48; j++) {
    const t = j / 48, a = 1 - t;
    const x = a*a*a*c[0] + 3*a*a*t*c[2] + 3*a*t*t*c[4] + t*t*t*c[6];
    const y = a*a*a*c[1] + 3*a*a*t*c[3] + 3*a*t*t*c[5] + t*t*t*c[7];
    // Disconnected crease paths must not draw straight joining strokes.
    if (i && j) length += Math.hypot(x - xy[(i-1)*2], y - xy[(i-1)*2+1]);
    xy[i*2] = x; xy[i*2+1] = y; lengths[i++] = length;
  }
  return { xy, lengths, length };
}
let boundaries: readonly Path[] | undefined, digits: Path | undefined, thumbLines: Path | undefined, details: Path | undefined;
const seed = (index: number, salt: number) => {
  const n = Math.sin((index + 1) * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
};
function inside(x: number, y: number, path: Path) {
  let result = false;
  for (let i = 0, j = path.lengths.length - 1; i < path.lengths.length; j = i++) {
    const ax = path.xy[i*2], ay = path.xy[i*2+1], bx = path.xy[j*2], by = path.xy[j*2+1];
    if ((ay > y) !== (by > y) && x < (bx-ax)*(y-ay)/(by-ay)+ax) result = !result;
  }
  return result;
}

export type HandPoint = { x: number; y: number; z: number; feature: 'outline' | 'finger' | 'thumb' | 'crease' | 'surface' };
export function sampleNamaste(index: number, kind: number): HandPoint {
  boundaries ??= [flatten(leftOutline), flatten(rightOutline)];
  digits ??= flatten(fingers); thumbLines ??= flatten(thumbs); details ??= flatten(detail);
  const side = index % 2, assignment = seed(index, 30);
  const feature = kind < .5 ? (assignment < .46 ? 'outline' : assignment < .70 ? 'finger' : assignment < .87 ? 'thumb' : 'crease')
    : kind < .75 ? (assignment < .20 ? 'finger' : assignment < .34 ? 'thumb' : assignment < .44 ? 'crease' : 'surface') : 'surface';
  let x = side ? 860 : 670, y = 900;
  if (feature === 'surface') {
    // Surface samples stay inside the traced hand, including the open wrist gap.
    // Reserve a narrow negative-space channel around the central contact seam.
    const boundary = boundaries[side];
    for (let attempt = 0; attempt < 96; attempt++) {
      const px = 345 + seed(index, 40 + attempt*2) * 855;
      const py = 234 + seed(index, 41 + attempt*2) * 1081;
      if (Math.abs(px - 765) > 10 && inside(px, py, boundary)) { x = px; y = py; break; }
    }
  } else {
    const path = feature === 'outline' ? boundaries[side] : feature === 'finger' ? digits : feature === 'thumb' ? thumbLines : details;
    const distance = seed(index, 31) * path.length;
    let low = 1, high = path.lengths.length - 1;
    while (low < high) { const mid = (low + high) >> 1; if (path.lengths[mid] < distance) low = mid + 1; else high = mid; }
    const span = path.lengths[low] - path.lengths[low-1];
    const t = span > 0 ? (distance - path.lengths[low-1]) / span : 0;
    x = path.xy[(low-1)*2] + (path.xy[low*2] - path.xy[(low-1)*2]) * t;
    y = path.xy[(low-1)*2+1] + (path.xy[low*2+1] - path.xy[(low-1)*2+1]) * t;
  }
  const relief = feature === 'thumb' ? .045 : feature === 'finger' ? .025 : 0;
  const z = relief + (seed(index, 33) - .5) * (feature === 'surface' ? .06 : .008) + (x < 765 ? -.008 : .008);
  // Counter the desktop projection's 460:340 scale; keep the reference proportions.
  return { x: (x - 768) / (650 * 460 / 340), y: (y - 775) / 650, z, feature };
}
