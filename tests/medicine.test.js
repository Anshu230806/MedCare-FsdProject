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


    test("does not schedule an inactive medicine", () => {
        const medicine = {
            id: "m2",
            name: "Vitamin D",
            active: false,
            time: "14:00"
        };

        expect(isMedicineScheduled(medicine)).toBe(false);
    });

});