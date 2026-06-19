/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppTheme = 'vibrant-palette' | 'glassmorphism' | 'pastel' | 'dark-neon' | 'minimal-white';

export type MoodMode = 'single' | 'dual' | 'triple';

export interface VisualEffects {
  wave: boolean;
  spark: boolean;
  glow: boolean;
  dynamicBg: boolean;
}

export interface MoodRecord {
  id: string;
  date: string;
  time: string;
  overallScore: number;
  scores: Record<string, number>;
  notes: string;
  theme: AppTheme;
  mode: MoodMode;
}

export interface MetricConfig {
  key: string;
  label: string;
  minLabel: string;
  maxLabel: string;
  colorClass: string;
  icon: string;
}

// Encouragement messages based on the battery level
export const CHEER_MESSAGES = {
  critical: [
    { title: "위험! 긴급 충전 필요 🚨", description: "에너지가 고갈 직전이에요. 지금 하고 있는 일을 멈추고 10분만 깊게 호흡해볼까요?" },
    { title: "기프티콘을 나에게 🎁", description: "오늘 고생한 나에게 작은 디저트나 평소 아끼던 음료를 선물해보세요." },
    { title: "괜찮아요, 그럴 수 있어요 🫂", description: "매일 100%일 수는 없답니다. 오늘은 휴식이 최우선 행동 수칙이에요." },
    { title: "가벼운 산책 어때요? 🚶", description: "스마트폰을 두고 5분만 바깥 바람을 쐬고 오세요. 환기가 큰 도움이 됩니다." }
  ],
  low: [
    { title: "절전 모드 가동 중 🔋", description: "조금 조용히 내면을 들여다볼 타이밍. 따뜻한 차 한 잔 마셔보는 건 어떨까요?" },
    { title: "나만을 위한 Playlist 🎧", description: "가장 좋아하는 음악을 들으며 마음의 긴장을 한 단계 풀어주세요." },
    { title: "스트레칭 1분 🧘", description: "뭉친 어깨와 목을 천천히 돌리며 몸에 신선한 산소를 공급해주세요." },
    { title: "오늘 하루는 쉼표 쉼표 ,", description: "마사지를 하거나 일찍 눈을 붙여 수면 충전 상태로 진입하는 것을 권장합니다." }
  ],
  moderate: [
    { title: "안정적인 하프 오렌지 ⚖️", description: "무난무난한 하루! 나쁘지도 좋지도 않은 평온함 속에서 잔잔한 행복을 찾아봐요." },
    { title: "잘 흐르고 있어요 🌊", description: "평화로운 이 순간을 있는 그대로 즐겨도 좋습니다. 일상적인 대화가 힘이 돼요." },
    { title: "작품 감상하기 🎬", description: "짧은 유튜브 예능이나 평소 눈여겨보던 북마크 글을 읽으며 리프레시하세요." },
    { title: "소소한 성취 한 개 📝", description: "책상 정리나 메일함 비우기 같은 작은 미션을 달성하고 성취감을 더해보세요." }
  ],
  good: [
    { title: "활력 넘치는 쾌적 수치! ⚡", description: "기분이 아주 상쾌하군요! 주위 사람에게 긍정 에너지를 가볍게 나눠주세요." },
    { title: "러닝 타임 🏃‍♂️", description: "이 넘치는 기운을 모아 가벼운 운동을 하거나, 미뤄둔 일거리를 가볍게 해결해보세요." },
    { title: "해피 드링크 타임 🍹", description: "즐겁게 웃고 수다 떨며 기분 좋은 흐름을 더 오래 유지해보는 건 어떨까요?" },
    { title: "창의력 폭발 시기 🎨", description: "좋은 아이디어가 떠오르기 쉬운 기분이에요. 메모지를 열고 끄적여보세요." }
  ],
  excellent: [
    { title: "부스터 온! 완전 충전! 🌟", description: "최상의 감정 충전 완료! 오늘 해야 할 모험을 즐겁게 시작할 최적의 타이밍입니다!" },
    { title: "슈퍼스타 탄생 🎬", description: "자신감과 행복감이 충만한 상태군요. 오늘 이 순간을 사진이나 기억으로 꼭 구워두세요!" },
    { title: "도전하기 딱 좋은 날 🏔️", description: "망설이던 일이 있다면 바로 오늘 시도해보세요. 성공 확률이 훌쩍 솟아오릅니다!" },
    { title: "기록의 중요성 ✍️", description: "이 멋진 감정을 일기장에 생동감 있게 적어두고, 나중에 고갈되었을 때 꺼내보세요!" }
  ]
};

export function getCheerMessage(score: number): { title: string; description: string } {
  let list = CHEER_MESSAGES.moderate;
  if (score <= 20) {
    list = CHEER_MESSAGES.critical;
  } else if (score <= 50) {
    list = CHEER_MESSAGES.low;
  } else if (score <= 75) {
    list = CHEER_MESSAGES.moderate;
  } else if (score <= 90) {
    list = CHEER_MESSAGES.good;
  } else {
    list = CHEER_MESSAGES.excellent;
  }
  
  // Pick an item deterministically or randomly. We will pick based on the floor division of score
  const index = Math.floor(score * 13) % list.length;
  return list[index];
}

// Emotional messages/sayings for daily motivational notes
export const MOTIVATIONAL_QUOTES = [
  "감정은 날씨와 같아요. 흐린 날 뒤에는 언제나 쾌청한 맑은 날이 찾아옵니다.",
  "가장 중요한 것은 지금 이 순간 당신의 에너지를 소중히 다루는 일입니다.",
  "배터리가 고갈되어 잠시 꺼져도, 다시 꼽으면 언제든 밝게 살아날 수 있어요.",
  "기분이 태도가 되지 않도록, 나의 배터리 상태를 고요히 인지하는 연습.",
  "나의 행복을 충전하는 최고의 충전기는 휴식, 그리고 소박한 감사함입니다."
];
