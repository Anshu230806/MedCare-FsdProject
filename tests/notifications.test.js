import { describe, test, expect } from "vitest";

function notificationsFor(notifications, userId) {
    return notifications.filter(
        notification => notification.userId === userId
    );
}

describe("Notification logic", () => {

    test("returns notifications only for the selected user", () => {
        const notifications = [
            { id: "n1", userId: "u1", text: "Medicine taken" },
            { id: "n2", userId: "u2", text: "Medicine missed" },
            { id: "n3", userId: "u1", text: "Next dose reminder" }
        ];

        const result = notificationsFor(notifications, "u1");

        expect(result).toHaveLength(2);
        expect(result.every(n => n.userId === "u1")).toBe(true);
    });

});