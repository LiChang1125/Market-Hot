import type { ReactNode } from "react";
import { Link } from "react-router";
import { PhoneBar } from "@aihot/web/components/shell/PhoneBar";
import "./tools.css";

export function ToolPage({ title, back, children }: { title: string; back?: {to:string; label:string}; children: ReactNode }) {
  return <div className="market-tool-page">
    <PhoneBar title={title} back={back} />
    {back && <Link className="market-back" to={back.to}>‹ {back.label}</Link>}
    <h1 data-page-title>{title}</h1>{children}
  </div>;
}
