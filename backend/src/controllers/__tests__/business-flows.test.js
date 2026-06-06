import { jest } from "@jest/globals";

const queryMock = jest.fn();

jest.unstable_mockModule("../../config/database.js", () => ({
  query: queryMock,
}));

const { authorize } = await import("../../middleware/auth.middleware.js");
const { createComplaint } = await import("../user.controller.js");
const { createReview, replyReview } = await import("../review.controller.js");
const { updateComplaintStatus } = await import("../admin.controller.js");

const uuid = "11111111-1111-4111-8111-111111111111";
const otherUuid = "22222222-2222-4222-8222-222222222222";

const mockRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

const expectNextError = (next, status, code) => {
  expect(next).toHaveBeenCalledTimes(1);
  const err = next.mock.calls[0][0];
  expect(err.status).toBe(status);
  if (code) expect(err.code).toBe(code);
};

describe("business flow safeguards", () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  test("customer cannot access admin guarded handler", () => {
    const next = jest.fn();
    authorize("ADMIN")({ user: { role: "CUSTOMER" } }, mockRes(), next);
    expectNextError(next, 403, "FORBIDDEN");
  });

  test("partner cannot access admin guarded handler", () => {
    const next = jest.fn();
    authorize("ADMIN")({ user: { role: "PARTNER" } }, mockRes(), next);
    expectNextError(next, 403, "FORBIDDEN");
  });

  test("admin can access admin guarded handler", () => {
    const next = jest.fn();
    authorize("ADMIN")({ user: { role: "ADMIN" } }, mockRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  test("customer review requires owned issued voucher", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });
    const next = jest.fn();

    await createReview(
      { user: { id: "customer-1" }, body: { voucher_id: uuid, issued_voucher_id: otherUuid, rating: 5 } },
      mockRes(),
      next
    );

    expectNextError(next, 403, "FORBIDDEN");
  });

  test("customer review rejects duplicate review", async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: otherUuid, voucher_id: uuid, customer_id: "customer-1" }] })
      .mockResolvedValueOnce({ rows: [{ id: "review-1" }] });
    const next = jest.fn();

    await createReview(
      { user: { id: "customer-1" }, body: { voucher_id: uuid, issued_voucher_id: otherUuid, rating: 5 } },
      mockRes(),
      next
    );

    expectNextError(next, 409, "CONFLICT");
  });

  test("partner cannot reply review without approved partner profile", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });
    const next = jest.fn();

    await replyReview(
      { user: { id: "partner-user" }, params: { id: uuid }, body: { partner_reply: "Thanks" } },
      mockRes(),
      next
    );

    expectNextError(next, 403, "FORBIDDEN");
  });

  test("partner cannot reply review owned by another partner", async () => {
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: "partner-1" }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: uuid }] });
    const next = jest.fn();

    await replyReview(
      { user: { id: "partner-user" }, params: { id: uuid }, body: { partner_reply: "Thanks" } },
      mockRes(),
      next
    );

    expectNextError(next, 403, "FORBIDDEN");
  });

  test("partner reply review success writes audit log", async () => {
    const review = { id: uuid, voucher_id: otherUuid, partner_reply: "Thanks" };
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: "partner-1" }] })
      .mockResolvedValueOnce({ rows: [review] })
      .mockResolvedValueOnce({ rows: [] });
    const res = mockRes();

    await replyReview(
      { user: { id: "partner-user" }, params: { id: uuid }, body: { partner_reply: "Thanks" }, headers: {} },
      res,
      jest.fn()
    );

    expect(queryMock).toHaveBeenCalledTimes(3);
    expect(res.json).toHaveBeenCalledWith({ data: { review } });
  });

  test("customer complaint requires required fields", async () => {
    const next = jest.fn();

    await createComplaint({ user: { id: "customer-1" }, body: {} }, mockRes(), next);

    expectNextError(next, 400, "VALIDATION_FAILED");
  });

  test("customer complaint requires owned issued voucher", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });
    const next = jest.fn();

    await createComplaint(
      { user: { id: "customer-1" }, body: { issued_voucher_id: uuid, subject: "Issue", message: "Cannot use" } },
      mockRes(),
      next
    );

    expectNextError(next, 403, "FORBIDDEN");
  });

  test("customer complaint success returns created complaint", async () => {
    const complaint = { id: uuid, subject: "Issue", status: "PENDING" };
    queryMock
      .mockResolvedValueOnce({ rows: [{ id: uuid, voucher_id: otherUuid, order_id: "order-1" }] })
      .mockResolvedValueOnce({ rows: [complaint] });
    const res = mockRes();

    await createComplaint(
      { user: { id: "customer-1" }, body: { issued_voucher_id: uuid, subject: "Issue", message: "Cannot use" } },
      res,
      jest.fn()
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ data: { complaint } });
  });

  test("admin resolving complaint requires response", async () => {
    const next = jest.fn();

    await updateComplaintStatus(
      { user: { id: "admin-1" }, params: { id: uuid }, body: { status: "RESOLVED" } },
      mockRes(),
      next
    );

    expectNextError(next, 400, "VALIDATION_FAILED");
  });

  test("admin complaint update success writes audit log", async () => {
    const complaint = { id: uuid, status: "RESOLVED", admin_response: "Done" };
    queryMock
      .mockResolvedValueOnce({ rows: [complaint] })
      .mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const res = mockRes();

    await updateComplaintStatus(
      {
        user: { id: "admin-1" },
        params: { id: uuid },
        body: { status: "RESOLVED", admin_response: "Done" },
        headers: {},
      },
      res,
      jest.fn()
    );

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith({ data: { complaint } });
  });
});
