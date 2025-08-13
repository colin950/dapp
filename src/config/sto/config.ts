// 테스트넷 프록시 주소들 (환경변수에서 주입)
export const STO_TOKEN_ADDRESS: `0x${string}` | null =
  (import.meta.env.VITE_STO_TOKEN_ADDRESS as `0x${string}`) || null

export const STO_REGISTRY_ADDRESS: `0x${string}` | null =
  (import.meta.env.VITE_STO_REGISTRY_ADDRESS as `0x${string}`) || null

export const STO_VALIDATOR_ADDRESS: `0x${string}` | null =
  (import.meta.env.VITE_STO_VALIDATOR_ADDRESS as `0x${string}`) || null

// 파티션 (keccak256('FREETRADE'/'LOCKED'))
export const PARTITION_FREETRADE =
  '0xf2d149a9c49dcec790f17adcc040e83c6fb7d1ab92b079dc1c5dbd542e672e70'
export const PARTITION_LOCKED =
  '0x0ea86dcf7d9eccbba3438d8a3347f0e8a304c1ba5da8c94be8a1a8ad71b9a9e5'

// (선택) UI에서 이유코드 매핑용
export const REASON_MAP: Record<string, string> = {
  TRANSFER_OK: '전송 가능',
  NOT_WHITELISTED: '화이트리스트 아님',
  LOCKUP_ACTIVE: '락업 중',
  INSUFFICIENT_BALANCE: '잔액 부족',
  NO_VALIDATOR: '검증기 미설정',
}
