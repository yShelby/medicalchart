import type { Assessment, Patient, Visit } from "./types";

export const PATIENTS: Patient[] = [
  { id: "PT-240001", name: "김민수", age: 58, gender: "남", dob: "1966.03.12", phone: "010-4521-9873", bloodType: "A+", allergies: ["리튬 (부작용: 진전)"], insurance: "건강보험", primaryDx: "주요우울장애 (재발성, 중등도)", lastVisit: "2026.07.28", guardian: "김영희 (배우자)", status: "waiting" },
  { id: "PT-240002", name: "박지영", age: 34, gender: "여", dob: "1992.05.17", phone: "010-3312-6640", bloodType: "O+", allergies: [], insurance: "건강보험", primaryDx: "양극성 장애 I형 (현재 우울 삽화)", lastVisit: "2026.08.01", guardian: "박성호 (부친)", status: "waiting" },
  { id: "PT-240003", name: "이재훈", age: 29, gender: "남", dob: "1997.02.10", phone: "010-7788-2234", bloodType: "B+", allergies: ["할로페리돌 (추체외로 반응)"], insurance: "의료급여 1종", primaryDx: "조현병 (편집형)", lastVisit: "2026.07.22", guardian: "이미경 (모친)", status: "done" },
  { id: "PT-240004", name: "최수연", age: 27, gender: "여", dob: "1999.06.30", phone: "010-9901-5543", bloodType: "AB+", allergies: [], insurance: "건강보험", primaryDx: "범불안장애 (GAD)", lastVisit: "2026.08.04", guardian: "-", status: "done" },
];

export const VISITS: Record<string, Visit[]> = {
  "PT-240001": [
    {
      id: "V240728-001", date: "2026.07.28", doctor: "정소현(의사)",
      cc: "무기력, 수면 과다, 의욕 상실 지속",
      s: "지난 4주간 거의 매일 무기력감과 과수면(하루 12시간 이상) 호소. 식욕 감퇴로 체중 3kg 감소. 집중력 저하로 직장 업무 어려움. 자살사고: '살고 싶지 않다'는 생각은 있으나 구체적 계획은 없음.",
      o: [
        { category: "외모/행동", value: "위생 다소 불량, 눈 맞춤 적음" },
        { category: "기분", value: "\"우울하고 지쳐있어요\"" },
        { category: "정동", value: "제한됨, 반응성 저하" },
        { category: "사고", value: "느린 사고 흐름, 비관적 내용" },
        { category: "병식", value: "부분적 (병식 있으나 치료 동기 낮음)" },
      ],
      a: "주요우울장애 재발성 중등도 (F33.1). 자살위험도: 낮음-중등도. 기능 저하 뚜렷함.",
      p: "에스시탈로프람 10mg → 20mg 증량. 수면 위생 교육. 인지행동치료 의뢰. 2주 후 재진.",
      notes: "보호자(배우자) 면담 실시. 직장 병가 2주 권고. 자살위험 안전계획 교육 완료.",
      risk: "moderate",
      dx: ["F33.1 주요우울장애 재발성 중등도"],
      meds: ["에스시탈로프람 20mg 1T qd (아침)", "미르타자핀 15mg 1T qhs"],
    },
    {
      id: "V240615-001", date: "2026.06.15", doctor: "정소현(의사)",
      cc: "기분 저하 지속, 치료 시작 후 6주 경과",
      s: "약물 복용 6주차. 수면 약간 개선. 기분 저하, 무기력 지속. 자살사고 없음. 직장 복귀 아직 어려운 상태.",
      o: [
        { category: "기분", value: "\"그냥 그래요, 조금 나아진 것 같기도 하고\"" },
        { category: "정동", value: "다소 제한, 간헐적 미소 가능" },
        { category: "병식", value: "양호" },
      ],
      a: "주요우울장애 재발성 중등도, 부분 반응 중. 자살위험도: 낮음.",
      p: "에스시탈로프람 10mg 유지. 운동 처방 (유산소 30분/일). 1개월 후 재진.",
      risk: "low",
      dx: ["F33.1 주요우울장애 재발성 중등도"],
      meds: ["에스시탈로프람 10mg 1T qd (아침)"],
    },
  ],
  "PT-240002": [
    {
      id: "V240801-001", date: "2026.08.01", doctor: "정소현(의사)",
      cc: "우울 삽화 지속, 과민성 증가",
      s: "3주간 지속되는 우울감, 과민성. 수면 감소(4-5시간), 충동적 소비 행동. 에너지 증가 없음. 자살사고: 부인.",
      o: [
        { category: "기분", value: "\"예민하고 우울해요\"" },
        { category: "정동", value: "불안정, 과민함" },
        { category: "사고", value: "반추 사고, 자기비난적 내용" },
        { category: "병식", value: "양호" },
      ],
      a: "양극성 장애 I형, 현재 우울 삽화 (F31.3). 자살위험도: 낮음. 조증 전환 모니터링 필요.",
      p: "라모트리진 100mg → 150mg 증량. 기분 일지 작성 지도. 2주 후 재진.",
      notes: "보호자(부친) 전화 상담. 충동 소비에 대해 가족 지지 교육 실시.",
      risk: "low",
      dx: ["F31.3 양극성 장애 I형 현재 우울 삽화"],
      meds: ["라모트리진 150mg 1T qd", "쿠에티아핀 50mg 1T qhs", "클로나제팜 0.5mg 1T prn"],
    },
  ],
  "PT-240003": [
    {
      id: "V240722-001", date: "2026.07.22", doctor: "정소현(의사)",
      cc: "환청 지속, 외출 거부",
      s: "피해사고 지속. 명령형 환청 주 2-3회. 약 복용은 모친이 확인 시 가능. 자살사고: 부인하나 신뢰도 낮음.",
      o: [
        { category: "외모/행동", value: "눈 맞춤 회피, 경계적" },
        { category: "행동", value: "긴장, 의자 끝에 앉음" },
        { category: "사고", value: "피해사고, 관계사고" },
        { category: "지각/환각", value: "환청 지속 (명령형, 3인칭)" },
        { category: "병식", value: "불량 (병식 없음)" },
      ],
      a: "조현병 편집형 (F20.0), 부분 반응. 자살위험도: 낮음-중등도. 입원 치료 논의.",
      p: "리스페리돈 4mg → 6mg 증량. 보호자 교육 강화. LAI 전환 논의. 2주 후 재진.",
      notes: "모친 별도 면담. LAI 전환 동의 미획득. 증상 악화 시 즉시 내원 교육.",
      risk: "moderate",
      dx: ["F20.0 조현병 편집형"],
      meds: ["리스페리돈 6mg 1T qhs", "비페리덴 2mg 1T bid (EPS 예방)", "로라제팜 1mg 1T prn"],
    },
  ],
  "PT-240004": [
    {
      id: "V240804-001", date: "2026.08.04", doctor: "정소현(의사)",
      cc: "과도한 걱정, 신체 긴장, 집중력 저하",
      s: "직장 평가 시즌 이후 불안 악화. 근육 긴장(어깨, 목), 수면 입면 어려움. 공황 발작 최근 없음. 자살사고: 없음.",
      o: [
        { category: "기분", value: "\"걱정이 끊이지 않아요\"" },
        { category: "정동", value: "불안, 긴장된" },
        { category: "행동", value: "안절부절못함" },
        { category: "병식", value: "양호" },
      ],
      a: "범불안장애 (F41.1). 자살위험도: 없음. 직업 스트레스 유발 요인.",
      p: "에스시탈로프람 10mg 유지. 이완 훈련 교육. CBT 지속. 4주 후 재진.",
      risk: "low",
      dx: ["F41.1 범불안장애"],
      meds: ["에스시탈로프람 10mg 1T qd (아침)", "부스피론 10mg 1T bid"],
    },
  ],
};

export const ASSESSMENTS: Record<string, Assessment[]> = {
  "PT-240001": [
    { date: "2026.07.28", scale: "PHQ-9", score: 18, max: 27, interpretation: "중등도 우울 (Moderately Severe)", trend: "up" },
    { date: "2026.06.15", scale: "PHQ-9", score: 14, max: 27, interpretation: "중등도 우울 (Moderate)", trend: "stable" },
    { date: "2026.07.28", scale: "BDI-II", score: 29, max: 63, interpretation: "중등도 우울 (Moderate)", trend: "up" },
    { date: "2026.07.28", scale: "CGI-S", score: 4, max: 7, interpretation: "중등도 이상 (Moderately Ill)", trend: "up" },
    { date: "2026.07.28", scale: "Columbia 자살위험평가", score: 2, max: 5, interpretation: "저위험-중등위험", trend: "stable" },
  ],
  "PT-240002": [
    { date: "2026.08.01", scale: "PHQ-9", score: 16, max: 27, interpretation: "중등도 이상 우울", trend: "up" },
    { date: "2026.08.01", scale: "MDQ (조증선별)", score: 3, max: 13, interpretation: "음성 (조증 기준 미달)", trend: "stable" },
    { date: "2026.08.01", scale: "YMRS", score: 6, max: 60, interpretation: "조증 증상 미미", trend: "down" },
    { date: "2026.08.01", scale: "CGI-S", score: 4, max: 7, interpretation: "중등도 (Moderately Ill)", trend: "stable" },
  ],
  "PT-240003": [
    { date: "2026.07.22", scale: "PANSS 양성", score: 24, max: 49, interpretation: "중등도 (Moderate)", trend: "stable" },
    { date: "2026.07.22", scale: "PANSS 음성", score: 18, max: 49, interpretation: "경도-중등도", trend: "up" },
    { date: "2026.07.22", scale: "BPRS", score: 48, max: 126, interpretation: "중등도 증상", trend: "stable" },
    { date: "2026.07.22", scale: "CGI-S", score: 5, max: 7, interpretation: "중증 (Markedly Ill)", trend: "stable" },
  ],
  "PT-240004": [
    { date: "2026.08.04", scale: "GAD-7", score: 14, max: 21, interpretation: "중등도 불안 (Moderate)", trend: "down" },
    { date: "2026.08.04", scale: "PHQ-9", score: 7, max: 27, interpretation: "경도 우울 (Mild)", trend: "down" },
    { date: "2026.08.04", scale: "STAI-상태불안", score: 58, max: 80, interpretation: "높음", trend: "down" },
    { date: "2026.08.04", scale: "CGI-S", score: 3, max: 7, interpretation: "경도-중등도 (Mildly Ill)", trend: "down" },
  ],
};

export const AI_INTROS: Record<string, string> = {
  "PT-240001": "**김민수** 환자(PT-240001) 차트를 분석했습니다.\n\n**증상 기록:**\n• 07월 28일 — 무기력, 수면 과다(12시간+), 의욕 상실, 자살사고 보고\n• 06월 15일 — 수면 다소 개선, 기분 저하·무기력 지속\n\n**약물 처방:**\n• 07월 28일 — 에스시탈로프람 10→20mg 증량, 미르타자핀 15mg 추가\n• 06월 15일 — 에스시탈로프람 10mg 유지\n\n**심리평가:**\n• 07월 28일 — PHQ-9 18점, BDI-II 29점, CGI-S 4점\n• 06월 15일 — PHQ-9 14점\n\n무엇이 궁금하신가요?",
  "PT-240002": "**박지영** 환자(PT-240002) 차트를 분석했습니다.\n\n**증상 기록:**\n• 08월 01일 — 우울감, 과민성, 수면 감소(4-5시간), 충동적 소비\n\n**약물 처방:**\n• 08월 01일 — 라모트리진 100→150mg 증량, 쿠에티아핀·클로나제팜 유지\n\n**심리평가:**\n• 08월 01일 — PHQ-9 16점, YMRS 6점, CGI-S 4점\n\n무엇이 궁금하신가요?",
  "PT-240003": "**이재훈** 환자(PT-240003) 차트를 분석했습니다.\n\n**증상 기록:**\n• 07월 22일 — 피해사고, 명령형 환청 주 2-3회, 외출 거부\n\n**약물 처방:**\n• 07월 22일 — 리스페리돈 4→6mg 증량, 비페리덴·로라제팜 유지\n\n**심리평가:**\n• 07월 22일 — PANSS 양성 24점, BPRS 48점, CGI-S 5점\n\n무엇이 궁금하신가요?",
  "PT-240004": "**최수연** 환자(PT-240004) 차트를 분석했습니다.\n\n**증상 기록:**\n• 08월 04일 — 과도한 걱정, 근육 긴장, 수면 입면 장애\n\n**약물 처방:**\n• 08월 04일 — 에스시탈로프람 10mg 유지, 부스피론 10mg bid\n\n**심리평가:**\n• 08월 04일 — GAD-7 14점, PHQ-9 7점, CGI-S 3점\n\n무엇이 궁금하신가요?",
  "default": "환자를 선택하시면 차트 기반 임상 요약을 제공해 드립니다.",
};

export const AI_RESPONSES: Record<string, string> = {
  "자살": "**자살위험도 평가 요약:**\nColumbia 자살위험평가 기준으로 분류되어 있습니다.\n\n권장 조치:\n• 매 방문 시 자살사고/계획/의도 직접 평가\n• 가정 내 치명적 수단 제한\n• 안전 계획(Safety Plan) 작성 고려\n• 필요 시 집중 외래 또는 입원 치료",
  "약": "**현재 처방 분석:**\n처방 약물의 용량, 상호작용, 부작용을 확인했습니다.\n\n유의 사항:\n• 에스시탈로프람 증량 후 2주 내 불안/불면 일시 악화 가능\n• 초기 2주 모니터링 강화 권장\n\n특정 약물에 대해 추가 질문 있으신가요?",
  "검사": "**평가척도 해석:**\n추적 권장 척도:\n• 매월: PHQ-9, CGI-S\n• 분기: BDI-II, 자살위험평가\n• 필요 시: MMSE, 신경심리검사",
};

export function getAIResponse(input: string): string {
  for (const [key, val] of Object.entries(AI_RESPONSES)) {
    if (input.includes(key)) return val;
  }
  return "해당 내용을 분석 중입니다. 임상 요약, 약물 정보, 검사 결과 해석 등을 도와드릴 수 있습니다. 더 구체적으로 질문해 주시겠어요?";
}
