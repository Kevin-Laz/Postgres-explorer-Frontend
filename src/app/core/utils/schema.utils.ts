// Limita un valor entre [min, max]
export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

// Rect de un elemento (cache-friendly)
export const rectOf = (el: Element | HTMLElement) =>
  el.getBoundingClientRect();

// Ubicación del mouse relativo a un elemento
export function toElementCoords(
  clientX: number,
  clientY: number,
  el: Element | HTMLElement
) {
  const r = rectOf(el);
  return { x: clientX - r.left, y: clientY - r.top };
}

// ¿El clientX/Y cae dentro del rect del elemento?
export function isInsideElement(
  clientX: number,
  clientY: number,
  el: Element | HTMLElement
) {
  const r = rectOf(el);
  return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
}

// Centra un elemento con (w,h) bajo el cursor
export function centerUnderCursor(
  clientX: number,
  clientY: number,
  el: Element | HTMLElement,     // sistema de referencia (dashboard o schema)
  boxW: number,
  opts?: { offsetX?: number; offsetY?: number }
) {
  const { x, y } = toElementCoords(clientX, clientY, el);
  const ox = opts?.offsetX ?? 0;
  const oy = opts?.offsetY ?? 0;
  return { x: x - boxW / 2 + ox, y: y + oy };
}

// Ajusta a una cuadricula, evita problemas con bordes que se salen
export function snapToGrid(x: number, y: number, grid = 8) {
  const sx = Math.round(x / grid) * grid;
  const sy = Math.round(y / grid) * grid;
  return { x: sx, y: sy };
}

// Calcula si un objeto se sale del canvas
export function isOutOfCanvas(
  pos: { x: number; y: number },
  box: { width: number; height: number },
  canvas: { w: number; h: number }
) {
  const outX = pos.x < 0 || pos.x + box.width > canvas.w;
  const outY = pos.y < 0 || pos.y + box.height > canvas.h;
  return outX || outY;
}

// Clamp de posición para que el box quede dentro del canvas
export function clampToCanvas(
  pos: { x: number; y: number },
  box: { width: number; height: number },
  canvas: { w: number; h: number }
) {
  const x = clamp(pos.x, 0, Math.max(0, canvas.w - box.width));
  const y = clamp(pos.y, 0, Math.max(0, canvas.h - box.height));
  return { x, y };
}

// Bloquea menú contextual mientras `isActive()` retorne true. Devuelve cleanup()
export function attachContextMenuBlocker(
  isActive: () => boolean,
  target: Document | HTMLElement = document
) {
  const handler = (e: Event) => {
    if (isActive()) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    return true;
  };
  target.addEventListener('contextmenu', handler, { capture: true });
  return () => target.removeEventListener('contextmenu', handler, { capture: true });
}
