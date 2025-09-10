/* eslint-disable @typescript-eslint/no-unused-vars */
type PivotItem<T, R extends keyof T> = T[R] extends Array<infer U> ? U : never;
type InnerOf<T, R extends keyof T, N extends keyof PivotItem<T, R>> = PivotItem<
  T,
  R
>[N];

export function flattenManyToMany<
  T extends Record<string, any>,
  R extends keyof T,
  N extends keyof PivotItem<T, R>,
  OutKey extends string,
>(
  rows: T[],
  relationKey: R,
  nestedKey: N,
  outKey: OutKey,
  dedupeBy?: keyof InnerOf<T, R, N> & string,
) {
  type PI = PivotItem<T, R>;
  type Inner = InnerOf<T, R, N>;

  return rows.map((row) => {
    const pivot = ((row as any)[relationKey] as PI[] | undefined) ?? [];
    const items = pivot.map((p) => (p as any)[nestedKey]) as Inner[];

    const normalized =
      dedupeBy && items.length
        ? Array.from(
            new Map(
              (items as any[]).map((it) => [it?.[dedupeBy], it]),
            ).values(),
          )
        : items;

    const { [relationKey]: _, ...rest } = row as any;

    return {
      ...(rest as Omit<T, R>),
      [outKey]: normalized,
    } as Omit<T, R> & Record<OutKey, Inner[]>;
  });
}
