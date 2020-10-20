export const sort = (lst: string[]): string[] => {
  // first convert strings to float numbers where 3G becomes 3.5
  const result = lst.map((item) => {
    let itemClone = item;
    if (item.endsWith("G")) {
      itemClone = item.replace("G", ".5");
    }
    const float = parseFloat(itemClone);
    if (isNaN(float)) return 666;
    return float;
  });
  result.sort((a, b) => a - b);
  // convert numbers back to strings where 3.5 becomes 3G
  return result
    .map((item) => item.toString())
    .map((item) => {
      if (item.includes(".5")) return item.replace(".5", "G");
      return item;
    });
};
