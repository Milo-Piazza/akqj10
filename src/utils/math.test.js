import {choose} from "./math";

test("Test n choose k base cases", () => {
    expect(choose(0, 0)).toBe(1);
    expect(choose(5, 0)).toBe(1);
    expect(choose(5, 5)).toBe(1);
})

test("Test n choose k recursive cases", () => {
    expect(choose(5, 2)).toBe(10);
    expect(choose(8, 2)).toBe(28);
    expect(choose(8, 5)).toBe(56);
    expect(choose(8, 3)).toBe(56);
    expect(choose(8, 1)).toBe(8);
})