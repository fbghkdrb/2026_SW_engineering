import { useRef, useEffect } from "react";

// 이전 렌더 값을 추적하는 범용 훅
const usePrevious = (value) => {
  const ref = useRef(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export default usePrevious;