import type { TextareaHTMLAttributes } from "react";

interface AutoListTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
}

// 줄 시작(또는 줄바꿈 직후)에 "- "를 입력하면 자동으로 불렛(• )으로 변환한다.
export function AutoListTextarea({ value, onChange, ...rest }: AutoListTextareaProps) {
  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target;
    const raw = el.value;
    const cursor = el.selectionStart;
    const before = raw.slice(0, cursor);
    const match = before.match(/(^|\n)- $/);

    if (match) {
      const prefixLen = match[0].length;
      const bullet = `${match[1]}• `;
      const newValue = before.slice(0, before.length - prefixLen) + bullet + raw.slice(cursor);
      const newCursor = before.length - prefixLen + bullet.length;
      onChange(newValue);
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = newCursor;
      });
      return;
    }

    onChange(raw);
  }

  return <textarea value={value} onChange={handleChange} {...rest} />;
}
