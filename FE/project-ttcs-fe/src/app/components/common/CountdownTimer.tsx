"use client";

import React, { useState, useEffect, Fragment } from "react";

export const CountdownTimer = () => {
  const [time, setTime] = useState({ h: 4, m: 22, s: 58 });

  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) {
          s = 59;
          m--;
        }
        if (m < 0) {
          m = 59;
          h--;
        }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex gap-1.5 ml-2">
      {[pad(time.h), pad(time.m), pad(time.s)].map((t, i) => (
        <Fragment key={i}>
          <span className="bg-slate-900 text-white w-9 h-9 border-b-2 border-blue-600 flex items-center justify-center rounded-lg text-sm font-black tracking-tighter">
            {t}
          </span>
          {i < 2 && <span className="text-slate-900 font-bold self-center">:</span>}
        </Fragment>
      ))}
    </div>
  );
};
