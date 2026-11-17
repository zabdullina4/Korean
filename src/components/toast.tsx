import { useEffect } from 'react';
import { create } from 'zustand';

const useToast = create<{ msg: string | null; n: number }>(() => ({ msg: null, n: 0 }));

export function toast(msg: string) {
  useToast.setState((s) => ({ msg, n: s.n + 1 }));
}

export function Toast() {
  const { msg, n } = useToast();
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => useToast.setState({ msg: null }), 2800);
    return () => clearTimeout(t);
  }, [msg, n]);
  return (
    <div className="toast" role="status" hidden={!msg}>
      {msg}
    </div>
  );
}
