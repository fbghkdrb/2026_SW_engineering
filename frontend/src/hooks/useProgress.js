import { useState, useEffect } from "react";
import { getProgress } from "../api/statsApi";

const useProgress = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await getProgress();
        setProgress(res.data.data);
      } catch {
        setError("진도율을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  return { progress, loading, error };
};

export default useProgress;
