import type { Patient } from "../types";

export function PatientInfoTab({ patient }: { patient: Patient }) {
  const rows: { label: string; value: string }[] = [
    { label: "환자번호", value: patient.id },
    { label: "성명", value: patient.name },
    { label: "생년월일", value: patient.dob },
    { label: "성별", value: `${patient.gender}성 / ${patient.age}세` },
    { label: "연락처", value: patient.phone },
    { label: "혈액형", value: patient.bloodType },
    { label: "보험 유형", value: patient.insurance },
    { label: "보호자", value: patient.guardian },
    { label: "주 진단명", value: patient.primaryDx },
    { label: "최근 방문일", value: patient.lastVisit },
  ];

  return (
    <div className="p-5 max-w-2xl">
      <h2 className="text-[15px] font-semibold mb-3">기본 정보</h2>
      <div className="grid grid-cols-2 gap-2.5">
        {rows.map((item) => (
          <div key={item.label} className="border border-border p-3">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{item.label}</p>
            <p className="text-[13px]">{item.value}</p>
          </div>
        ))}
        <div className="col-span-2 border border-border p-3">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">약물 알레르기 / 부작용</p>
          {patient.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((a) => (
                <span key={a} className="text-[13px] bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded font-medium">{a}</span>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">기록된 알레르기 없음</p>
          )}
        </div>
      </div>
    </div>
  );
}
