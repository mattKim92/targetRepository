/**
 * 외부 CRM 연동 클라이언트
 * POC에서는 Mock 데이터를 반환합니다.
 * 프로덕션에서는 실제 CRM API로 교체합니다.
 */

export interface CrmCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  gender?: "M" | "F";
  region?: string;
  grade?: string; // VIP, GOLD, SILVER, NORMAL
  lastPurchaseDate?: string;
  totalSpent?: number;
  visitCount?: number;
  tags?: string[];
  optedOut?: boolean; // 수신거부 여부
}

// Mock 고객 데이터
const MOCK_CUSTOMERS: CrmCustomer[] = [
  { id: "c1", name: "김철수", phone: "01012345678", age: 35, gender: "M", region: "서울", grade: "VIP", lastPurchaseDate: "2026-03-20", totalSpent: 500000, visitCount: 15, tags: ["electronics"], optedOut: false },
  { id: "c2", name: "이영희", phone: "01023456789", age: 28, gender: "F", region: "경기", grade: "GOLD", lastPurchaseDate: "2026-04-01", totalSpent: 250000, visitCount: 8, tags: ["fashion"], optedOut: false },
  { id: "c3", name: "박민수", phone: "01034567890", age: 42, gender: "M", region: "부산", grade: "SILVER", lastPurchaseDate: "2025-12-15", totalSpent: 120000, visitCount: 3, tags: ["food"], optedOut: false },
  { id: "c4", name: "정수진", phone: "01045678901", age: 31, gender: "F", region: "서울", grade: "VIP", lastPurchaseDate: "2026-03-28", totalSpent: 800000, visitCount: 22, tags: ["fashion", "beauty"], optedOut: false },
  { id: "c5", name: "최동현", phone: "01056789012", age: 25, gender: "M", region: "인천", grade: "NORMAL", lastPurchaseDate: "2026-01-10", totalSpent: 50000, visitCount: 2, tags: ["electronics"], optedOut: true },
  { id: "c6", name: "한미영", phone: "01067890123", age: 38, gender: "F", region: "서울", grade: "GOLD", lastPurchaseDate: "2026-02-20", totalSpent: 300000, visitCount: 10, tags: ["beauty"], optedOut: false },
  { id: "c7", name: "윤상호", phone: "01078901234", age: 45, gender: "M", region: "경기", grade: "SILVER", lastPurchaseDate: "2026-03-05", totalSpent: 180000, visitCount: 5, tags: ["sports"], optedOut: false },
  { id: "c8", name: "송지은", phone: "01089012345", age: 29, gender: "F", region: "대전", grade: "NORMAL", lastPurchaseDate: "2025-11-30", totalSpent: 30000, visitCount: 1, tags: ["food"], optedOut: false },
  { id: "c9", name: "임재혁", phone: "01090123456", age: 33, gender: "M", region: "서울", grade: "VIP", lastPurchaseDate: "2026-04-05", totalSpent: 650000, visitCount: 18, tags: ["electronics", "sports"], optedOut: false },
  { id: "c10", name: "오하나", phone: "01001234567", age: 27, gender: "F", region: "경기", grade: "GOLD", lastPurchaseDate: "2026-03-15", totalSpent: 200000, visitCount: 7, tags: ["fashion", "beauty"], optedOut: false },
];

/**
 * CRM에서 전체 고객 목록을 가져옵니다.
 * 프로덕션에서는 실제 API 호출로 교체합니다.
 */
export async function fetchAllCustomers(): Promise<CrmCustomer[]> {
  // TODO: 실제 CRM API 호출로 교체
  // const res = await fetch(`${CRM_API_URL}/customers`, { headers: { Authorization: `Bearer ${CRM_TOKEN}` } });
  // return res.json();
  return MOCK_CUSTOMERS;
}

/**
 * 수신거부된 고객을 제외합니다.
 */
export function filterOptedOut(customers: CrmCustomer[]): CrmCustomer[] {
  return customers.filter((c) => !c.optedOut);
}
