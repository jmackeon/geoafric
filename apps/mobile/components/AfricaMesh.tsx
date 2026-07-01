import Svg, { Path, Circle, Line } from 'react-native-svg';

interface AfricaMeshProps {
  width?: number;
  height?: number;
  opacity?: number;
}

export function AfricaMesh({ width = 200, height = 220, opacity = 0.12 }: AfricaMeshProps) {
  const nodes: [number, number][] = [
    [80,80],[120,60],[160,90],[100,120],[140,140],
    [80,160],[160,170],[120,200],[95,230],
  ];
  const lines: [number, number, number, number][] = [
    [80,80,120,60],[120,60,160,90],[80,80,100,120],[120,60,140,140],
    [160,90,140,140],[100,120,80,160],[100,120,140,140],[140,140,160,170],
    [80,160,120,200],[160,170,120,200],[120,200,95,230],[140,140,120,200],
  ];

  return (
    <Svg width={width} height={height} viewBox="0 0 240 260" opacity={opacity}>
      <Path fill="#F5A623"
        d="M120,8 C100,8 86,14 78,24 C66,36 62,46 56,60 C48,76 42,85 36,100 C30,116 26,130 24,146 C22,162 24,176 30,190 C36,204 46,212 52,224 C58,236 54,250 62,260 C70,268 84,272 96,271 C108,270 118,264 128,258 C140,252 150,248 158,240 C168,230 174,218 178,204 C182,190 184,176 186,162 C188,146 186,128 180,114 C174,100 164,90 156,78 C148,66 144,50 136,36 C128,22 124,8 120,8Z"
      />
      {lines.map(([x1, y1, x2, y2], i) => (
        <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="#00E6D2" strokeWidth="1" opacity={0.5} />
      ))}
      {nodes.map(([cx, cy], i) => (
        <Circle key={i} cx={cx} cy={cy} r={5} fill="#00E6D2" opacity={0.9} />
      ))}
      <Circle cx={120} cy={130} r={10} fill="#F5A623" />
      <Circle cx={120} cy={130} r={4}  fill="#080F20" />
    </Svg>
  );
}
