import { describe, test, expect } from "vitest";

// Test data that represents medication records from MedCare.
const medicationLogs = [
    {
        id: "l1",
        patientId: "u1",
        date: "2026-09-04",
        status: "taken"
    },
    {
        id: "l2",
        patientId: "u1",
        date: "2026-09-04",
        status: "taken"
    },
    {
        id: "l3",
        patientId: "u1",
        date: "2026-09-04",
        status: "missed"
    },
    {
        id: "l4",
        patientId: "u1",
        date: "2026-09-04",
        status: "pending"
    }
];

// Same business logic used by the MedCare application.
function adherenceFor(logs, pid) {
    const patientLogs = logs
        .filter(log => log.patientId === pid)
        .filter(log => log.status !== "pending");

    if (!patientLogs.length) return 0;

    return Math.round(
        patientLogs.filter(log => log.status === "taken").length /
        patientLogs.length *
        100
    );
}

describe("Medication adherence", () => {

    test("calculates adherence correctly", () => {
        // u1 has 2 taken and 1 missed completed doses.
        // Pending doses must not be included.
        expect(adherenceFor(medicationLogs, "u1")).toBe(67);
    });

    test("returns 0 when there are no completed doses", () => {
        // A patient with only pending doses has 0% adherence.
        const logs = [
            {
                id: "l5",
                patientId: "u2",
                date: "2026-09-04",
                status: "pending"
            }
        ];

        expect(adherenceFor(logs, "u2")).toBe(0);
    });

    test("does not include another patient's medication logs", () => {
        // u2's medication record must not affect u1's adherence.
        const logs = [
            ...medicationLogs,
            {
                id: "l6",
                patientId: "u2",
                date: "2026-09-04",
                status: "missed"
            }
        ];

        expect(adherenceFor(logs, "u1")).toBe(67);
    });


    test("rounds adherence percentage correctly", () => {
        const logs = [
            {
                id: "l10",
                patientId: "u1",
                date: "2026-09-04",
                status: "taken"
            },
            {
                id: "l11",
                patientId: "u1",
                date: "2026-09-04",
                status: "missed"
            },
            {
                id: "l12",
                patientId: "u1",
                date: "2026-09-04",
                status: "missed"
            }
        ];

        expect(adherenceFor(logs, "u1")).toBe(33);
    });

});