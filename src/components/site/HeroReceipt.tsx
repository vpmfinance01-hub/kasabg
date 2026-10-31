import { IcoCheck } from "./Icons";

const lines: [string, string, string][] = [
  ["Керамична чаша", "2 × 8.70", "17.40"],
  ["Комплект чинии", "1 × 45.00", "45.00"],
  ["Доставка", "1 × 4.17", "4.17"],
];

/** Анимирана бележка за началната страница: печата се ред по ред, после я подпечатва. */
export default function HeroReceipt() {
  return (
    <div className="relative mx-auto h-[520px] w-full max-w-[420px]" aria-hidden>
      <div className="floaty absolute left-1/2 top-0 w-[290px] -translate-x-1/2">
        <div className="rc zig-bottom bg-[#fcfcfc] px-6 pt-6 font-mono text-[12px] leading-relaxed text-[#161616] shadow-[0_30px_40px_-24px_rgba(60,30,10,0.55)]">
          <div className="rc-line text-center text-[13px] font-bold tracking-wide" style={{ "--i": 0 } as React.CSSProperties}>ЕЛЕКТРОННА КАСОВА БЕЛЕЖКА</div>
          <div className="rc-line my-2 border-t border-dashed border-[#b88a00]" style={{ "--i": 1 } as React.CSSProperties} />
          <div className="rc-line text-center font-bold" style={{ "--i": 1 } as React.CSSProperties}>Керамика Родопи ЕООД</div>
          <div className="rc-line text-center text-[11px] text-[#6b6b6b]" style={{ "--i": 2 } as React.CSSProperties}>онлайн магазин · keramika.example</div>
          <div className="rc-line my-2 border-t border-dashed border-[#b88a00]" style={{ "--i": 2 } as React.CSSProperties} />
          <div className="rc-line flex justify-between" style={{ "--i": 3 } as React.CSSProperties}><span>Бележка №</span><span>0000000127</span></div>
          <div className="rc-line flex justify-between" style={{ "--i": 3 } as React.CSSProperties}><span>Поръчка</span><span>#4821</span></div>
          <div className="rc-line my-2 border-t border-dashed border-[#b88a00]" style={{ "--i": 4 } as React.CSSProperties} />
          {lines.map(([n, q, p], k) => (
            <div key={n} className="rc-line mb-1" style={{ "--i": 5 + k } as React.CSSProperties}>
              <div className="font-bold">{n}</div>
              <div className="flex justify-between"><span>{q}</span><span>{p}</span></div>
            </div>
          ))}
          <div className="rc-line my-2 border-t border-dashed border-[#b88a00]" style={{ "--i": 8 } as React.CSSProperties} />
          <div className="rc-line flex justify-between text-[15px] font-bold text-[#f2b705]" style={{ "--i": 9 } as React.CSSProperties}>
            <span>ОБЩА СУМА EUR</span>
            <span>66.57</span>
          </div>
          <div className="rc-line flex justify-between text-[11px] text-[#6b6b6b]" style={{ "--i": 9 } as React.CSSProperties}><span>в т.ч. ДДС 20%</span><span>11.10</span></div>
          <div className="rc-line mt-2 pb-3 text-center text-[10px] text-[#6b6b6b]" style={{ "--i": 10 } as React.CSSProperties}>Не е фискален бон</div>
        </div>
        <div className="rc-stamp absolute -right-5 top-[338px] rotate-[-9deg] rounded-md border-[3px] border-[#0f7f79] px-3 py-1 font-mono text-sm font-bold tracking-widest text-[#0f7f79]">
          ИЗПРАТЕНА
        </div>
      </div>

      <div className="rc-chip absolute -left-2 bottom-24 flex items-center gap-2 rounded-xl border border-[#dcdcdc] bg-[#fcfcfc] px-3.5 py-2.5 text-sm shadow-[0_14px_30px_-16px_rgba(60,30,10,0.5)]" style={{ "--ad": "3.4s" } as React.CSSProperties}>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0f7f79] text-white"><IcoCheck className="h-4 w-4" /></span>
        <span><b className="font-semibold">Клиентът</b> получи PDF</span>
      </div>
      <div className="rc-chip absolute -right-2 bottom-4 rounded-xl border border-[#dcdcdc] bg-[#1b1b1b] px-3.5 py-2.5 font-mono text-[12px] text-[#e8e8e8] shadow-[0_14px_30px_-16px_rgba(60,30,10,0.7)]" style={{ "--ad": "3.9s" } as React.CSSProperties}>
        audit-2026-10.xml
        <div className="mt-0.5 text-[10px] text-[#f2b705]">готов за подаване до 15-о</div>
      </div>
    </div>
  );
}
