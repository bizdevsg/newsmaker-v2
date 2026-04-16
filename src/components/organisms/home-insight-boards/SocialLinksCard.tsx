import React from "react";
import { Card } from "@/components/atoms/Card";
import { SocialCircle } from "./SocialCircle";

type SocialLinksCardProps = {
  className?: string;
};

export function SocialLinksCard({ className = "" }: SocialLinksCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between gap-3 p-4">
        <SocialCircle label="Facebook" iconClassName="fa-brands fa-facebook-f" />
        <SocialCircle
          label="Instagram"
          iconClassName="fa-brands fa-instagram"
        />
        <SocialCircle label="TikTok" iconClassName="fa-brands fa-tiktok" />
        <SocialCircle label="X" iconClassName="fa-brands fa-x-twitter" />
        <SocialCircle label="YouTube" iconClassName="fa-brands fa-youtube" />
      </div>
    </Card>
  );
}
