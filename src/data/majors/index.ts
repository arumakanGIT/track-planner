import { MajorConfig } from '../../types';

export function getSupportedDepartments(majors: MajorConfig[]) {
  const departmentsMap = new Map<string, { id: string; titleFa: string; titleEn: string; majors: MajorConfig[] }>();

  majors.forEach((major) => {
    const dep = major.department;
    if (!departmentsMap.has(dep.id)) {
      departmentsMap.set(dep.id, { ...dep, majors: [] });
    }
    departmentsMap.get(dep.id)!.majors.push(major);
  });

  return Array.from(departmentsMap.values());
}

