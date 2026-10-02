import { useEffect, useState } from "react";

export function useMountEffect(effect: () => void | (() => void)) {
  const [mountEffect] = useState(() => effect);
  useEffect(mountEffect, [mountEffect]);
}
