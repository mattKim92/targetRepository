/**
 * 세그먼트 조건 빌더
 * JSON 기반 필터 조건으로 고객 목록을 필터링합니다.
 */

import type { CrmCustomer } from "./crm-client";

export type Operator = "AND" | "OR";
export type ComparisonOp = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains";

export interface FilterCondition {
  field: string;
  op: ComparisonOp;
  value: string | number | string[] | number[];
}

export interface SegmentFilter {
  operator: Operator;
  conditions: FilterCondition[];
}

/** 단일 조건을 고객에게 적용합니다 */
function matchCondition(
  customer: CrmCustomer,
  condition: FilterCondition
): boolean {
  const fieldValue = (customer as unknown as Record<string, unknown>)[condition.field];

  if (fieldValue === undefined || fieldValue === null) return false;

  switch (condition.op) {
    case "eq":
      return fieldValue === condition.value;
    case "neq":
      return fieldValue !== condition.value;
    case "gt":
      return (fieldValue as number) > (condition.value as number);
    case "gte":
      return (fieldValue as number) >= (condition.value as number);
    case "lt":
      return (fieldValue as number) < (condition.value as number);
    case "lte":
      return (fieldValue as number) <= (condition.value as number);
    case "in": {
      const arr = condition.value as (string | number)[];
      // 필드가 배열인 경우 (tags 등) 교집합 확인
      if (Array.isArray(fieldValue)) {
        return (fieldValue as (string | number)[]).some((v) => arr.includes(v));
      }
      return arr.includes(fieldValue as string | number);
    }
    case "contains":
      return String(fieldValue)
        .toLowerCase()
        .includes(String(condition.value).toLowerCase());
    default:
      return false;
  }
}

/** 세그먼트 필터를 고객 목록에 적용하여 대상자를 추출합니다 */
export function applySegmentFilter(
  customers: CrmCustomer[],
  filter: SegmentFilter
): CrmCustomer[] {
  return customers.filter((customer) => {
    const results = filter.conditions.map((cond) =>
      matchCondition(customer, cond)
    );

    if (filter.operator === "AND") {
      return results.every(Boolean);
    }
    return results.some(Boolean);
  });
}

/** 필터 JSON 문자열을 파싱합니다 */
export function parseFilter(filterJson: string): SegmentFilter {
  return JSON.parse(filterJson) as SegmentFilter;
}
