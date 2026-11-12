"use client";

import { BeautifulQRCode } from "@beautiful-qr-code/react";

export function QRCode({
  className,
  data,
  foregroundColor = "#f6ebd9",
}: {
  className?: string;
  data: string;
  foregroundColor?: string;
}) {
  return (
    <BeautifulQRCode
      backgroundColor="transparent"
      className={className}
      data={data}
      foregroundColor={foregroundColor}
      radius={1}
      type="svg"
    />
  );
}
