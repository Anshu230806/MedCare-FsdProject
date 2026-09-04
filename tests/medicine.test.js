import { describe, test, expect } from "vitest";

function isMedicineScheduled(medicine) {
    return Boolean(medicine.active && medicine.time);
}

describe("Medicine scheduling logic", () => {

    test("identifies an active medicine with a scheduled time", () => {
        const medicine = {
            id: "m1",
            name: "Metformin",
            active: true,
            time: "08:00"
        };

        expect(isMedicineScheduled(medicine)).toBe(true);
    });

});