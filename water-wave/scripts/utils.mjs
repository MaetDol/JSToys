export function checkInsideUsingRayCasting(polygon, { x, y }) {
  let intersections = 0;

  for (let j = -1, i = 0; i < polygon.length; i++, j++) {
    const a = polygon.at(j);
    const b = polygon[i];

    // 세로 선상으로 두 점의 사이에 있다면, 수평으로 직선을 그어
    // 충돌하는지 확인할 수 있을 것이다
    const isAcrossY = a.y > y !== b.y > y;
    if (!isAcrossY) continue;

    // 확인하려는 좌표 기준 수평선을 그어, 두 점으로 이어진 직선에
    // 교차하는 점이 있는지 확인한다
    const vertexSlope = (a.x - b.x) / (a.y - b.y);
    const acrossXCoordinate = vertexSlope * (y - b.y) + b.x;

    // 양쪽 다 확인 할 필요 없이, 한 쪽(오른쪽) 만 확인해도 판별할 수 있다
    if (x < acrossXCoordinate) intersections++;
  }

  return intersections % 2 !== 0;
}
export function degToRadian(deg) {
  return deg * (Math.PI / 180);
}
export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}
export function getRotatedPoint(point, originPoint, radian) {
  const x = point.x - originPoint.x;
  const y = point.y - originPoint.y;

  const hypo = Math.sqrt(x ** 2 + y ** 2);
  const theta = Math.atan2(y, x);

  const movedX = originPoint.x + hypo * Math.cos(radian + theta);
  const movedY = originPoint.y + hypo * Math.sin(radian + theta);

  return { x: movedX, y: movedY };
}
