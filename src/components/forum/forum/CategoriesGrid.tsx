import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

type Forum = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  color: string;
  region?: string | null;
  birth_year?: number | null;
  play_level?: string | null;
  parent_category_id?: string | null;
};

interface Props {
  title: string;
  forums: Forum[];
  groupByCountry?: boolean;
}

const CANADA_ID = "11111111-1111-1111-1111-111111111111";
const USA_ID = "22222222-2222-2222-2222-222222222222";

export function CategoriesGrid({ title, forums, groupByCountry }: Props) {
  if (groupByCountry) {
    const canadianForums = forums.filter(
      (f) => f.parent_category_id === CANADA_ID
    );
    const usaForums = forums.filter((f) => f.parent_category_id === USA_ID);

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">{title}</h2>

        {canadianForums.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold border-b pb-1">Canada</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {canadianForums.map((f) => (
                <Link key={f.id} href={`/category/${f.slug}`}>
                  <Card className="p-4 hover:shadow transition h-full flex flex-col">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: f.color }}
                      />
                      <h3>{f.name || f.region}</h3>
                    </div>
                    {f.description && (
                      <p className="text-sm line-clamp-2">{f.description}</p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {usaForums.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold border-b pb-1">USA</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {usaForums.map((f) => (
                <Link key={f.id} href={`/category/${f.slug}`}>
                  <Card className="p-4 hover:shadow transition h-full flex flex-col">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: f.color }}
                      />
                      <h3>{f.name || f.region}</h3>
                    </div>
                    {f.description && (
                      <p className="text-sm line-clamp-2">{f.description}</p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default flat rendering
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {forums.map((f) => (
          <Link key={f.id} href={`/category/${f.slug}`}>
            <Card className="p-4 hover:shadow transition h-full flex flex-col">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: f.color }}
                />
                <h3>{f.name}</h3>
              </div>
              {f.description && (
                <p className="text-sm line-clamp-2">{f.description}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
