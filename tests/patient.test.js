import { describe, test, expect } from "vitest";

function getMedicinesForPatient(medicines, patientId) {
    return medicines.filter(
        medicine => medicine.patientId === patientId &&
            medicine.active !== false
    );
}

describe("Patient medicine logic", () => {

    test("returns only active medicines for the selected patient", () => {
        const medicines = [
            { id: "m1", patientId: "u1", active: true },
            { id: "m2", patientId: "u1", active: false },
            { id: "m3", patientId: "u2", active: true }
        ];

        const result = getMedicinesForPatient(medicines, "u1");

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe("m1");
    });

});