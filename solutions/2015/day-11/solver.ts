const available = "abcdefghjkmnpqrstuvwxyz".split("");

function nextPassword(old: string) {
  const chars = old.split("").reverse();

  for (let i = 0, carry = true; carry; i++) {
    chars[i] = available[available.indexOf(chars[i]) + 1] || available[0];
    carry = chars[i] === available[0];
  }

  return chars.reverse().join("");
}

function isInvalid(password: string) {
  const chars = password.split("");
  const pairs = password.match(/([a-z])\1/g);
  if (!pairs || pairs.length < 2) return true;

  return !chars
    .map((it) => it.charCodeAt(0))
    .some((value, index, all) => {
      if (index < 2) return false;
      return (
        all[index - 2] + 1 === all[index - 1] && all[index - 1] + 1 === value
      );
    });
}

export function solvePart1(password: string) {
  while (isInvalid(password)) password = nextPassword(password);
  return password;
}
export function solvePart2(password: string) {
  password = solvePart1(password);
  password = nextPassword(password);
  return solvePart1(password);
}
