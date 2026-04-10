import React from "react";
import { Card } from "../atoms/Card";
import { ListItem } from "../molecules/ListItem";
import type { Locale, Messages } from "@/locales";
import {
  formatRegulatoryWatchDate,
  resolveRegulatoryWatchTag,
  resolveRegulatoryWatchTitle,
} from "@/lib/regulatory-watch";
import { fetchRegulatoryWatchList } from "@/lib/regulatory-watch.server";
import { SectionHeader } from "../molecules/SectionHeader";

type RegulatoryWatchProps = {
  messages: Messages;
  locale?: Locale;
};

export async function RegulatoryWatch({
  messages,
  locale = "id",
}: RegulatoryWatchProps) {
  const apiItems = await fetchRegulatoryWatchList();
  const items =
    apiItems.length > 0
      ? apiItems.slice(0, 3).map((item, index) => {
          const slug = item.slug?.trim();

          return {
            key: slug ?? String(item.id ?? index),
            title: resolveRegulatoryWatchTitle(item, locale),
            date: formatRegulatoryWatchDate(
              item.updated_at ?? item.created_at,
              locale,
            ),
            tag: resolveRegulatoryWatchTag(item, locale),
            href: slug ? `/${locale}/regulasi-institusi/${slug}` : undefined,
          };
        })
      : messages.regulatoryWatch.items.map((item) => ({
          key: item.key,
          title: item.title,
          date: item.date,
          tag: item.tag,
          href: undefined,
        }));

  return (
    <Card as="section">
      <SectionHeader
        title={messages.regulatoryWatch.title}
        link={`/${locale}/regulasi-institusi`}
        linkLabel={messages.regulatoryWatch.ctaLabel}
      />
      <div className="flex flex-col gap-4 px-4 py-4">
        {items.map((item) => (
          <ListItem
            key={item.key}
            title={item.title}
            date={item.date}
            tag={item.tag}
            actionLabel={messages.regulatoryWatch.actionLabel}
            href={item.href}
          />
        ))}
      </div>
    </Card>
  );
}
