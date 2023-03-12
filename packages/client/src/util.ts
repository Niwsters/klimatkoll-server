const dict = <T>(list: T[], param: (item: T) => any) => list.reduce((dict, item) => ({ ...dict, [param(item)]: item }), {})
export const equijoin = <T1,T2>(a: T1[], b: T2[], paramA: (a: T1) => any, paramB: (b: T2) => any): (T1 & T2)[] => {
  const dictB = dict(b, paramB)
  return a.map(a => ({
      ...a,
      ...dictB[paramA(a)]
  }))
}
