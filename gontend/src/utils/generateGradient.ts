export default function generateGradient(stops: string[], resolution = 256) {
  const canvas = Object.assign(document.createElement('canvas'), { width: resolution, height: 16 });
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, resolution, 0);
  for (let i = 0; i < stops.length; i++) {
    grad.addColorStop(i / (stops.length - 1), stops[i]);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, resolution, 16);
  const imageData = ctx.getImageData(0, 0, resolution, 16).data;
  const output: string[] = [];
  for (let x = 0; x < resolution; x++) {
    const offset = x * 4;
    output.push(`rgb(${imageData[offset]}, ${imageData[offset + 1]}, ${imageData[offset + 2]})`);
  }
  return output;
}
